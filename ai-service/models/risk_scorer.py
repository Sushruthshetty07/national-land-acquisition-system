def calculate_project_risk(project_data: dict) -> dict:
    """
    Computes a composite multi-factor risk score (0-100) and provides
    explainable administrative reasoning for land acquisition projects
    under RFCTLARR Act 2013.
    """
    reasons = []
    sub_scores = {}

    # 1. Milestone & Statutory Timeline Risk (Weight: 25%)
    milestone_risk = 10
    current_stage = project_data.get('current_stage', 'PROPOSAL')
    overall_status = project_data.get('overall_status', 'ON_TRACK')
    months_active = project_data.get('months_active', 12)

    if overall_status == 'DELAYED':
        milestone_risk += 35
        reasons.append("Project milestone status is marked as DELAYED across current acquisition phase")
    elif overall_status == 'CRITICAL':
        milestone_risk += 50
        reasons.append("Statutory timeline SLA breached; proceedings at risk of automatic lapse under Section 19(7)")

    if current_stage in ['NOTIFICATION', 'ACQUISITION'] and months_active > 10:
        milestone_risk += 25
        reasons.append("Section 19 Declaration pending close to 12-month statutory deadline from Section 11 notice")

    sub_scores['milestone_risk'] = min(milestone_risk, 100)

    # 2. Financial Disbursement Gap (Weight: 25%)
    comp_budget = float(project_data.get('compensation_budget_cr', 500) or 500)
    comp_disbursed = float(project_data.get('compensation_disbursed_cr', 0) or 0)
    disbursement_rate = (comp_disbursed / comp_budget) if comp_budget > 0 else 0

    finance_risk = 15
    if current_stage in ['AWARD', 'COMPENSATION_ASSESSMENT', 'COMPENSATION_DISBURSEMENT', 'POSSESSION']:
        if disbursement_rate < 0.3:
            finance_risk = 85
            reasons.append(f"Compensation disbursement critically low ({round(disbursement_rate * 100)}% of assessed funds released to khatedars)")
        elif disbursement_rate < 0.6:
            finance_risk = 55
            reasons.append(f"Compensation pending: {round((1 - disbursement_rate) * 100)}% of award compensation awaiting treasury sanction or DBT dispatch")
        else:
            finance_risk = 20

    sub_scores['financial_disbursement_risk'] = finance_risk

    # 3. Rehabilitation & Resettlement (R&R) Backlog (Weight: 20%)
    displaced_families = int(project_data.get('displaced_families', 0) or 0)
    rehabilitated_families = int(project_data.get('rehabilitated_families', 0) or 0)

    rr_risk = 10
    if displaced_families > 0:
        rr_rate = rehabilitated_families / displaced_families
        if rr_rate < 0.25:
            rr_risk = 80
            reasons.append(f"R&R progress significantly below expected level: {displaced_families - rehabilitated_families} displaced families awaiting permanent housing handover")
        elif rr_rate < 0.60:
            rr_risk = 50
            reasons.append(f"Resettlement colony plots under construction; {displaced_families - rehabilitated_families} families in temporary rehabilitation assistance")
        else:
            rr_risk = 20
    sub_scores['rr_progress_risk'] = rr_risk

    # 4. Legal / Litigation & Title Disputes (Weight: 15%)
    disputed_parcels = int(project_data.get('disputed_parcels', 0) or 0)
    legal_risk = 10
    if disputed_parcels > 5:
        legal_risk = 85
        reasons.append(f"High litigation exposure: {disputed_parcels} parcels subject to pending High Court / Civil Court writ petitions or title disputes")
    elif disputed_parcels > 0:
        legal_risk = 45
        reasons.append(f"Minor title disputes recorded on {disputed_parcels} parcels; compensation placed in escrow account")
    sub_scores['litigation_risk'] = legal_risk

    # 5. Clearances & Statutory Approvals (Weight: 15%)
    clearance_risk = 10
    if not project_data.get('forest_clearance', True):
        clearance_risk += 45
        reasons.append("Stage-II Forest Clearance pending with Ministry of Environment, Forest and Climate Change (MoEFCC)")
    if not project_data.get('wildlife_clearance', True):
        clearance_risk += 35
        reasons.append("Standing Committee of National Board for Wildlife (NBWL) clearance pending for critical ecological corridor")
    sub_scores['environmental_clearance_risk'] = min(clearance_risk, 100)

    # Weighted Composite Score (0-100)
    composite_score = int(
        sub_scores['milestone_risk'] * 0.25 +
        sub_scores['financial_disbursement_risk'] * 0.25 +
        sub_scores['rr_progress_risk'] * 0.20 +
        sub_scores['litigation_risk'] * 0.15 +
        sub_scores['environmental_clearance_risk'] * 0.15
    )
    composite_score = max(5, min(98, composite_score))

    # Risk Level
    if composite_score >= 70:
        risk_level = "HIGH"
    elif composite_score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    if not reasons:
        reasons = ["Project adhering to standard RFCTLARR statutory milestones", "Financial compensation disbursal tracking on schedule"]

    return {
        "risk_score": composite_score,
        "risk_level": risk_level,
        "reasons": reasons,
        "sub_scores": sub_scores,
        "statutory_disclaimer": "Decision-support recommendation generated by ML system; not an automatic government determination. Subject to Competent Authority statutory review."
    }
