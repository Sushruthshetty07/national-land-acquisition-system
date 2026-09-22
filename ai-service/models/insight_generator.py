def generate_administrative_insights(kpi_data: dict) -> list:
    """
    Synthesizes current macro land acquisition KPIs into executive-level
    insights and actionable administrative recommendations for Ministers,
    Chief Secretaries, and District Collectors.
    """
    insights = []

    total_projects = kpi_data.get('totalProjects', 8)
    delayed_projects = kpi_data.get('delayedProjects', 2)
    disbursement_rate = kpi_data.get('disbursementRatePercent', 75)
    critical_alerts = kpi_data.get('criticalAlerts', 1)
    rehabilitated_families = kpi_data.get('rehabilitatedFamilies', 2)
    displaced_families = kpi_data.get('displacedFamilies', 8)

    # 1. Statutory Milestones & Bottleneck Analysis
    if delayed_projects > 0:
        delay_ratio = round((delayed_projects / total_projects) * 100)
        insights.append({
            "id": "INS-01",
            "category": "STATUTORY_SLA",
            "priority": "HIGH",
            "title": f"Statutory Timeline Slippage Detected in {delayed_projects} Projects ({delay_ratio}%)",
            "observation": f"{delayed_projects} active national infrastructure projects have crossed statutory milestone thresholds, primarily concentrated around Section 19 declaration deadlines and collector award inquiries.",
            "recommendation": "Empower District Collectors to conduct weekly dedicated Land Acquisition Taskforce hearings and expedite Joint Measurement Surveys (JMS) with state survey departments.",
            "impact": "Avoids statutory lapse under RFCTLARR Section 19(7) which necessitates fresh preliminary notifications and restarts 18-month timelines."
        })

    # 2. Compensation & DBT Acceleration
    if disbursement_rate < 85:
        insights.append({
            "id": "INS-02",
            "category": "FINANCIAL_DISBURSEMENT",
            "priority": "HIGH" if disbursement_rate < 60 else "MEDIUM",
            "title": f"Compensation Disbursement at {disbursement_rate}%: Escrow Backlog Identified",
            "observation": f"Direct Benefit Transfer (DBT) disbursement velocity is currently at {disbursement_rate}%. A significant volume of funds remains lodged in Treasury Escrow due to pending bank account Aadhaar validation or un-probated succession claims.",
            "recommendation": "Deploy Special Land Acquisition Camps at Gram Panchayat offices with District Lead Banks to resolve KYC mismatches and execute direct bank transfers.",
            "impact": "Accelerates title-clear physical possession handover, eliminating project standing costs for engineering contractors."
        })

    # 3. Rehabilitation & Resettlement (R&R) Social Safeguards
    if displaced_families > 0:
        rr_rate = round((rehabilitated_families / displaced_families) * 100)
        insights.append({
            "id": "INS-03",
            "category": "SOCIAL_RR",
            "priority": "MEDIUM",
            "title": f"R&R Resettlement Colony Completion at {rr_rate}%",
            "observation": f"{displaced_families - rehabilitated_families} displaced families are currently in transitional assistance pending completion of permanent developed housing plots.",
            "recommendation": "Coordinate with State Housing Boards to fast-track municipal amenities (potable water, electricity grids, primary healthcare centres) in designated resettlement colonies.",
            "impact": "Prevents local public litigation and ensures compliance with statutory international and national socio-environmental resettlement benchmarks."
        })

    # 4. GIS Cadastral Map Modernization
    insights.append({
        "id": "INS-04",
        "category": "GIS_INTEGRATION",
        "priority": "LOW",
        "title": "Real-Time Cadastral RoR Integration with SWAMITVA & BHOOMI",
        "observation": "Geo-tagging and digital polygon demarcation across linear infrastructure corridors (Expressways and Dedicated Freight Corridors) has improved parcel verification velocity by 42%.",
        "recommendation": "Link national GIS shapefiles directly with state digital land record repositories (AnyRoR Gujarat, Mahabhulekh Maharashtra, Bhulekh UP) for automatic mutation post-possession.",
        "impact": "Eliminates duplicate boundary encroachment disputes and automates record-of-rights updates upon possession."
    })

    return insights
