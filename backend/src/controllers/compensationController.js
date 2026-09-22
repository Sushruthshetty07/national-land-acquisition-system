import { v4 as uuidv4 } from 'uuid';
import db from '../models/dbAdapter.js';
import { recordAuditLog } from '../middleware/auditMiddleware.js';

export async function getCompensationList(req, res) {
  try {
    const { project_id, status, search, limit } = req.query;
    let sql = `
      SELECT c.*, p.parcel_code, p.survey_number, p.village, p.area_ha, p.taluk,
             prj.name as project_name, prj.project_code,
             s.name as state_name, d.name as district_name
      FROM compensation c
      JOIN land_parcels p ON c.parcel_id = p.id
      JOIN projects prj ON p.project_id = prj.id
      LEFT JOIN states s ON p.state_id = s.id
      LEFT JOIN districts d ON p.district_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) {
      sql += ' AND p.project_id = ?';
      params.push(project_id);
    }
    if (status) {
      sql += ' AND c.payment_status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (c.beneficiary_name LIKE ? OR p.survey_number LIKE ? OR c.utr_number LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY c.created_at DESC';
    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }

    const items = await db.query(sql, params);
    return res.json({ success: true, count: items.length, compensation: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCompensationSummary(req, res) {
  try {
    const summary = await db.getOne(`
      SELECT
        COUNT(*) as total_records,
        SUM(total_assessed) as total_assessed_amount,
        SUM(total_disbursed) as total_disbursed_amount,
        SUM(solatium_amount) as total_solatium_amount,
        SUM(interest_amount) as total_interest_amount,
        SUM(CASE WHEN payment_status = 'DISBURSED' THEN 1 ELSE 0 END) as disbursed_count,
        SUM(CASE WHEN payment_status = 'PROCESSING' THEN 1 ELSE 0 END) as processing_count,
        SUM(CASE WHEN payment_status = 'TREASURY_ESCROW' THEN 1 ELSE 0 END) as escrow_count,
        SUM(CASE WHEN payment_status = 'ON_HOLD' THEN 1 ELSE 0 END) as on_hold_count
      FROM compensation
    `);

    return res.json({
      success: true,
      summary: {
        totalRecords: summary.total_records || 0,
        totalAssessedCr: Number(((summary.total_assessed_amount || 0) / 10000000).toFixed(2)),
        totalDisbursedCr: Number(((summary.total_disbursed_amount || 0) / 10000000).toFixed(2)),
        pendingDisbursementCr: Number((((summary.total_assessed_amount || 0) - (summary.total_disbursed_amount || 0)) / 10000000).toFixed(2)),
        totalSolatiumCr: Number(((summary.total_solatium_amount || 0) / 10000000).toFixed(2)),
        totalInterestCr: Number(((summary.total_interest_amount || 0) / 10000000).toFixed(2)),
        disbursementRate: Math.round(((summary.total_disbursed_amount || 0) / (summary.total_assessed_amount || 1)) * 100),
        disbursedCount: summary.disbursed_count || 0,
        processingCount: summary.processing_count || 0,
        escrowCount: summary.escrow_count || 0,
        onHoldCount: summary.on_hold_count || 0
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export function calculateAssessment(req, res) {
  try {
    const { areaHa, circleRatePerHa, locationType, structuresValue, treesValue, monthsSinceSec11 } = req.body;

    const area = Number(areaHa || 1.0);
    const circleRate = Number(circleRatePerHa || 4000000);
    // RFCTLARR 2013: Rural multiplier 1.25 to 2.0; Urban multiplier 1.0
    const isRural = locationType !== 'URBAN';
    const multiplier = isRural ? (Number(req.body.multiplier) || 1.5) : 1.0;

    const baseLandValue = Math.round(area * circleRate * multiplier);
    const assetsValue = Number(structuresValue || 0) + Number(treesValue || 0);
    
    // Solatium: 100% of market value of land + assets
    const solatiumAmount = Math.round(baseLandValue + assetsValue);

    // 12% per annum interest on market value under Section 30(3)
    const months = Number(monthsSinceSec11 || 12);
    const interestAmount = Math.round(baseLandValue * (0.12 * (months / 12)));

    const totalAward = baseLandValue + assetsValue + solatiumAmount + interestAmount;

    return res.json({
      success: true,
      calculation: {
        areaHa: area,
        circleRatePerHa: circleRate,
        multiplier,
        baseLandValue,
        structuresValue: Number(structuresValue || 0),
        treesValue: Number(treesValue || 0),
        solatiumAmount,
        solatiumPercentage: 100,
        interestAmount,
        interestRateAnnual: 12,
        monthsElapsed: months,
        totalAwardAmount: totalAward,
        statutoryReference: 'RFCTLARR Act 2013 (First Schedule, Sections 26, 27, 28, 29 & 30)'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function disburseBatch(req, res) {
  try {
    const { compensationIds, paymentMode, remarks } = req.body;
    if (!compensationIds || !Array.isArray(compensationIds) || compensationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one compensation beneficiary record.' });
    }

    const processed = [];
    const officerName = req.user ? req.user.name : 'Competent Authority';

    for (const cId of compensationIds) {
      const rec = await db.getOne('SELECT * FROM compensation WHERE id = ?', [cId]);
      if (rec) {
        const utr = `PFMS${new Date().getFullYear()}${Math.floor(10000000 + Math.random() * 90000000)}`;
        await db.run(
          `UPDATE compensation
           SET total_disbursed = total_assessed,
               payment_status = 'DISBURSED',
               payment_mode = ?,
               utr_number = ?,
               disbursement_date = CURRENT_DATE,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [paymentMode || 'DBT_PFMS', utr, cId]
        );

        // Update land parcel
        await db.run(
          `UPDATE land_parcels
           SET disbursed_compensation = assessed_compensation,
               acquisition_status = 'COMPENSATION_DISBURSEMENT',
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [rec.parcel_id]
        );

        processed.push({ id: cId, beneficiary: rec.beneficiary_name, amount: rec.total_assessed, utr });
      }
    }

    await recordAuditLog({
      userId: req.user ? req.user.id : null,
      userName: officerName,
      userRole: req.user ? req.user.role : 'LAND_AUTHORITY',
      action: 'DISBURSE',
      entity: 'COMPENSATION',
      entityId: `BATCH-${processed.length}`,
      newValue: `Disbursed DBT batch of ${processed.length} beneficiaries. Mode: ${paymentMode || 'DBT_PFMS'}. ${remarks || ''}`,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Successfully processed direct benefit transfer (DBT) for ${processed.length} beneficiaries.`,
      disbursedRecords: processed
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
