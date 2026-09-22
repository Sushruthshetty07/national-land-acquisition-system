import db from '../models/dbAdapter.js';

export async function getNationalSummary(req, res) {
  try {
    // 1. Projects KPIs
    const projectStats = await db.getOne(`
      SELECT
        COUNT(*) as total_projects,
        SUM(required_land_ha) as total_land_proposed_ha,
        SUM(acquired_land_ha) as total_land_acquired_ha,
        SUM(remaining_land_ha) as total_land_remaining_ha,
        SUM(budget_cr) as total_budget_cr,
        SUM(compensation_budget_cr) as total_compensation_budget_cr,
        SUM(CASE WHEN overall_status = 'DELAYED' THEN 1 ELSE 0 END) as delayed_projects_count,
        SUM(CASE WHEN overall_status = 'ON_TRACK' THEN 1 ELSE 0 END) as on_track_projects_count,
        SUM(CASE WHEN overall_status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_projects_count
      FROM projects
    `);

    // 2. Notifications & Awards KPIs
    const notifStats = await db.getOne("SELECT COUNT(*) as total_notifications FROM notifications WHERE status = 'ACTIVE'");
    const awardStats = await db.getOne('SELECT COUNT(*) as total_awards, SUM(total_award_amount) as total_awards_amount FROM awards');

    // 3. Compensation KPIs
    const compStats = await db.getOne(`
      SELECT
        COUNT(*) as total_beneficiaries,
        SUM(total_assessed) as total_compensation_assessed,
        SUM(total_disbursed) as total_compensation_disbursed,
        SUM(CASE WHEN payment_status = 'DISBURSED' THEN 1 ELSE 0 END) as fully_paid_count,
        SUM(CASE WHEN payment_status = 'PENDING' OR payment_status = 'TREASURY_ESCROW' THEN total_assessed - total_disbursed ELSE 0 END) as pending_compensation_amount
      FROM compensation
    `);

    // 4. Parcels & Possession KPIs
    const parcelStats = await db.getOne(`
      SELECT
        COUNT(*) as total_parcels,
        SUM(CASE WHEN possession_status = 'COMPLETED' THEN 1 ELSE 0 END) as possession_completed_count,
        SUM(CASE WHEN possession_status = 'DEMARCATED' THEN 1 ELSE 0 END) as possession_demarcated_count,
        SUM(CASE WHEN is_disputed = 1 THEN 1 ELSE 0 END) as disputed_parcels_count
      FROM land_parcels
    `);

    // 5. R&R KPIs
    const rrStats = await db.getOne(`
      SELECT
        COUNT(*) as total_affected_families,
        SUM(CASE WHEN is_displaced = 1 THEN 1 ELSE 0 END) as total_displaced_families
      FROM affected_families
    `);

    const rrResettled = await db.getOne(`
      SELECT
        COUNT(*) as total_rr_cases,
        SUM(CASE WHEN overall_rr_status = 'RESETTLED' THEN 1 ELSE 0 END) as rehabilitated_families_count,
        SUM(CASE WHEN house_allotment_status = 'OCCUPIED' OR house_allotment_status = 'ALLOTTED' THEN 1 ELSE 0 END) as houses_allotted_count,
        SUM(housing_grant_amount + one_time_resettlement_allowance) as total_rr_grants_sanctioned
      FROM rr_cases
    `);

    // 6. Active SLA Alerts
    const alertStats = await db.getOne(`
      SELECT
        COUNT(*) as total_active_alerts,
        SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical_alerts_count,
        SUM(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END) as high_alerts_count
      FROM alerts WHERE is_resolved = 0
    `);

    // 7. State-wise Breakdown
    const stateBreakdown = await db.query(`
      SELECT
        s.id, s.name, s.code, s.region,
        COUNT(p.id) as projects_count,
        COALESCE(SUM(p.required_land_ha), 0) as required_ha,
        COALESCE(SUM(p.acquired_land_ha), 0) as acquired_ha,
        COALESCE(SUM(p.compensation_budget_cr), 0) as compensation_cr,
        ROUND((COALESCE(SUM(p.acquired_land_ha), 0) * 100.0) / NULLIF(COALESCE(SUM(p.required_land_ha), 1), 0), 1) as completion_percentage
      FROM states s
      LEFT JOIN projects p ON s.id = p.state_id
      GROUP BY s.id
      ORDER BY acquired_ha DESC
    `);

    // 8. 12-Stage Lifecycle Distribution (Funnel)
    const stageDistribution = await db.query(`
      SELECT current_stage as stage, COUNT(*) as count
      FROM projects
      GROUP BY current_stage
    `);

    // 9. Project Type Distribution
    const projectTypeDistribution = await db.query(`
      SELECT project_type, COUNT(*) as count, SUM(budget_cr) as total_budget
      FROM projects
      GROUP BY project_type
    `);

    return res.json({
      success: true,
      kpis: {
        totalProjects: projectStats.total_projects || 0,
        landProposedHa: Math.round(projectStats.total_land_proposed_ha || 0),
        landAcquiredHa: Math.round(projectStats.total_land_acquired_ha || 0),
        landRemainingHa: Math.round(projectStats.total_land_remaining_ha || 0),
        acquisitionRatePercent: Math.round(((projectStats.total_land_acquired_ha || 0) / (projectStats.total_land_proposed_ha || 1)) * 100),
        totalBudgetCr: Math.round(projectStats.total_budget_cr || 0),
        compensationBudgetCr: Math.round(projectStats.total_compensation_budget_cr || 0),
        notificationsIssued: notifStats.total_notifications || 0,
        awardsDeclared: awardStats.total_awards || 0,
        compensationAssessedCr: Number(((compStats.total_compensation_assessed || 0) / 10000000).toFixed(2)),
        compensationDisbursedCr: Number(((compStats.total_compensation_disbursed || 0) / 10000000).toFixed(2)),
        disbursementRatePercent: Math.round(((compStats.total_compensation_disbursed || 0) / (compStats.total_compensation_assessed || 1)) * 100),
        possessionCompletedParcels: parcelStats.possession_completed_count || 0,
        totalParcels: parcelStats.total_parcels || 0,
        disputedParcels: parcelStats.disputed_parcels_count || 0,
        affectedFamilies: rrStats.total_affected_families || 0,
        displacedFamilies: rrStats.total_displaced_families || 0,
        rehabilitatedFamilies: rrResettled.rehabilitated_families_count || 0,
        delayedProjects: projectStats.delayed_projects_count || 0,
        activeAlerts: alertStats.total_active_alerts || 0,
        criticalAlerts: alertStats.critical_alerts_count || 0
      },
      stateBreakdown,
      stageDistribution,
      projectTypeDistribution
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getStateSummary(req, res) {
  try {
    const { stateId } = req.params;
    const state = await db.getOne('SELECT * FROM states WHERE id = ?', [stateId]);
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found.' });
    }

    const projects = await db.query('SELECT * FROM projects WHERE state_id = ?', [stateId]);
    const districts = await db.query(`
      SELECT d.*, COUNT(p.id) as projects_count,
             COALESCE(SUM(p.required_land_ha), 0) as required_ha,
             COALESCE(SUM(p.acquired_land_ha), 0) as acquired_ha
      FROM districts d
      LEFT JOIN projects p ON d.id = p.district_id
      WHERE d.state_id = ?
      GROUP BY d.id
    `, [stateId]);

    const parcels = await db.getOne(`
      SELECT COUNT(*) as total_parcels,
             SUM(CASE WHEN possession_status = 'COMPLETED' THEN 1 ELSE 0 END) as possession_completed
      FROM land_parcels WHERE state_id = ?
    `, [stateId]);

    return res.json({
      success: true,
      state,
      projects,
      districts,
      parcels
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
