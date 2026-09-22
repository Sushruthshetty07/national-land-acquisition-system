import { v4 as uuidv4 } from 'uuid';
import db from '../models/dbAdapter.js';
import { recordAuditLog } from '../middleware/auditMiddleware.js';

export async function getDocuments(req, res) {
  try {
    const { project_id, parcel_id, document_type, search } = req.query;
    let sql = `
      SELECT d.*, p.name as project_name, p.project_code,
             pcl.survey_number, pcl.parcel_code
      FROM documents d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN land_parcels pcl ON d.parcel_id = pcl.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) {
      sql += ' AND d.project_id = ?';
      params.push(project_id);
    }
    if (parcel_id) {
      sql += ' AND d.parcel_id = ?';
      params.push(parcel_id);
    }
    if (document_type) {
      sql += ' AND d.document_type = ?';
      params.push(document_type);
    }
    if (search) {
      sql += ' AND (d.title LIKE ? OR d.file_name LIKE ? OR d.uploaded_by LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY d.created_at DESC';

    const docs = await db.query(sql, params);
    return res.json({ success: true, count: docs.length, documents: docs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function uploadDocument(req, res) {
  try {
    const { project_id, parcel_id, document_type, title, file_name, version, remarks } = req.body;

    if (!title || !document_type) {
      return res.status(400).json({ success: false, message: 'Title and document type are required.' });
    }

    const docId = 'DOC-' + uuidv4().substring(0, 6).toUpperCase();
    const uploader = req.user ? req.user.name : 'Authorized Officer';
    const actualFileName = file_name || `${document_type.toLowerCase()}_${Date.now()}.pdf`;

    await db.run(
      `INSERT INTO documents (
        id, project_id, parcel_id, document_type, title, file_name, file_size_kb,
        mime_type, version, uploaded_by, verified, verified_by, verification_date, file_url
      ) VALUES (?, ?, ?, ?, ?, ?, 1536, 'application/pdf', ?, ?, 1, ?, CURRENT_TIMESTAMP, ?)`,
      [
        docId, project_id || null, parcel_id || null, document_type, title,
        actualFileName, version || 'v1.0', uploader, uploader, `/uploads/${actualFileName}`
      ]
    );

    await recordAuditLog({
      userId: req.user ? req.user.id : null,
      userName: uploader,
      userRole: req.user ? req.user.role : 'PROJECT_AGENCY',
      action: 'UPLOAD_DOC',
      entity: 'DOCUMENT',
      entityId: docId,
      newValue: `Uploaded ${title} (${actualFileName}, ${version || 'v1.0'})`,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded and archived into secure repository.',
      documentId: docId,
      fileName: actualFileName
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function verifyDocument(req, res) {
  try {
    const { id } = req.params;
    const doc = await db.getOne('SELECT * FROM documents WHERE id = ?', [id]);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const verifier = req.user ? req.user.name : 'Competent Authority';

    await db.run(
      `UPDATE documents
       SET verified = 1, verified_by = ?, verification_date = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [verifier, id]
    );

    await recordAuditLog({
      userId: req.user ? req.user.id : null,
      userName: verifier,
      userRole: req.user ? req.user.role : 'DISTRICT_ADMIN',
      action: 'VERIFY_DOC',
      entity: 'DOCUMENT',
      entityId: id,
      newValue: `Verified document: ${doc.title}`,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Document successfully verified and sealed.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
