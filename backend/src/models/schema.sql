-- ==========================================================
-- Real-Time National Land Acquisition & Management System
-- Database Schema: Normalized Tables (PostgreSQL / SQLite Compatible)
-- Compliant with RFCTLARR Act 2013 (Right to Fair Compensation and Transparency
-- in Land Acquisition, Rehabilitation and Resettlement Act, 2013)
-- ==========================================================

-- 1. States Table
CREATE TABLE IF NOT EXISTS states (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    region VARCHAR(50) NOT NULL,
    total_area_sqkm REAL,
    active_projects_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR(50) PRIMARY KEY,
    state_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    headquarters VARCHAR(100),
    collector_name VARCHAR(100),
    active_projects_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);

-- 3. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    state_id VARCHAR(50),
    district_id VARCHAR(50),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT 1,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role) REFERENCES roles(name)
);

-- 5. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    project_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL, -- Expressway, Railway, Metro, Port, Industrial Corridor, Renewable Energy
    implementing_agency VARCHAR(100) NOT NULL, -- NHAI, NHSRCL, DFCCIL, State PWD, K-RIDE, etc.
    ministry VARCHAR(100) NOT NULL,
    state_id VARCHAR(50) NOT NULL,
    district_id VARCHAR(50) NOT NULL,
    required_land_ha REAL NOT NULL,
    acquired_land_ha REAL DEFAULT 0,
    remaining_land_ha REAL NOT NULL,
    budget_cr REAL NOT NULL,
    compensation_budget_cr REAL NOT NULL,
    start_date DATE NOT NULL,
    expected_completion_date DATE NOT NULL,
    current_stage VARCHAR(50) NOT NULL, -- 12 stages
    overall_status VARCHAR(50) NOT NULL, -- ON_TRACK, DELAYED, CRITICAL, COMPLETED
    risk_level VARCHAR(20) DEFAULT 'LOW', -- LOW, MEDIUM, HIGH
    risk_score INTEGER DEFAULT 20,
    sia_completed BOOLEAN DEFAULT 1, -- Social Impact Assessment
    forest_clearance BOOLEAN DEFAULT 0,
    wildlife_clearance BOOLEAN DEFAULT 0,
    description TEXT,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 6. Land Parcels Table
CREATE TABLE IF NOT EXISTS land_parcels (
    id VARCHAR(50) PRIMARY KEY,
    parcel_code VARCHAR(50) NOT NULL UNIQUE,
    project_id VARCHAR(50) NOT NULL,
    state_id VARCHAR(50) NOT NULL,
    district_id VARCHAR(50) NOT NULL,
    taluk VARCHAR(100) NOT NULL,
    village VARCHAR(100) NOT NULL,
    survey_number VARCHAR(100) NOT NULL,
    sub_division VARCHAR(50),
    khata_number VARCHAR(100),
    land_type VARCHAR(50) NOT NULL, -- Agricultural (Irrigated), Agricultural (Dry), Commercial, Industrial, Homestead, Forest
    area_ha REAL NOT NULL,
    owner_name VARCHAR(150) NOT NULL,
    owner_aadhaar_token VARCHAR(50),
    co_owners_count INTEGER DEFAULT 1,
    acquisition_status VARCHAR(50) NOT NULL, -- PROPOSED, SCRUTINY, APPROVED, SEC11_NOTIFIED, SEC19_DECLARED, AWARDED, COMPENSATION_DISBURSED, POSSESSION_TAKEN, RR_ONGOING, CLOSED, DISPUTED
    possession_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PARTIAL, DEMARCATED, COMPLETED, DISPUTED
    rr_status VARCHAR(50) DEFAULT 'NOT_APPLICABLE', -- NOT_APPLICABLE, SURVEY_PENDING, ELIGIBLE, ALLOTTED, RESETTLED
    notification_date DATE,
    award_date DATE,
    possession_date DATE,
    market_rate_per_ha REAL NOT NULL,
    assessed_compensation REAL NOT NULL,
    disbursed_compensation REAL DEFAULT 0,
    is_disputed BOOLEAN DEFAULT 0,
    dispute_details TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    geojson_polygon TEXT, -- GeoJSON representation of boundary
    field_verified BOOLEAN DEFAULT 0,
    field_verified_by VARCHAR(100),
    field_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 7. Notifications Table (Section 11, Section 19 RFCTLARR Act)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- SEC4_SIA, SEC11_PRELIMINARY, SEC19_DECLARATION, SEC21_PUBLIC_NOTICE
    gazette_number VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    issuing_authority VARCHAR(150) NOT NULL,
    gazette_url TEXT,
    affected_villages_count INTEGER,
    total_area_ha REAL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, LAPSED, SUPERSEDED, WITHDRAWN
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 8. Awards Table (Section 23, Section 30 Collector Awards)
CREATE TABLE IF NOT EXISTS awards (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    award_number VARCHAR(100) NOT NULL UNIQUE,
    award_date DATE NOT NULL,
    collector_order_ref VARCHAR(100),
    total_land_area_ha REAL NOT NULL,
    total_parcels_count INTEGER NOT NULL,
    total_market_value REAL NOT NULL,
    solatium_amount REAL NOT NULL, -- 100% under RFCTLARR 2013
    additional_interest REAL NOT NULL, -- 12% per annum from Sec 11 to award date
    asset_damages_value REAL DEFAULT 0,
    total_award_amount REAL NOT NULL,
    approved_by VARCHAR(100),
    status VARCHAR(50) DEFAULT 'DECLARED', -- DRAFT, DECLARED, CHALLENGED, FINALIZED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 9. Compensation Table
CREATE TABLE IF NOT EXISTS compensation (
    id VARCHAR(50) PRIMARY KEY,
    parcel_id VARCHAR(50) NOT NULL,
    award_id VARCHAR(50),
    beneficiary_name VARCHAR(150) NOT NULL,
    aadhaar_hash VARCHAR(64),
    bank_account_masked VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    bank_name VARCHAR(100),
    base_land_value REAL NOT NULL,
    solatium_amount REAL NOT NULL,
    interest_amount REAL NOT NULL,
    structures_value REAL DEFAULT 0,
    trees_crops_value REAL DEFAULT 0,
    total_assessed REAL NOT NULL,
    total_disbursed REAL DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, TREASURY_ESCROW, PROCESSING, DISBURSED, FAILED, ON_HOLD
    payment_mode VARCHAR(50) DEFAULT 'DBT_NEFT',
    utr_number VARCHAR(100),
    disbursement_date DATE,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parcel_id) REFERENCES land_parcels(id) ON DELETE CASCADE,
    FOREIGN KEY (award_id) REFERENCES awards(id)
);

-- 10. Possession Table
CREATE TABLE IF NOT EXISTS possession (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    parcel_id VARCHAR(50) NOT NULL,
    possession_type VARCHAR(50) NOT NULL, -- PHYSICAL, SYMBOLIC
    panchnama_number VARCHAR(100) NOT NULL,
    handover_date DATE NOT NULL,
    handed_over_by VARCHAR(100) NOT NULL, -- Revenue Official / SLAO
    taken_over_by VARCHAR(100) NOT NULL, -- Implementing Agency Representative
    witnesses_count INTEGER DEFAULT 2,
    police_protection_required BOOLEAN DEFAULT 0,
    encumbrance_free BOOLEAN DEFAULT 1,
    possession_status VARCHAR(50) DEFAULT 'COMPLETED', -- COMPLETED, CONTESTED, REVERTED
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parcel_id) REFERENCES land_parcels(id) ON DELETE CASCADE
);

-- 11. Affected Families Table (R&R)
CREATE TABLE IF NOT EXISTS affected_families (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    parcel_id VARCHAR(50),
    family_head_name VARCHAR(150) NOT NULL,
    family_head_aadhaar VARCHAR(50),
    family_members_count INTEGER NOT NULL,
    social_category VARCHAR(50) NOT NULL, -- GENERAL, OBC, SC, ST, EWS
    bpl_card_holder BOOLEAN DEFAULT 0,
    displacement_type VARCHAR(50) NOT NULL, -- TITLE_HOLDER, TENANT, AGRICULTURAL_LABOURER, ARTISAN
    is_displaced BOOLEAN DEFAULT 0, -- Lost homestead / shelter
    current_village VARCHAR(100) NOT NULL,
    district_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 12. R&R Cases Table (Rehabilitation & Resettlement)
CREATE TABLE IF NOT EXISTS rr_cases (
    id VARCHAR(50) PRIMARY KEY,
    family_id VARCHAR(50) NOT NULL,
    project_id VARCHAR(50) NOT NULL,
    resettlement_colony_name VARCHAR(150),
    house_allotment_status VARCHAR(50) DEFAULT 'PENDING', -- NOT_APPLICABLE, PENDING, UNDER_CONSTRUCTION, ALLOTTED, OCCUPIED
    house_plot_number VARCHAR(50),
    housing_grant_amount REAL DEFAULT 150000, -- Pradhan Mantri Awas Yojana / RFCTLARR package
    housing_grant_disbursed BOOLEAN DEFAULT 0,
    one_time_resettlement_allowance REAL DEFAULT 50000,
    resettlement_allowance_disbursed BOOLEAN DEFAULT 0,
    annuity_monthly_grant REAL DEFAULT 2000,
    skill_training_provided BOOLEAN DEFAULT 0,
    skill_course_name VARCHAR(100),
    overall_rr_status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IDENTIFIED, ENTITLEMENT_APPROVED, ASSISTANCE_DISBURSED, RESETTLED, CLOSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES affected_families(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 13. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50),
    parcel_id VARCHAR(50),
    document_type VARCHAR(100) NOT NULL, -- LAND_RECORD_7_12, KHASRA_KHATAUNI, GAZETTE_SEC11, GAZETTE_SEC19, COLLECTOR_AWARD, PANCHNAMA, GIS_SHAPEFILE, VALUATION_REPORT, COURT_ORDER
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_kb INTEGER DEFAULT 1024,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    version VARCHAR(10) DEFAULT 'v1.0',
    uploaded_by VARCHAR(100) NOT NULL,
    verified BOOLEAN DEFAULT 1,
    verified_by VARCHAR(100),
    verification_date TIMESTAMP,
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (parcel_id) REFERENCES land_parcels(id) ON DELETE SET NULL
);

-- 14. Milestones Table
CREATE TABLE IF NOT EXISTS milestones (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    stage_number INTEGER NOT NULL,
    target_date DATE NOT NULL,
    actual_completion_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, DELAYED
    responsible_agency VARCHAR(100) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 15. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50),
    parcel_id VARCHAR(50),
    alert_type VARCHAR(100) NOT NULL, -- STATUTORY_DEADLINE, DELAYED_AWARD, PENDING_DISBURSEMENT, RR_BACKLOG, LITIGATION_FLAG, DUPLICATE_PARCEL
    severity VARCHAR(20) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT 0,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- 16. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, APPROVE, REJECT, DISBURSE, GEO_VERIFY, EXPORT
    entity VARCHAR(100) NOT NULL, -- PROJECT, PARCEL, COMPENSATION, AWARD, WORKFLOW, RR
    entity_id VARCHAR(50) NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
