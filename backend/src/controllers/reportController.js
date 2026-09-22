import db from '../models/dbAdapter.js';

export async function getReportData(req, res) {
  try {
    const { reportType } = req.params;

    if (reportType === 'project-progress') {
      const data = await db.query(`
        SELECT
          p.project_code, p.name, p.project_type, p.implementing_agency,
          s.name as state, d.name as district,
          p.required_land_ha, p.acquired_land_ha, p.remaining_land_ha,
          p.budget_cr, p.compensation_budget_cr,
          p.current_stage, p.overall_status, p.risk_level, p.risk_score,
          p.start_date, p.expected_completion_date
        FROM projects p
        LEFT JOIN states s ON p.state_id = s.id
        LEFT JOIN districts d ON p.district_id = d.id
        ORDER BY p.created_at DESC
      `);
      return res.json({ success: true, title: 'National Project Progress Report', data });
    }

    if (reportType === 'state-wise') {
      const data = await db.query(`
        SELECT
          s.name as state, s.code, s.region,
          COUNT(p.id) as total_projects,
          COALESCE(SUM(p.required_land_ha), 0) as required_ha,
          COALESCE(SUM(p.acquired_land_ha), 0) as acquired_ha,
          COALESCE(SUM(p.remaining_land_ha), 0) as remaining_ha,
          ROUND((COALESCE(SUM(p.acquired_land_ha), 0) * 100.0) / NULLIF(COALESCE(SUM(p.required_land_ha), 1), 0), 1) as completion_pct,
          COALESCE(SUM(p.compensation_budget_cr), 0) as comp_budget_cr,
          SUM(CASE WHEN p.overall_status = 'DELAYED' THEN 1 ELSE 0 END) as delayed_count
        FROM states s
        LEFT JOIN projects p ON s.id = p.state_id
        GROUP BY s.id
        ORDER BY acquired_ha DESC
      `);
      return res.json({ success: true, title: 'State-wise Acquisition Performance Report', data });
    }

    if (reportType === 'district-wise') {
      const data = await db.query(`
        SELECT
          d.name as district, d.code, s.name as state, d.collector_name,
          COUNT(p.id) as projects_count,
          COALESCE(SUM(p.required_land_ha), 0) as required_ha,
          COALESCE(SUM(p.acquired_land_ha), 0) as acquired_ha,
          (SELECT COUNT(*) FROM land_parcels WHERE district_id = d.id) as surveyed_parcels,
          (SELECT COUNT(*) FROM land_parcels WHERE district_id = d.id AND possession_status = 'COMPLETED') as possession_taken_parcels
        FROM districts d
        JOIN states s ON d.state_id = s.id
        LEFT JOIN projects p ON d.id = p.district_id
        GROUP BY d.id
        ORDER BY s.name ASC, d.name ASC
      `);
      return res.json({ success: true, title: 'District-wise Land & Acquisition Audit Report', data });
    }

    if (reportType === 'compensation') {
      const data = await db.query(`
        SELECT
          c.id as comp_id, p.survey_number, p.village, p.area_ha,
          c.beneficiary_name, c.bank_name, c.payment_status,
          c.base_land_value, c.solatium_amount, c.interest_amount,
          c.total_assessed, c.total_disbursed,
          (c.total_assessed - c.total_disbursed) as pending_balance,
          c.payment_mode, c.utr_number, c.disbursement_date
        FROM compensation c
        JOIN land_parcels p ON c.parcel_id = p.id
        ORDER BY c.created_at DESC
      `);
      return res.json({ success: true, title: 'Compensation Assessment & DBT Disbursement Audit', data });
    }

    if (reportType === 'rr-status') {
      const data = await db.query(`
        SELECT
          f.id as family_id, f.family_head_name, f.family_members_count,
          f.social_category, f.displacement_type, f.is_displaced,
          r.resettlement_colony_name, r.house_allotment_status, r.house_plot_number,
          r.housing_grant_amount, r.housing_grant_disbursed,
          r.one_time_resettlement_allowance, r.resettlement_allowance_disbursed,
          r.skill_training_provided, r.skill_course_name, r.overall_rr_status
        FROM affected_families f
        LEFT JOIN rr_cases r ON f.id = r.family_id
        ORDER BY f.id ASC
      `);
      return res.json({ success: true, title: 'Rehabilitation and Resettlement (R&R) Family Dossier Report', data });
    }

    if (reportType === 'delayed-projects') {
      const data = await db.query(`
        SELECT
          p.project_code, p.name, p.implementing_agency, s.name as state,
          p.required_land_ha, p.acquired_land_ha, p.current_stage,
          p.risk_level, p.risk_score, p.expected_completion_date,
          (SELECT COUNT(*) FROM alerts WHERE project_id = p.id AND is_resolved = 0) as active_alerts_count
        FROM projects p
        LEFT JOIN states s ON p.state_id = s.id
        WHERE p.overall_status = 'DELAYED' OR p.risk_level = 'HIGH'
        ORDER BY p.risk_score DESC
      `);
      return res.json({ success: true, title: 'High-Risk & Delayed Infrastructure Projects SLA Report', data });
    }

    return res.status(400).json({ success: false, message: 'Invalid report type specified.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
