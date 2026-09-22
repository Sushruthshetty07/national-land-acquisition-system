import { v4 as uuidv4 } from 'uuid';
import db from '../models/dbAdapter.js';

export async function recordAuditLog({
  userId = null,
  userName = 'SYSTEM',
  userRole = 'SYSTEM',
  action,
  entity,
  entityId,
  previousValue = null,
  newValue = null,
  ipAddress = '127.0.0.1'
}) {
  try {
    const id = 'AUD-' + uuidv4().substring(0, 8).toUpperCase();
    await db.run(
      `INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity, entity_id, previous_value, new_value, ip_address, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        id,
        userId,
        userName,
        userRole,
        action,
        entity,
        String(entityId),
        typeof previousValue === 'object' && previousValue !== null ? JSON.stringify(previousValue) : String(previousValue || ''),
        typeof newValue === 'object' && newValue !== null ? JSON.stringify(newValue) : String(newValue || ''),
        ipAddress
      ]
    );
  } catch (err) {
    console.error('Failed to record audit log:', err.message);
  }
}
