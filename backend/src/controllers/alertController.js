import db from '../models/dbAdapter.js';
import { recordAuditLog } from '../middleware/auditMiddleware.js';

export async function getAlerts(req, res) {
  try {
    const { severity, is_resolved, project_id } = req.query;
    let sql = `
      SELECT a.*, p.name as project_name, p.project_code,
             s.name as state_name, d.name as district_name
      FROM alerts a
      LEFT JOIN projects p ON a.project_id = p.id
      LEFT JOIN states s ON p.state_id = s.id
      LEFT JOIN districts d ON p.district_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (severity) {
      sql += ' AND a.severity = ?';
      params.push(severity);
    }
    if (is_resolved !== undefined) {
      sql += ' AND a.is_resolved = ?';
      params.push(Number(is_resolved));
    }
    if (project_id) {
      sql += ' AND a.project_id = ?';
      params.push(project_id);
    }

    sql += " ORDER BY CASE a.severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END ASC, a.created_at DESC";

    const alerts = await db.query(sql, params);
    return res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function resolveAlert(req, res) {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const alert = await db.getOne('SELECT * FROM alerts WHERE id = ?', [id]);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    const resolver = req.user ? req.user.name : 'District Magistrate';

    await db.run(
      `UPDATE alerts
       SET is_resolved = 1, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [resolver, id]
    );

    await recordAuditLog({
      userId: req.user ? req.user.id : null,
      userName: resolver,
      userRole: req.user ? req.user.role : 'DISTRICT_ADMIN',
      action: 'RESOLVE_ALERT',
      entity: 'ALERT',
      entityId: id,
      newValue: `Resolved: ${alert.title}. Action taken: ${remarks || 'Statutory review executed'}`,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Alert resolved and marked in compliance.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
