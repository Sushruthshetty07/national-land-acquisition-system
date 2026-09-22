import express from 'express';
import db from '../models/dbAdapter.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

import * as authCtrl from '../controllers/authController.js';
import * as projectCtrl from '../controllers/projectController.js';
import * as parcelCtrl from '../controllers/parcelController.js';
import * as analyticsCtrl from '../controllers/analyticsController.js';
import * as workflowCtrl from '../controllers/workflowController.js';
import * as compCtrl from '../controllers/compensationController.js';
import * as rrCtrl from '../controllers/rrController.js';
import * as docCtrl from '../controllers/documentController.js';
import * as alertCtrl from '../controllers/alertController.js';
import * as reportCtrl from '../controllers/reportController.js';
import * as auditCtrl from '../controllers/auditController.js';

const router = express.Router();

// Public / Auth routes
router.post('/auth/login', authCtrl.login);
router.get('/auth/personas', authCtrl.getPersonas);
router.post('/auth/switch', authCtrl.switchPersona);
router.get('/auth/profile', authenticate, authCtrl.getProfile);

// States and Districts lookup
router.get('/states', async (req, res) => {
  try {
    const states = await db.query('SELECT * FROM states ORDER BY name ASC');
    res.json({ success: true, states });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/districts', async (req, res) => {
  try {
    const { state_id } = req.query;
    let sql = 'SELECT * FROM districts';
    const params = [];
    if (state_id) {
      sql += ' WHERE state_id = ?';
      params.push(state_id);
    }
    sql += ' ORDER BY name ASC';
    const districts = await db.query(sql, params);
    res.json({ success: true, districts });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Analytics & KPIs
router.get('/analytics/national', analyticsCtrl.getNationalSummary);
router.get('/analytics/state/:stateId', analyticsCtrl.getStateSummary);

// Projects
router.get('/projects', projectCtrl.getProjects);
router.get('/projects/:id', projectCtrl.getProjectById);
router.post('/projects', authenticate, authorizeRoles('SUPER_ADMIN', 'CENTRAL_MINISTRY', 'PROJECT_AGENCY'), projectCtrl.createProject);
router.put('/projects/:id/stage', authenticate, authorizeRoles('SUPER_ADMIN', 'CENTRAL_MINISTRY', 'STATE_ADMIN', 'DISTRICT_ADMIN'), projectCtrl.updateProjectStage);

// GIS & Land Parcels
router.get('/parcels', parcelCtrl.getParcels);
router.get('/parcels/:id', parcelCtrl.getParcelById);
router.post('/parcels', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN', 'LAND_AUTHORITY', 'PROJECT_AGENCY'), parcelCtrl.createParcel);
router.post('/parcels/:id/verify', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN', 'LAND_AUTHORITY'), parcelCtrl.fieldVerifyParcel);

// 12-Stage Workflow Engine
router.get('/workflow/stages', workflowCtrl.getWorkflowStages);
router.post('/workflow/action', authenticate, authorizeRoles('SUPER_ADMIN', 'CENTRAL_MINISTRY', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'LAND_AUTHORITY', 'PROJECT_AGENCY'), workflowCtrl.processStageAction);
router.post('/workflow/notify', authenticate, authorizeRoles('SUPER_ADMIN', 'CENTRAL_MINISTRY', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'LAND_AUTHORITY'), workflowCtrl.publishGazetteNotification);

// Compensation & DBT
router.get('/compensation', compCtrl.getCompensationList);
router.get('/compensation/summary', compCtrl.getCompensationSummary);
router.post('/compensation/calculate', compCtrl.calculateAssessment);
router.post('/compensation/disburse', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN', 'LAND_AUTHORITY'), compCtrl.disburseBatch);

// R&R
router.get('/rr/cases', rrCtrl.getRRCases);
router.get('/rr/families', rrCtrl.getAffectedFamilies);
router.get('/rr/summary', rrCtrl.getRRSummary);
router.put('/rr/cases/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN', 'LAND_AUTHORITY'), rrCtrl.updateRREntitlement);

// Document Repository
router.get('/documents', docCtrl.getDocuments);
router.post('/documents/upload', authenticate, docCtrl.uploadDocument);
router.post('/documents/:id/verify', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN', 'LAND_AUTHORITY'), docCtrl.verifyDocument);

// Alerts & SLA
router.get('/alerts', alertCtrl.getAlerts);
router.post('/alerts/:id/resolve', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN', 'STATE_ADMIN'), alertCtrl.resolveAlert);

// Reports & Audits
router.get('/reports/:reportType', reportCtrl.getReportData);
router.get('/audit-logs', auditCtrl.getAuditLogs);

export default router;
