import { v4 as uuidv4 } from 'uuid';
import db from '../models/dbAdapter.js';
import { recordAuditLog } from '../middleware/auditMiddleware.js';

export async function getProjects(req, res) {
  try {
    const { state_id, district_id, status, type, search } = req.query;
    let sql = `
      SELECT p.*, s.name as state_name, d.name as district_name,
             (SELECT COUNT(*) FROM land_parcels WHERE project_id = p.id) as total_parcels,
             (SELECT COUNT(*) FROM land_parcels WHERE project_id = p.id AND possession_status = 'COMPLETED') as completed_parcels
      FROM projects p
      LEFT JOIN states s ON p.state_id = s.id
      LEFT JOIN districts d ON p.district_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (state_id) {
      sql += ' AND p.state_id = ?';
      params.push(state_id);
    }
    if (district_id) {
      sql += ' AND p.district_id = ?';
      params.push(district_id);
    }
    if (status) {
      sql += ' AND p.overall_status = ?';
      params.push(status);
    }
    if (type) {
      sql += ' AND p.project_type = ?';
      params.push(type);
    }
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.project_code LIKE ? OR p.implementing_agency LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY p.created_at DESC';

    const projects = await db.query(sql, params);
    return res.json({ success: true, projects });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const project = await db.getOne(
      `SELECT p.*, s.name as state_name, d.name as district_name
       FROM projects p
       LEFT JOIN states s ON p.state_id = s.id
       LEFT JOIN districts d ON p.district_id = d.id
       WHERE p.id = ? OR p.project_code = ?`,
      [id, id]
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Milestones (12 stages)
    const milestones = await db.query(
      'SELECT * FROM milestones WHERE project_id = ? ORDER BY stage_number ASC',
      [project.id]
    );

    // Notifications
    const notifications = await db.query(
      'SELECT * FROM notifications WHERE project_id = ? ORDER BY issue_date DESC',
      [project.id]
    );

    // Awards
    const awards = await db.query(
      'SELECT * FROM awards WHERE project_id = ? ORDER BY award_date DESC',
      [project.id]
    );

    // Parcel summary statistics
    const parcelStats = await db.getOne(
      `SELECT
        COUNT(*) as total_parcels,
        SUM(area_ha) as total_area_surveyed,
        SUM(CASE WHEN possession_status = 'COMPLETED' THEN 1 ELSE 0 END) as possession_completed_count,
        SUM(CASE WHEN acquisition_status = 'DISPUTED' THEN 1 ELSE 0 END) as disputed_count,
        SUM(assessed_compensation) as total_assessed_comp,
        SUM(disbursed_compensation) as total_disbursed_comp
       FROM land_parcels WHERE project_id = ?`,
      [project.id]
    );

    return res.json({
      success: true,
      project: {
        ...project,
        milestones,
        notifications,
        awards,
        parcelStats
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createProject(req, res) {
  try {
    const {
      name, project_type, implementing_agency, ministry, state_id, district_id,
      required_land_ha, budget_cr, compensation_budget_cr, start_date,
      expected_completion_date, description
    } = req.body;

    if (!name || !project_type || !implementing_agency || !state_id || !district_id || !required_land_ha) {
      return res.status(400).json({ success: false, message: 'Missing mandatory project fields.' });
    }

    const projectId = 'PRJ-' + uuidv4().substring(0, 6).toUpperCase();
    const projectCode = `${project_type.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    await db.run(
      `INSERT INTO projects (
        id, project_code, name, project_type, implementing_agency, ministry, state_id, district_id,
        required_land_ha, acquired_land_ha, remaining_land_ha, budget_cr, compensation_budget_cr,
        start_date, expected_completion_date, current_stage, overall_status, risk_level, risk_score,
        sia_completed, description, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 'PROPOSAL', 'ON_TRACK', 'LOW', 15, 0, ?, ?)`,
      [
        projectId, projectCode, name, project_type, implementing_agency, ministry || 'Ministry of Infrastructure',
        state_id, district_id, Number(required_land_ha), Number(required_land_ha),
        Number(budget_cr || 1000), Number(compensation_budget_cr || 200),
        start_date || new Date().toISOString().split('T')[0],
        expected_completion_date || '2028-12-31',
        description || '', req.user ? req.user.id : 'SYSTEM'
      ]
    );

    // Initialize 12 milestones for the new project
    const stages12 = [
      'Project Proposal', 'Land Requirement & SIA', 'Scrutiny & Verification', 'Statutory Approval',
      'Section 11 Notification', 'Section 19 Declaration', 'Award Declaration', 'Compensation Assessment',
      'Compensation Disbursement', 'Possession Takeover', 'Rehabilitation & Resettlement', 'Project Closure'
    ];

    for (let idx = 0; idx < stages12.length; idx++) {
      const msId = `MS-${uuidv4().substring(0, 8).toUpperCase()}`;
      await db.run(
        `INSERT INTO milestones (id, project_id, stage_name, stage_number, target_date, status, responsible_agency)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          msId, projectId, stages12[idx], idx + 1,
          '2026-12-31', idx === 0 ? 'COMPLETED' : (idx === 1 ? 'IN_PROGRESS' : 'PENDING'),
          implementing_agency
        ]
      );
    }

    await recordAuditLog({
      userId: req.user ? req.user.id : null,
      userName: req.user ? req.user.name : 'GUEST',
      userRole: req.user ? req.user.role : 'PROJECT_AGENCY',
      action: 'CREATE',
      entity: 'PROJECT',
      entityId: projectId,
      newValue: `Created project proposal: ${name} (${projectCode})`,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Project proposal created successfully.',
      projectId,
      projectCode
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateProjectStage(req, res) {
  try {
    const { id } = req.params;
    const { stage, remarks, overall_status } = req.body;

    const project = await db.getOne('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const previousStage = project.current_stage;
    const newStatus = overall_status || project.overall_status;

    await db.run(
      'UPDATE projects SET current_stage = ?, overall_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [stage, newStatus, id]
    );

    // Update milestone status
    const stageMap = {
      'PROPOSAL': 1, 'LAND_REQUIREMENT': 2, 'SCRUTINY': 3, 'APPROVAL': 4,
      'NOTIFICATION': 5, 'ACQUISITION': 6, 'AWARD': 7, 'COMPENSATION_ASSESSMENT': 8,
      'COMPENSATION_DISBURSEMENT': 9, 'POSSESSION': 10, 'REHABILITATION_RESETTLEMENT': 11,
      'PROJECT_CLOSURE': 12
    };

    const targetStageNum = stageMap[stage] || 1;
    await db.run(
      `UPDATE milestones SET status = 'COMPLETED', actual_completion_date = CURRENT_TIMESTAMP
       WHERE project_id = ? AND stage_number < ?`,
      [id, targetStageNum]
    );
    await db.run(
      `UPDATE milestones SET status = 'IN_PROGRESS'
       WHERE project_id = ? AND stage_number = ?`,
      [id, targetStageNum]
    );

    await recordAuditLog({
      userId: req.user ? req.user.id : null,
      userName: req.user ? req.user.name : 'ADMIN',
      userRole: req.user ? req.user.role : 'ADMIN',
      action: 'UPDATE_STAGE',
      entity: 'PROJECT',
      entityId: id,
      previousValue: previousStage,
      newValue: `${stage} (${remarks || 'Lifecycle progression'})`,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Project stage advanced to ${stage}`,
      previousStage,
      currentStage: stage
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
