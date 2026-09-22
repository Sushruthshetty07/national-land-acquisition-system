import db from '../models/dbAdapter.js';

export async function getAuditLogs(req, res) {
  try {
    const { entity, action, user_role, search, limit } = req.query;
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (entity) {
      sql += ' AND entity = ?';
      params.push(entity);
    }
    if (action) {
      sql += ' AND action = ?';
      params.push(action);
    }
    if (user_role) {
      sql += ' AND user_role = ?';
      params.push(user_role);
    }
    if (search) {
      sql += ' AND (user_name LIKE ? OR new_value LIKE ? OR entity_id LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY timestamp DESC';
    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    } else {
      sql += ' LIMIT 100';
    }

    const logs = await db.query(sql, params);
    return res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
