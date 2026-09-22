import { verifyToken } from '../config/jwt.js';
import db from '../models/dbAdapter.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }

  try {
    const user = await db.getOne('SELECT id, name, email, role, designation, department, state_id, district_id FROM users WHERE id = ?', [decoded.id]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Auth database error: ' + err.message });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    // SUPER_ADMIN has full permissions across all endpoints
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to perform this operation. Allowed: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}
