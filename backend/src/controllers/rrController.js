import db from '../models/dbAdapter.js';
import { recordAuditLog } from '../middleware/auditMiddleware.js';

export async function getRRCases(req, res) {
  try {
    const { project_id, status, search } = req.query;
    let sql = `
      SELECT r.*, f.family_head_name, f.family_head_aadhaar, f.family_members_count,
             f.social_category, f.bpl_card_holder, f.displacement_type, f.is_displaced,
             prj.name as project_name, prj.project_code,
             d.name as district_name
      FROM rr_cases r
      JOIN affected_families f ON r.family_id = f.id
      JOIN projects prj ON r.project_id = prj.id
      LEFT JOIN districts d ON f.district_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) {
      sql += ' AND r.project_id = ?';
      params.push(project_id);
    }
    if (status) {
      sql += ' AND r.overall_rr_status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (f.family_head_name LIKE ? OR r.resettlement_colony_name LIKE ? OR r.house_plot_number LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY r.created_at DESC';

    const cases = await db.query(sql, params);
    return res.json({ success: true, count: cases.length, cases });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAffectedFamilies(req, res) {
  try {
    const { project_id, district_id, is_displaced } = req.query;
    let sql = `
      SELECT f.*, prj.name as project_name, d.name as district_name
      FROM affected_families f
      JOIN projects prj ON f.project_id = prj.id
      LEFT JOIN districts d ON f.district_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) {
      sql += ' AND f.project_id = ?';
      params.push(project_id);
    }
    if (district_id) {
      sql += ' AND f.district_id = ?';
      params.push(district_id);
    }
    if (is_displaced !== undefined) {
      sql += ' AND f.is_displaced = ?';
      params.push(Number(is_displaced));
    }

    sql += ' ORDER BY f.id ASC';

    const families = await db.query(sql, params);
    return res.json({ success: true, count: families.length, families });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getRRSummary(req, res) {
  try {
    const familyCounts = await db.getOne(`
      SELECT
        COUNT(*) as total_families,
        SUM(CASE WHEN is_displaced = 1 THEN 1 ELSE 0 END) as displaced_families,
        SUM(CASE WHEN bpl_card_holder = 1 THEN 1 ELSE 0 END) as bpl_families,
        SUM(CASE WHEN social_category IN ('SC', 'ST') THEN 1 ELSE 0 END) as sc_st_families
      FROM affected_families
    `);

    const caseStats = await db.getOne(`
      SELECT
        COUNT(*) as total_cases,
        SUM(CASE WHEN overall_rr_status = 'RESETTLED' THEN 1 ELSE 0 END) as resettled_count,
        SUM(CASE WHEN house_allotment_status IN ('OCCUPIED', 'ALLOTTED') THEN 1 ELSE 0 END) as housing_allotted_count,
        SUM(CASE WHEN housing_grant_disbursed = 1 THEN housing_grant_amount ELSE 0 END) as housing_grants_disbursed,
        SUM(CASE WHEN resettlement_allowance_disbursed = 1 THEN one_time_resettlement_allowance ELSE 0 END) as allowances_disbursed,
        SUM(CASE WHEN skill_training_provided = 1 THEN 1 ELSE 0 END) as skilled_count
      FROM rr_cases
    `);

    const totalDisplaced = familyCounts.displaced_families || 1;
    const resettled = caseStats.resettled_count || 0;

    return res.json({
      success: true,
      summary: {
        totalAffectedFamilies: familyCounts.total_families || 0,
        totalDisplacedFamilies: familyCounts.displaced_families || 0,
        bplFamilies: familyCounts.bpl_families || 0,
        scStFamilies: familyCounts.sc_st_families || 0,
        rehabilitatedFamilies: resettled,
        resettlementRatePercent: Math.round((resettled / totalDisplaced) * 100),
        housingAllotted: caseStats.housing_allotted_count || 0,
        housingGrantsDisbursedLakhs: Number(((caseStats.housing_grants_disbursed || 0) / 100000).toFixed(2)),
        allowancesDisbursedLakhs: Number(((caseStats.allowances_disbursed || 0) / 100000).toFixed(2)),
        skillTrainedCount: caseStats.skilled_count || 0
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateRREntitlement(req, res) {
  try {
    const { id } = req.params;
    const {
      resettlement_colony_name, house_allotment_status, house_plot_number,
      housing_grant_disbursed, resettlement_allowance_disbursed,
      skill_training_provided, skill_course_name, overall_rr_status
    } = req.body;

    const rrCase = await db.getOne('SELECT * FROM rr_cases WHERE id = ?', [id]);
    if (!rrCase) {
      return res.status(404).json({ success: false, message: 'R&R case not found.' });
    }

    await db.run(
      `UPDATE rr_cases
       SET resettlement_colony_name = COALESCE(?, resettlement_colony_name),
           house_allotment_status = COALESCE(?, house_allotment_status),
           house_plot_number = COALESCE(?, house_plot_number),
           housing_grant_disbursed = COALESCE(?, housing_grant_disbursed),
           resettlement_allowance_disbursed = COALESCE(?, resettlement_allowance_disbursed),
           skill_training_provided = COALESCE(?, skill_training_provided),
           skill_course_name = COALESCE(?, skill_course_name),
           overall_rr_status = COALESCE(?, overall_rr_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        resettlement_colony_name, house_allotment_status, house_plot_number,
        housing_grant_disbursed, resettlement_allowance_disbursed,
        skill_training_provided, skill_course_name, overall_rr_status, id
      ]
    );

    await recordAuditLog({
      userId: req.user ? req.user.id : null,
      userName: req.user ? req.user.name : 'OFFICER',
      userRole: req.user ? req.user.role : 'LAND_AUTHORITY',
      action: 'UPDATE',
      entity: 'RR',
      entityId: id,
      previousValue: rrCase.overall_rr_status,
      newValue: `${overall_rr_status || rrCase.overall_rr_status} (Housing: ${house_allotment_status || rrCase.house_allotment_status})`,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'R&R case entitlement record updated successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
