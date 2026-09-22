import bcrypt from 'bcryptjs';
import db from '../models/dbAdapter.js';
import { signToken } from '../config/jwt.js';
import { recordAuditLog } from '../middleware/auditMiddleware.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await db.getOne('SELECT * FROM users WHERE email = ?', [email.trim()]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update last login
    await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      department: user.department,
      state_id: user.state_id,
      district_id: user.district_id,
      phone: user.phone
    };

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.id,
      newValue: 'User logged in successfully',
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userProfile
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Login error: ' + err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await db.getOne(
      `SELECT u.id, u.name, u.email, u.role, u.designation, u.department, u.state_id, u.district_id, u.phone,
              s.name as state_name, d.name as district_name
       FROM users u
       LEFT JOIN states s ON u.state_id = s.id
       LEFT JOIN districts d ON u.district_id = d.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getPersonas(req, res) {
  try {
    const personas = await db.query(
      `SELECT id, name, email, role, designation, department, state_id, district_id
       FROM users ORDER BY id ASC`
    );
    return res.json({ success: true, personas });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function switchPersona(req, res) {
  try {
    const { role } = req.body;
    let user;
    if (role) {
      user = await db.getOne('SELECT * FROM users WHERE role = ? LIMIT 1', [role]);
    } else if (req.body.userId) {
      user = await db.getOne('SELECT * FROM users WHERE id = ?', [req.body.userId]);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Persona not found for requested role.' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      department: user.department,
      state_id: user.state_id,
      district_id: user.district_id,
      phone: user.phone
    };

    return res.json({
      success: true,
      message: `Switched persona to ${user.role} (${user.name})`,
      token,
      user: userProfile
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
