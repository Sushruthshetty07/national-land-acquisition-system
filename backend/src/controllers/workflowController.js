import { v4 as uuidv4 } from 'uuid';
import db from '../models/dbAdapter.js';
import { recordAuditLog } from '../middleware/auditMiddleware.js';

export const WORKFLOW_STAGES = [
  {
    id: 'PROPOSAL',
    stepNumber: 1,
    name: 'Project Proposal',
    authority: 'Project Implementing Agency (NHAI / Railways / Metro / PWD)',
    slaDays: 30,
    description: 'Submission of preliminary project report, alignment map, and requisition for land acquisition.',
    requiredDocs: ['Detailed Project Report (DPR)', 'Proposed Alignment Map', 'Cabinet / Ministry In-Principle Approval']
  },
  {
    id: 'LAND_REQUIREMENT',
    stepNumber: 2,
    name: 'Land Requirement & SIA',
    authority: 'District Administration & Social Impact Assessment (SIA) Agency',
    slaDays: 180,
    description: 'Preliminary survey of land requirement, revenue record extraction, and statutory Social Impact Assessment under Section 4 RFCTLARR 2013.',
    requiredDocs: ['SIA Study Report', 'Public Hearing Proceedings', 'Expert Committee Appraisal Report']
  },
  {
    id: 'SCRUTINY',
    stepNumber: 3,
    name: 'Scrutiny & Verification',
    authority: 'Collector / Competent Authority Land Acquisition (CALA)',
    slaDays: 45,
    description: 'Verification of survey boundaries, minimum land requirement validation, multi-crop land restrictions check, and SIA recommendation examination.',
    requiredDocs: ['Collector Scrutiny Checklist', 'Revenue Titling Scrutiny Sheet', 'Multi-crop Land Clearance']
  },
  {
    id: 'APPROVAL',
    stepNumber: 4,
    name: 'Statutory Approval',
    authority: 'Appropriate Government (State Revenue Dept / Central Ministry)',
    slaDays: 60,
    description: 'Administrative sanction and formal clearance by the State Government or Central Ministry approving the proposal for statutory notification.',
    requiredDocs: ['Cabinet Sanction Order', 'Budget Allocation Order', 'State Land Reforms Sanction']
  },
  {
    id: 'NOTIFICATION',
    stepNumber: 5,
    name: 'Section 11 Preliminary Notification',
    authority: 'Appropriate Government / Collector',
    slaDays: 60,
    description: 'Publication of Section 11 Preliminary Notification in Official Gazette, two local newspapers, and Panchayat offices. Inviting Section 15 objections within 60 days.',
    requiredDocs: ['Official Gazette Copy (Extra-Ordinary)', 'Newspaper Publication Tearsheets', 'Grama Sabha Notice Proof']
  },
  {
    id: 'ACQUISITION',
    stepNumber: 6,
    name: 'Section 19 Declaration of Acquisition',
    authority: 'State Government / Central Ministry',
    slaDays: 365,
    description: 'Final declaration published under Section 19 stating land is required for a public purpose. Must be declared within 12 months of Section 11 notification.',
    requiredDocs: ['Gazette Section 19 Declaration', 'Summary of Section 15 Hearing Disposals', 'R&R Scheme Summary']
  },
  {
    id: 'AWARD',
    stepNumber: 7,
    name: 'Award Declaration (Section 23/30)',
    authority: 'Collector / Special Land Acquisition Officer (SLAO)',
    slaDays: 90,
    description: 'Collector holds inquiry, evaluates claims, and declares the formal compensation and R&R Award within statutory time limits.',
    requiredDocs: ['Collector Award Order Form', 'Comprehensive Valuation Statement', 'Joint Measurement Survey (JMS) Map']
  },
  {
    id: 'COMPENSATION_ASSESSMENT',
    stepNumber: 8,
    name: 'Compensation Assessment',
    authority: 'Competent Authority / Valuation Engineers',
    slaDays: 45,
    description: 'Computation of market value based on registered sales/circle rates multiplied by rural/urban factor + 100% Solatium + 12% additional interest per annum.',
    requiredDocs: ['Circle Rate Verification Certificate', 'Tree / Crop Valuation By Horticulture', 'Building / Structure PWD Valuation']
  },
  {
    id: 'COMPENSATION_DISBURSEMENT',
    stepNumber: 9,
    name: 'Compensation Disbursement (DBT)',
    authority: 'District Collector / SLAO / Bank Treasury',
    slaDays: 60,
    description: 'Direct Benefit Transfer (DBT) directly into verified bank accounts of khatedars and title holders. Unclaimed funds deposited in Land Acquisition Escrow.',
    requiredDocs: ['Aadhaar Tokenized Beneficiary List', 'Bank Verification / PFMS Scroll', 'E-Payment / RTGS Confirmation Sheets']
  },
  {
    id: 'POSSESSION',
    stepNumber: 10,
    name: 'Possession Takeover (Section 38/40)',
    authority: 'Collector & Project Implementing Agency',
    slaDays: 30,
    description: 'Full payment of compensation is prerequisite. Demarcation of boundaries, physical eviction if encumbered, execution of Panchnama, and mutation in revenue records.',
    requiredDocs: ['Physical Panchnama with 2 Witnesses', 'Boundary Demarcation Certificate', 'Encumbrance-Free Certificate']
  },
  {
    id: 'REHABILITATION_RESETTLEMENT',
    stepNumber: 11,
    name: 'Rehabilitation & Resettlement (R&R)',
    authority: 'Administrator for R&R / Commissioner R&R',
    slaDays: 180,
    description: 'Allotment of developed housing plots/flats, disbursement of ₹50,000 one-time grant, ₹1.5 Lakhs housing assistance, annuity/subsistence grants, and skill programs.',
    requiredDocs: ['R&R Colony Handover Certificate', 'Resettlement Deed / Title Deed to Displaced Family', 'Skill Development Completion Roster']
  },
  {
    id: 'PROJECT_CLOSURE',
    stepNumber: 12,
    name: 'Project Closure & Revenue Mutation',
    authority: 'District Collector & Tahsildar',
    slaDays: 45,
    description: 'Formal mutation of acquired land in Government/Agency name in village revenue records (RoR / 7/12 / Khasra), financial audit, and completion sign-off.',
    requiredDocs: ['Updated Mutation RoR Certificate', 'Final Statutory Audit Report', 'Ministry Closure Sign-off']
  }
];

export function getWorkflowStages(req, res) {
  return res.json({
    success: true,
    stages: WORKFLOW_STAGES
  });
}

export async function processStageAction(req, res) {
  try {
    const { projectId, currentStage, targetStage, action, remarks, checklist } = req.body;
    // action: 'APPROVE', 'REJECT', 'ADVANCE', 'SAVE_SCRUTINY'

    const project = await db.getOne('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const userName = req.user ? req.user.name : 'Authorized Officer';
    const userRole = req.user ? req.user.role : 'ADMIN';

    if (action === 'REJECT') {
      await db.run(
        `UPDATE projects SET overall_status = 'DELAYED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [projectId]
      );

      await recordAuditLog({
        userId: req.user ? req.user.id : null,
        userName,
        userRole,
        action: 'REJECT',
        entity: 'WORKFLOW',
        entityId: projectId,
        previousValue: currentStage,
        newValue: `Rejected with remarks: ${remarks || 'Incomplete scrutiny documentation'}`,
        ipAddress: req.ip
      });

      return res.json({
        success: true,
        message: `Stage rejected. Returned to implementing agency with remarks: ${remarks}`,
        projectStatus: 'DELAYED'
      });
    }

    // Advance to next stage
    const nextStage = targetStage || currentStage;
    await db.run(
      `UPDATE projects SET current_stage = ?, overall_status = 'ON_TRACK', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [nextStage, projectId]
    );

    // Update milestone for the stage
    const stageInfo = WORKFLOW_STAGES.find(s => s.id === nextStage);
    const stageNum = stageInfo ? stageInfo.stepNumber : 1;

    await db.run(
      `UPDATE milestones SET status = 'COMPLETED', actual_completion_date = CURRENT_TIMESTAMP
       WHERE project_id = ? AND stage_number < ?`,
      [projectId, stageNum]
    );
    await db.run(
      `UPDATE milestones SET status = 'IN_PROGRESS' WHERE project_id = ? AND stage_number = ?`,
      [projectId, stageNum]
    );

    await recordAuditLog({
      userId: req.user ? req.user.id : null,
      userName,
      userRole,
      action: action || 'APPROVE',
      entity: 'WORKFLOW',
      entityId: projectId,
      previousValue: currentStage,
      newValue: `Advanced to ${nextStage}: ${remarks || 'Approved by authority'}`,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Project workflow advanced to stage: ${stageInfo ? stageInfo.name : nextStage}`,
      currentStage: nextStage,
      overallStatus: 'ON_TRACK'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function publishGazetteNotification(req, res) {
  try {
    const { projectId, notificationType, gazetteNumber, issueDate, issuingAuthority, affectedVillagesCount, totalAreaHa, remarks } = req.body;

    if (!projectId || !notificationType || !gazetteNumber) {
      return res.status(400).json({ success: false, message: 'Missing notification parameters.' });
    }

    const notifId = 'NOTIF-' + uuidv4().substring(0, 6).toUpperCase();
    await db.run(
      `INSERT INTO notifications (
        id, project_id, notification_type, gazette_number, issue_date,
        issuing_authority, affected_villages_count, total_area_ha, status, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
      [
        notifId, projectId, notificationType, gazetteNumber,
        issueDate || new Date().toISOString().split('T')[0],
        issuingAuthority || 'District Collector',
        Number(affectedVillagesCount || 5), Number(totalAreaHa || 100),
        remarks || 'Statutory notification published in e-Gazette.'
      ]
    );

    // If preliminary Section 11, advance project stage to NOTIFICATION
    if (notificationType === 'SEC11_PRELIMINARY') {
      await db.run(`UPDATE projects SET current_stage = 'NOTIFICATION', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [projectId]);
    } else if (notificationType === 'SEC19_DECLARATION') {
      await db.run(`UPDATE projects SET current_stage = 'ACQUISITION', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [projectId]);
    }

    await recordAuditLog({
      userId: req.user ? req.user.id : null,
      userName: req.user ? req.user.name : 'OFFICER',
      userRole: req.user ? req.user.role : 'DISTRICT_ADMIN',
      action: 'NOTIFY',
      entity: 'NOTIFICATION',
      entityId: notifId,
      newValue: `Gazette publication ${gazetteNumber} (${notificationType})`,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: `Gazette notification ${gazetteNumber} issued and published successfully.`,
      notificationId: notifId
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
