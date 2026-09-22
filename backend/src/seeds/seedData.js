import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db, { initDatabase } from '../models/dbAdapter.js';

export async function runSeed() {
  console.log(' Starting database initialization and seeding...');
  await initDatabase();

  // Clear existing tables
  const tables = [
    'audit_logs', 'alerts', 'documents', 'rr_cases', 'affected_families',
    'possession', 'compensation', 'awards', 'notifications', 'milestones',
    'land_parcels', 'projects', 'users', 'roles', 'districts', 'states'
  ];

  for (const table of tables) {
    try {
      await db.run(`DELETE FROM ${table}`);
    } catch (e) {
      // ignore
    }
  }

  // 1. ROLES
  const roles = [
    { id: 'ROL-01', name: 'SUPER_ADMIN', description: 'National System Administrator with full oversight and audit permissions' },
    { id: 'ROL-02', name: 'CENTRAL_MINISTRY', description: 'Ministry of Road Transport & Highways, Railways, Rural Development oversight' },
    { id: 'ROL-03', name: 'STATE_ADMIN', description: 'State Revenue Department & Land Reforms Principal Secretary' },
    { id: 'ROL-04', name: 'DISTRICT_ADMIN', description: 'District Collector / District Magistrate / Competent Authority Land Acquisition' },
    { id: 'ROL-05', name: 'LAND_AUTHORITY', description: 'Special Land Acquisition Officer (SLAO) / Revenue Divisional Officer' },
    { id: 'ROL-06', name: 'PROJECT_AGENCY', description: 'Implementing Agency Manager (NHAI, NHSRCL, DFCCIL, K-RIDE, State PWD)' },
    { id: 'ROL-07', name: 'POLICY_MAKER', description: 'NITI Aayog / Cabinet Secretariat Policy Reviewer & Economic Analyst' }
  ];

  for (const r of roles) {
    await db.run('INSERT INTO roles (id, name, description) VALUES (?, ?, ?)', [r.id, r.name, r.description]);
  }
  console.log(' Roles seeded');

  // 2. USERS (Pass: Password@123)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password@123', salt);

  const users = [
    {
      id: 'USR-001',
      name: 'Dr. Rajeshwar Sharma',
      email: 'admin@nic.in',
      role: 'SUPER_ADMIN',
      designation: 'Joint Secretary & DG, Land Resources',
      department: 'Ministry of Rural Development, Govt of India',
      state_id: null,
      district_id: null,
      phone: '+91-11-23382456'
    },
    {
      id: 'USR-002',
      name: 'Sunita Verma, IAS',
      email: 'ministry.morth@gov.in',
      role: 'CENTRAL_MINISTRY',
      designation: 'Director (Land Acquisition)',
      department: 'Ministry of Road Transport and Highways (MoRTH)',
      state_id: null,
      district_id: null,
      phone: '+91-11-23097890'
    },
    {
      id: 'USR-003',
      name: 'Anand Kumar Patil, IAS',
      email: 'state.revenue@maharashtra.gov.in',
      role: 'STATE_ADMIN',
      designation: 'Principal Secretary (Revenue & Forest)',
      department: 'Revenue Department, Govt of Maharashtra',
      state_id: 'ST-MH',
      district_id: null,
      phone: '+91-22-22025643'
    },
    {
      id: 'USR-004',
      name: 'Pooja Kadam, IAS',
      email: 'collector.thane@nic.in',
      role: 'DISTRICT_ADMIN',
      designation: 'District Collector & Magistrate',
      department: 'District Administration, Thane',
      state_id: 'ST-MH',
      district_id: 'DIST-MH-01',
      phone: '+91-22-25345678'
    },
    {
      id: 'USR-005',
      name: 'Vikramaditya Deshmukh',
      email: 'slao.nhai@gov.in',
      role: 'LAND_AUTHORITY',
      designation: 'Special Land Acquisition Officer (SLAO)',
      department: 'National Highways Authority of India (NHAI) RO',
      state_id: 'ST-MH',
      district_id: 'DIST-MH-01',
      phone: '+91-22-27891234'
    },
    {
      id: 'USR-006',
      name: 'Pradeep R. Nair',
      email: 'project.manager@nhsrcl.in',
      role: 'PROJECT_AGENCY',
      designation: 'Chief Project Manager (Civil & Land)',
      department: 'National High Speed Rail Corporation Ltd (NHSRCL)',
      state_id: 'ST-MH',
      district_id: 'DIST-MH-02',
      phone: '+91-22-26543210'
    },
    {
      id: 'USR-007',
      name: 'Dr. Meenakshi Sundaram',
      email: 'advisor.niti@gov.in',
      role: 'POLICY_MAKER',
      designation: 'Senior Advisor (Infrastructure & PPP)',
      department: 'NITI Aayog, New Delhi',
      state_id: null,
      district_id: null,
      phone: '+91-11-23096574'
    }
  ];

  for (const u of users) {
    await db.run(
      `INSERT INTO users (id, name, email, password_hash, role, designation, department, state_id, district_id, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [u.id, u.name, u.email, passwordHash, u.role, u.designation, u.department, u.state_id, u.district_id, u.phone]
    );
  }
  console.log(' Users seeded (Default Password: Password@123)');

  // 3. STATES
  const states = [
    { id: 'ST-MH', name: 'Maharashtra', code: 'MH', region: 'Western', total_area_sqkm: 307713, active_projects_count: 5 },
    { id: 'ST-GJ', name: 'Gujarat', code: 'GJ', region: 'Western', total_area_sqkm: 196024, active_projects_count: 4 },
    { id: 'ST-UP', name: 'Uttar Pradesh', code: 'UP', region: 'Northern', total_area_sqkm: 243286, active_projects_count: 6 },
    { id: 'ST-KA', name: 'Karnataka', code: 'KA', region: 'Southern', total_area_sqkm: 191791, active_projects_count: 4 },
    { id: 'ST-HR', name: 'Haryana', code: 'HR', region: 'Northern', total_area_sqkm: 44212, active_projects_count: 3 },
    { id: 'ST-OD', name: 'Odisha', code: 'OD', region: 'Eastern', total_area_sqkm: 155707, active_projects_count: 3 },
    { id: 'ST-TN', name: 'Tamil Nadu', code: 'TN', region: 'Southern', total_area_sqkm: 130058, active_projects_count: 3 },
    { id: 'ST-WB', name: 'West Bengal', code: 'WB', region: 'Eastern', total_area_sqkm: 88752, active_projects_count: 2 }
  ];

  for (const s of states) {
    await db.run(
      'INSERT INTO states (id, name, code, region, total_area_sqkm, active_projects_count) VALUES (?, ?, ?, ?, ?, ?)',
      [s.id, s.name, s.code, s.region, s.total_area_sqkm, s.active_projects_count]
    );
  }
  console.log(' States seeded');

  // 4. DISTRICTS
  const districts = [
    // Maharashtra
    { id: 'DIST-MH-01', state_id: 'ST-MH', name: 'Thane', code: 'THN', headquarters: 'Thane', collector_name: 'Pooja Kadam, IAS', active_projects_count: 3 },
    { id: 'DIST-MH-02', state_id: 'ST-MH', name: 'Palghar', code: 'PLG', headquarters: 'Palghar', collector_name: 'Govind Bodke, IAS', active_projects_count: 2 },
    { id: 'DIST-MH-03', state_id: 'ST-MH', name: 'Raigad', code: 'RGD', headquarters: 'Alibag', collector_name: 'Kishan Jawale, IAS', active_projects_count: 2 },
    { id: 'DIST-MH-04', state_id: 'ST-MH', name: 'Pune', code: 'PUN', headquarters: 'Pune', collector_name: 'Suhas Diwase, IAS', active_projects_count: 2 },
    // Gujarat
    { id: 'DIST-GJ-01', state_id: 'ST-GJ', name: 'Surat', code: 'SRT', headquarters: 'Surat', collector_name: 'Ayush Oak, IAS', active_projects_count: 2 },
    { id: 'DIST-GJ-02', state_id: 'ST-GJ', name: 'Vadodara', code: 'VDR', headquarters: 'Vadodara', collector_name: 'Bijai Narain, IAS', active_projects_count: 2 },
    { id: 'DIST-GJ-03', state_id: 'ST-GJ', name: 'Ahmedabad', code: 'AMD', headquarters: 'Ahmedabad', collector_name: 'Praveena D.K., IAS', active_projects_count: 2 },
    { id: 'DIST-GJ-04', state_id: 'ST-GJ', name: 'Bharuch', code: 'BHR', headquarters: 'Bharuch', collector_name: 'Tushar Sumera, IAS', active_projects_count: 1 },
    // Uttar Pradesh
    { id: 'DIST-UP-01', state_id: 'ST-UP', name: 'Gautam Buddha Nagar', code: 'GBN', headquarters: 'Greater Noida', collector_name: 'Manish Kumar Verma, IAS', active_projects_count: 3 },
    { id: 'DIST-UP-02', state_id: 'ST-UP', name: 'Varanasi', code: 'VNS', headquarters: 'Varanasi', collector_name: 'S. Rajalingam, IAS', active_projects_count: 2 },
    { id: 'DIST-UP-03', state_id: 'ST-UP', name: 'Ayodhya', code: 'AYD', headquarters: 'Ayodhya', collector_name: 'Nitish Kumar, IAS', active_projects_count: 2 },
    { id: 'DIST-UP-04', state_id: 'ST-UP', name: 'Lucknow', code: 'LKO', headquarters: 'Lucknow', collector_name: 'Surya Pal Gangwar, IAS', active_projects_count: 2 },
    // Karnataka
    { id: 'DIST-KA-01', state_id: 'ST-KA', name: 'Bengaluru Urban', code: 'BLU', headquarters: 'Bengaluru', collector_name: 'K.A. Dayananda, IAS', active_projects_count: 3 },
    { id: 'DIST-KA-02', state_id: 'ST-KA', name: 'Ramanagara', code: 'RMN', headquarters: 'Ramanagara', collector_name: 'Avinash Menon, IAS', active_projects_count: 2 },
    { id: 'DIST-KA-03', state_id: 'ST-KA', name: 'Tumakuru', code: 'TMK', headquarters: 'Tumakuru', collector_name: 'Shubha Kalyan, IAS', active_projects_count: 1 },
    // Haryana
    { id: 'DIST-HR-01', state_id: 'ST-HR', name: 'Gurugram', code: 'GGM', headquarters: 'Gurugram', collector_name: 'Nishant Kumar Yadav, IAS', active_projects_count: 2 },
    { id: 'DIST-HR-02', state_id: 'ST-HR', name: 'Rewari', code: 'REW', headquarters: 'Rewari', collector_name: 'Rahul Hooda, IAS', active_projects_count: 1 },
    // Odisha
    { id: 'DIST-OD-01', state_id: 'ST-OD', name: 'Jagatsinghpur', code: 'JSP', headquarters: 'Jagatsinghpur', collector_name: 'Parul Patawari, IAS', active_projects_count: 2 },
    { id: 'DIST-OD-02', state_id: 'ST-OD', name: 'Khordha', code: 'KHD', headquarters: 'Bhubaneswar', collector_name: 'Chanchal Rana, IAS', active_projects_count: 1 },
    // Tamil Nadu
    { id: 'DIST-TN-01', state_id: 'ST-TN', name: 'Kanchipuram', code: 'KNC', headquarters: 'Kanchipuram', collector_name: 'Kalaiselvi Mohan, IAS', active_projects_count: 2 },
    { id: 'DIST-TN-02', state_id: 'ST-TN', name: 'Chengalpattu', code: 'CGP', headquarters: 'Chengalpattu', collector_name: 'S. Arunraj, IAS', active_projects_count: 1 }
  ];

  for (const d of districts) {
    await db.run(
      'INSERT INTO districts (id, state_id, name, code, headquarters, collector_name, active_projects_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [d.id, d.state_id, d.name, d.code, d.headquarters, d.collector_name, d.active_projects_count]
    );
  }
  console.log(' Districts seeded');

  // 5. PROJECTS (8 realistic national projects)
  const projects = [
    {
      id: 'PRJ-001',
      project_code: 'MAHSR-BULLET-01',
      name: 'Mumbai-Ahmedabad High Speed Rail Corridor (Bullet Train)',
      project_type: 'High Speed Railway',
      implementing_agency: 'NHSRCL',
      ministry: 'Ministry of Railways',
      state_id: 'ST-MH',
      district_id: 'DIST-MH-01',
      required_land_ha: 1396.5,
      acquired_land_ha: 1340.2,
      remaining_land_ha: 56.3,
      budget_cr: 108000,
      compensation_budget_cr: 11200,
      start_date: '2019-01-15',
      expected_completion_date: '2027-12-31',
      current_stage: 'POSSESSION',
      overall_status: 'ON_TRACK',
      risk_level: 'LOW',
      risk_score: 28,
      sia_completed: 1,
      forest_clearance: 1,
      wildlife_clearance: 1,
      description: '508 km double track high-speed rail corridor between Mumbai BKC and Sabarmati, Gujarat operating at 320 km/h.',
      created_by: 'USR-006'
    },
    {
      id: 'PRJ-002',
      project_code: 'DME-EXP-PH3',
      name: 'Delhi-Mumbai Expressway Phase-3 (Vadodara-Virar Package)',
      project_type: 'Expressway',
      implementing_agency: 'NHAI',
      ministry: 'Ministry of Road Transport and Highways (MoRTH)',
      state_id: 'ST-MH',
      district_id: 'DIST-MH-02',
      required_land_ha: 2150.0,
      acquired_land_ha: 1820.5,
      remaining_land_ha: 329.5,
      budget_cr: 42000,
      compensation_budget_cr: 6800,
      start_date: '2020-06-01',
      expected_completion_date: '2026-10-31',
      current_stage: 'COMPENSATION_DISBURSEMENT',
      overall_status: 'DELAYED',
      risk_level: 'HIGH',
      risk_score: 78,
      sia_completed: 1,
      forest_clearance: 0,
      wildlife_clearance: 0,
      description: '8-lane greenfield access-controlled expressway section connecting southern Gujarat to Mumbai Metropolitan Region.',
      created_by: 'USR-005'
    },
    {
      id: 'PRJ-003',
      project_code: 'EDFC-SON-DAN-03',
      name: 'Eastern Dedicated Freight Corridor (Sonnagar-Dankuni Section)',
      project_type: 'Freight Corridor',
      implementing_agency: 'DFCCIL',
      ministry: 'Ministry of Railways',
      state_id: 'ST-UP',
      district_id: 'DIST-UP-02',
      required_land_ha: 1680.0,
      acquired_land_ha: 1450.0,
      remaining_land_ha: 230.0,
      budget_cr: 15400,
      compensation_budget_cr: 3100,
      start_date: '2021-03-10',
      expected_completion_date: '2026-12-15',
      current_stage: 'AWARD',
      overall_status: 'DELAYED',
      risk_level: 'MEDIUM',
      risk_score: 62,
      sia_completed: 1,
      forest_clearance: 1,
      wildlife_clearance: 1,
      description: 'Dedicated electrified double-line freight railway to de-congest coal and steel transport between UP and West Bengal.',
      created_by: 'USR-002'
    },
    {
      id: 'PRJ-004',
      project_code: 'BSRP-CORR-02',
      name: 'Bengaluru Suburban Rail Project (Corridor 2 - Kanaka Line)',
      project_type: 'Metro / Suburban Rail',
      implementing_agency: 'K-RIDE',
      ministry: 'Ministry of Housing and Urban Affairs / Railways',
      state_id: 'ST-KA',
      district_id: 'DIST-KA-01',
      required_land_ha: 145.8,
      acquired_land_ha: 62.4,
      remaining_land_ha: 83.4,
      budget_cr: 15767,
      compensation_budget_cr: 2450,
      start_date: '2022-09-01',
      expected_completion_date: '2028-03-31',
      current_stage: 'ACQUISITION',
      overall_status: 'ON_TRACK',
      risk_level: 'MEDIUM',
      risk_score: 48,
      sia_completed: 1,
      forest_clearance: 1,
      wildlife_clearance: 1,
      description: '35.5 km suburban rail link connecting Baiyappanahalli to Chikkabanavara to decongest Bengaluru tech corridor.',
      created_by: 'USR-001'
    },
    {
      id: 'PRJ-005',
      project_code: 'DHOLERA-SIR-01',
      name: 'Dholera Special Investment Region Expressway & Industrial Spine',
      project_type: 'Industrial Corridor',
      implementing_agency: 'Dholera SIRDA / NHAI',
      ministry: 'Ministry of Commerce & Industry',
      state_id: 'ST-GJ',
      district_id: 'DIST-GJ-03',
      required_land_ha: 3800.0,
      acquired_land_ha: 3650.0,
      remaining_land_ha: 150.0,
      budget_cr: 8500,
      compensation_budget_cr: 4200,
      start_date: '2018-04-12',
      expected_completion_date: '2026-06-30',
      current_stage: 'REHABILITATION_RESETTLEMENT',
      overall_status: 'ON_TRACK',
      risk_level: 'LOW',
      risk_score: 22,
      sia_completed: 1,
      forest_clearance: 1,
      wildlife_clearance: 1,
      description: 'Acquisition for smart city logistics hubs, semiconductor node, and airport access corridor in Dholera SIR.',
      created_by: 'USR-005'
    },
    {
      id: 'PRJ-006',
      project_code: 'PURV-EXP-LINK',
      name: 'Purvanchal Industrial Corridor Extension to Ballia',
      project_type: 'Expressway',
      implementing_agency: 'UPEIDA',
      ministry: 'Govt of Uttar Pradesh',
      state_id: 'ST-UP',
      district_id: 'DIST-UP-03',
      required_land_ha: 920.0,
      acquired_land_ha: 210.0,
      remaining_land_ha: 710.0,
      budget_cr: 6200,
      compensation_budget_cr: 1800,
      start_date: '2024-01-10',
      expected_completion_date: '2027-08-31',
      current_stage: 'NOTIFICATION',
      overall_status: 'ON_TRACK',
      risk_level: 'LOW',
      risk_score: 31,
      sia_completed: 1,
      forest_clearance: 1,
      wildlife_clearance: 0,
      description: '4-lane access controlled highway connecting Ghazipur on Purvanchal Expressway to Bihar border at Buxar/Ballia.',
      created_by: 'USR-002'
    },
    {
      id: 'PRJ-007',
      project_code: 'PARADIP-RAIL-01',
      name: 'Paradip Port Dedicated Rail Evacuation Double Line',
      project_type: 'Port Rail Link',
      implementing_agency: 'RVNL / MoPSW',
      ministry: 'Ministry of Ports, Shipping and Waterways',
      state_id: 'ST-OD',
      district_id: 'DIST-OD-01',
      required_land_ha: 420.0,
      acquired_land_ha: 380.0,
      remaining_land_ha: 40.0,
      budget_cr: 2300,
      compensation_budget_cr: 650,
      start_date: '2020-11-20',
      expected_completion_date: '2026-05-31',
      current_stage: 'PROJECT_CLOSURE',
      overall_status: 'COMPLETED',
      risk_level: 'LOW',
      risk_score: 14,
      sia_completed: 1,
      forest_clearance: 1,
      wildlife_clearance: 1,
      description: 'High capacity port evacuation rail infrastructure to enhance bulk mineral loading and coastal shipping.',
      created_by: 'USR-001'
    },
    {
      id: 'PRJ-008',
      project_code: 'TN-DEF-CORR-01',
      name: 'Tamil Nadu Defense Industrial Corridor Aerospace Park',
      project_type: 'Aerospace & Defense',
      implementing_agency: 'TIDCO',
      ministry: 'Ministry of Defence / Govt of Tamil Nadu',
      state_id: 'ST-TN',
      district_id: 'DIST-TN-01',
      required_land_ha: 850.0,
      acquired_land_ha: 310.0,
      remaining_land_ha: 540.0,
      budget_cr: 4800,
      compensation_budget_cr: 1450,
      start_date: '2023-08-15',
      expected_completion_date: '2027-11-30',
      current_stage: 'SCRUTINY',
      overall_status: 'ON_TRACK',
      risk_level: 'LOW',
      risk_score: 25,
      sia_completed: 1,
      forest_clearance: 1,
      wildlife_clearance: 1,
      description: 'Strategic aerospace and defense components manufacturing zone with MRO facility near Sriperumbudur.',
      created_by: 'USR-007'
    }
  ];

  for (const p of projects) {
    await db.run(
      `INSERT INTO projects (id, project_code, name, project_type, implementing_agency, ministry, state_id, district_id,
        required_land_ha, acquired_land_ha, remaining_land_ha, budget_cr, compensation_budget_cr, start_date,
        expected_completion_date, current_stage, overall_status, risk_level, risk_score, sia_completed,
        forest_clearance, wildlife_clearance, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id, p.project_code, p.name, p.project_type, p.implementing_agency, p.ministry, p.state_id, p.district_id,
        p.required_land_ha, p.acquired_land_ha, p.remaining_land_ha, p.budget_cr, p.compensation_budget_cr, p.start_date,
        p.expected_completion_date, p.current_stage, p.overall_status, p.risk_level, p.risk_score, p.sia_completed,
        p.forest_clearance, p.wildlife_clearance, p.description, p.created_by
      ]
    );
  }
  console.log(' Projects seeded');

  // 6. GENERATE 120 REALISTIC LAND PARCELS WITH GEOJSON POLYGONS
  console.log(' Generating realistic land parcels with GeoJSON polygons...');
  
  // Real coordinates centers for project clusters
  const clusterCoords = {
    'PRJ-001': { lat: 19.320, lng: 72.850, state: 'ST-MH', dist: 'DIST-MH-01', taluk: 'Vasai', villages: ['Pelhar', 'Sasunavghar', 'Bilalpada', 'Waliv'] },
    'PRJ-002': { lat: 19.696, lng: 72.771, state: 'ST-MH', dist: 'DIST-MH-02', taluk: 'Palghar', villages: ['Manor', 'Tandulwadi', 'Kelva', 'Dahanu'] },
    'PRJ-003': { lat: 25.317, lng: 82.973, state: 'ST-UP', dist: 'DIST-UP-02', taluk: 'Pindra', villages: ['Shivpur', 'Babatpur', 'Karkhiyaon', 'Raja Talab'] },
    'PRJ-004': { lat: 13.045, lng: 77.532, state: 'ST-KA', dist: 'DIST-KA-01', taluk: 'Bengaluru North', villages: ['Yeshwanthpur', 'Chikkabanavara', 'Hesaraghatta', 'Jalahalli'] },
    'PRJ-005': { lat: 22.250, lng: 72.200, state: 'ST-GJ', dist: 'DIST-GJ-03', taluk: 'Dholera', villages: ['Bhangadh', 'Kadavala', 'Pancham', 'Otariya'] },
    'PRJ-006': { lat: 26.790, lng: 82.190, state: 'ST-UP', dist: 'DIST-UP-03', taluk: 'Sohawal', villages: ['Ranimau', 'Deokali', 'Naka', 'Darshannagar'] },
    'PRJ-007': { lat: 20.260, lng: 86.660, state: 'ST-OD', dist: 'DIST-OD-01', taluk: 'Kujang', villages: ['Nuagaon', 'Dhinkia', 'Gadakujang', 'Polang'] },
    'PRJ-008': { lat: 12.834, lng: 79.703, state: 'ST-TN', dist: 'DIST-TN-01', taluk: 'Sriperumbudur', villages: ['Irungattukottai', 'Vallam', 'Mambakkam', 'Pillaipakkam'] }
  };

  const statuses = [
    'PROPOSED', 'SCRUTINY', 'APPROVED', 'NOTIFICATION',
    'ACQUISITION', 'AWARD', 'COMPENSATION_ASSESSMENT',
    'COMPENSATION_DISBURSEMENT', 'POSSESSION', 'REHABILITATION_RESETTLEMENT',
    'PROJECT_CLOSURE', 'DISPUTED'
  ];

  const landTypes = [
    'Agricultural (Irrigated)',
    'Agricultural (Dry)',
    'Commercial',
    'Industrial',
    'Homestead',
    'Barren / Grazing'
  ];

  const ownersList = [
    'Ramesh Shantaram Patil', 'Kavita Suresh Deshmukh', 'Gurmeet Singh Dhillon', 'Mohd. Iqbal Ansari',
    'Siddharth Narayan Rao', 'Babu Lal Meena', 'Ananya Subhash Mondal', 'Kailash Chander Sharma',
    'Muthu Krishnan Pillai', 'Bikram Keshari Rout', 'Lakshmi Narayanan', 'Prabhakar Gundu Naik',
    'Jayeshbhai Mohanbhai Patel', 'Santosh Tukaram Jadhav', 'Deepak Jagdish Yadav', 'Harish Chandra Verma',
    'Basavaraj S. Bommai', 'Nirmala Devi Chaubey', 'Bhaskar Rao Kulkarni', 'Suresh Chandra Swain'
  ];

  let parcelIndex = 1;
  const allParcels = [];

  for (const [projId, center] of Object.entries(clusterCoords)) {
    // create 12-16 parcels per project
    const count = projId === 'PRJ-001' || projId === 'PRJ-002' ? 18 : 14;

    for (let i = 0; i < count; i++) {
      const pId = `PCL-${String(parcelIndex).padStart(4, '0')}`;
      const parcelCode = `IND-${center.state.substring(3)}-${String(parcelIndex).padStart(5, '0')}`;
      const village = center.villages[i % center.villages.length];
      const surveyNo = `${100 + (i * 7) + (parcelIndex % 13)}/${(i % 4) + 1}${(parcelIndex % 2 === 0 ? 'A' : 'B')}`;
      const khataNo = `KH-${2000 + parcelIndex * 3}`;
      const landType = landTypes[i % landTypes.length];
      const areaHa = Number((0.8 + (parcelIndex % 9) * 0.45 + (i * 0.15)).toFixed(2));
      const marketRatePerHa = 3500000 + (parcelIndex % 5) * 600000;
      
      // Calculate RFCTLARR compensation: Multiplier (1.2 to 2.0 depending on rural/urban) + 100% Solatium + 12% Interest
      const multiplier = center.taluk.includes('Bengaluru') || center.taluk.includes('Vasai') ? 1.25 : 1.75;
      const baseValue = areaHa * marketRatePerHa * multiplier;
      const solatium = baseValue * 1.0; // 100% solatium
      const interest = baseValue * 0.12; // 12% interest
      const totalAssessed = Math.round(baseValue + solatium + interest);

      // Status distribution based on project current stage
      let acquisitionStatus;
      if (projId === 'PRJ-007') {
        acquisitionStatus = 'PROJECT_CLOSURE';
      } else if (projId === 'PRJ-001') {
        acquisitionStatus = i < 14 ? 'POSSESSION' : (i === 15 ? 'DISPUTED' : 'COMPENSATION_DISBURSEMENT');
      } else if (projId === 'PRJ-002') {
        acquisitionStatus = i < 6 ? 'COMPENSATION_DISBURSEMENT' : (i < 12 ? 'AWARD' : (i === 13 ? 'DISPUTED' : 'NOTIFICATION'));
      } else if (projId === 'PRJ-003') {
        acquisitionStatus = i < 8 ? 'AWARD' : 'ACQUISITION';
      } else if (projId === 'PRJ-004') {
        acquisitionStatus = i < 5 ? 'ACQUISITION' : (i < 10 ? 'NOTIFICATION' : 'APPROVAL');
      } else if (projId === 'PRJ-005') {
        acquisitionStatus = i < 10 ? 'REHABILITATION_RESETTLEMENT' : 'POSSESSION';
      } else if (projId === 'PRJ-006') {
        acquisitionStatus = i < 6 ? 'NOTIFICATION' : 'APPROVAL';
      } else {
        acquisitionStatus = i < 5 ? 'SCRUTINY' : 'PROPOSED';
      }

      const isDisputed = acquisitionStatus === 'DISPUTED' ? 1 : 0;
      const isPossessionTaken = acquisitionStatus === 'POSSESSION' || acquisitionStatus === 'REHABILITATION_RESETTLEMENT' || acquisitionStatus === 'PROJECT_CLOSURE';
      const possessionStatus = isPossessionTaken ? 'COMPLETED' : (acquisitionStatus === 'COMPENSATION_DISBURSEMENT' ? 'DEMARCATED' : (isDisputed ? 'DISPUTED' : 'PENDING'));
      const rrStatus = acquisitionStatus === 'REHABILITATION_RESETTLEMENT' ? 'RESETTLED' : (acquisitionStatus === 'POSSESSION' ? 'ELIGIBLE' : 'NOT_APPLICABLE');
      const disbursedCompensation = isPossessionTaken || acquisitionStatus === 'COMPENSATION_DISBURSEMENT' ? totalAssessed : (acquisitionStatus === 'AWARD' ? Math.round(totalAssessed * 0.4) : 0);

      // Polygon offset calculation for realistic coordinates around center
      const latOffset = ((i % 5) - 2) * 0.007 + ((parcelIndex % 7) * 0.001);
      const lngOffset = (Math.floor(i / 5) - 1) * 0.007 + ((parcelIndex % 5) * 0.001);
      const lat = Number((center.lat + latOffset).toFixed(6));
      const lng = Number((center.lng + lngOffset).toFixed(6));

      // Small 4-corner polygon GeoJSON
      const delta = 0.0025;
      const polygonCoordinates = [
        [Number((lng - delta).toFixed(6)), Number((lat - delta).toFixed(6))],
        [Number((lng + delta).toFixed(6)), Number((lat - delta).toFixed(6))],
        [Number((lng + delta).toFixed(6)), Number((lat + delta).toFixed(6))],
        [Number((lng - delta).toFixed(6)), Number((lat + delta).toFixed(6))],
        [Number((lng - delta).toFixed(6)), Number((lat - delta).toFixed(6))]
      ];

      const geojsonStr = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polygonCoordinates]
        },
        properties: {
          parcelId: pId,
          surveyNo: surveyNo,
          areaHa: areaHa,
          status: acquisitionStatus
        }
      });

      const ownerName = ownersList[(parcelIndex + i) % ownersList.length];

      allParcels.push({
        id: pId,
        parcel_code: parcelCode,
        project_id: projId,
        state_id: center.state,
        district_id: center.dist,
        taluk: center.taluk,
        village: village,
        survey_number: surveyNo,
        sub_division: `SD-${(i % 3) + 1}`,
        khata_number: khataNo,
        land_type: landType,
        area_ha: areaHa,
        owner_name: ownerName,
        owner_aadhaar_token: `XXXX-XXXX-${1000 + (parcelIndex * 37) % 9000}`,
        co_owners_count: 1 + (parcelIndex % 3),
        acquisition_status: acquisitionStatus,
        possession_status: possessionStatus,
        rr_status: rrStatus,
        notification_date: '2023-04-10',
        award_date: acquisitionStatus === 'AWARD' || isPossessionTaken ? '2024-02-15' : null,
        possession_date: isPossessionTaken ? '2024-08-20' : null,
        market_rate_per_ha: marketRatePerHa,
        assessed_compensation: totalAssessed,
        disbursed_compensation: disbursedCompensation,
        is_disputed: isDisputed,
        dispute_details: isDisputed ? 'Title dispute pending in High Court civil appellate bench regarding ancestral partition suit' : null,
        latitude: lat,
        longitude: lng,
        geojson_polygon: geojsonStr,
        field_verified: isPossessionTaken ? 1 : 0,
        field_verified_by: isPossessionTaken ? 'Vikramaditya Deshmukh (SLAO)' : null,
        field_verified_at: isPossessionTaken ? '2024-05-18 11:30:00' : null
      });

      parcelIndex++;
    }
  }

  for (const p of allParcels) {
    await db.run(
      `INSERT INTO land_parcels (
        id, parcel_code, project_id, state_id, district_id, taluk, village, survey_number,
        sub_division, khata_number, land_type, area_ha, owner_name, owner_aadhaar_token,
        co_owners_count, acquisition_status, possession_status, rr_status, notification_date,
        award_date, possession_date, market_rate_per_ha, assessed_compensation,
        disbursed_compensation, is_disputed, dispute_details, latitude, longitude,
        geojson_polygon, field_verified, field_verified_by, field_verified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id, p.parcel_code, p.project_id, p.state_id, p.district_id, p.taluk, p.village, p.survey_number,
        p.sub_division, p.khata_number, p.land_type, p.area_ha, p.owner_name, p.owner_aadhaar_token,
        p.co_owners_count, p.acquisition_status, p.possession_status, p.rr_status, p.notification_date,
        p.award_date, p.possession_date, p.market_rate_per_ha, p.assessed_compensation,
        p.disbursed_compensation, p.is_disputed, p.dispute_details, p.latitude, p.longitude,
        p.geojson_polygon, p.field_verified, p.field_verified_by, p.field_verified_at
      ]
    );
  }
  console.log(` ${allParcels.length} Land parcels seeded with realistic GeoJSON coordinates`);

  // 7. NOTIFICATIONS (Section 11, Section 19 RFCTLARR Act)
  const notifications = [
    {
      id: 'NOTIF-001',
      project_id: 'PRJ-001',
      notification_type: 'SEC11_PRELIMINARY',
      gazette_number: 'E-GAZETTE-MH-2022/412',
      issue_date: '2022-04-18',
      expiry_date: '2023-04-17',
      issuing_authority: 'Revenue Department, Govt of Maharashtra',
      affected_villages_count: 14,
      total_area_ha: 1396.5,
      status: 'ACTIVE',
      remarks: 'Preliminary notification under Section 11(1) of RFCTLARR Act 2013 for High-Speed Rail Corridor.'
    },
    {
      id: 'NOTIF-002',
      project_id: 'PRJ-001',
      notification_type: 'SEC19_DECLARATION',
      gazette_number: 'E-GAZETTE-MH-2023/108',
      issue_date: '2023-03-05',
      expiry_date: null,
      issuing_authority: 'District Collector, Thane',
      affected_villages_count: 14,
      total_area_ha: 1340.2,
      status: 'ACTIVE',
      remarks: 'Declaration of Acquisition under Section 19(1) of RFCTLARR Act 2013.'
    },
    {
      id: 'NOTIF-003',
      project_id: 'PRJ-002',
      notification_type: 'SEC11_PRELIMINARY',
      gazette_number: 'E-GAZETTE-DL-2023/889',
      issue_date: '2023-06-12',
      expiry_date: '2024-06-11',
      issuing_authority: 'MoRTH / District Collector, Palghar',
      affected_villages_count: 22,
      total_area_ha: 2150.0,
      status: 'ACTIVE',
      remarks: 'Preliminary notification for Delhi-Mumbai Expressway Package 3.'
    },
    {
      id: 'NOTIF-004',
      project_id: 'PRJ-003',
      notification_type: 'SEC19_DECLARATION',
      gazette_number: 'E-GAZETTE-UP-2023/504',
      issue_date: '2023-09-20',
      expiry_date: null,
      issuing_authority: 'District Magistrate, Varanasi',
      affected_villages_count: 18,
      total_area_ha: 1680.0,
      status: 'ACTIVE',
      remarks: 'Section 19 Declaration for EDFC freight corridor double lines.'
    }
  ];

  for (const n of notifications) {
    await db.run(
      `INSERT INTO notifications (id, project_id, notification_type, gazette_number, issue_date, expiry_date,
        issuing_authority, affected_villages_count, total_area_ha, status, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [n.id, n.project_id, n.notification_type, n.gazette_number, n.issue_date, n.expiry_date, n.issuing_authority,
       n.affected_villages_count, n.total_area_ha, n.status, n.remarks]
    );
  }
  console.log(' Notifications seeded');

  // 8. AWARDS
  const awards = [
    {
      id: 'AWD-001',
      project_id: 'PRJ-001',
      award_number: 'AWD/MAHSR/THN/2023/04',
      award_date: '2023-11-20',
      collector_order_ref: 'COLL/LA/890/2023',
      total_land_area_ha: 420.5,
      total_parcels_count: 28,
      total_market_value: 380000000,
      solatium_amount: 380000000,
      additional_interest: 45600000,
      asset_damages_value: 12000000,
      total_award_amount: 817600000,
      approved_by: 'Pooja Kadam, IAS (District Collector)',
      status: 'DECLARED'
    },
    {
      id: 'AWD-002',
      project_id: 'PRJ-002',
      award_number: 'AWD/NHAI/PLG/2024/02',
      award_date: '2024-03-15',
      collector_order_ref: 'COLL/DME/332/2024',
      total_land_area_ha: 310.0,
      total_parcels_count: 20,
      total_market_value: 290000000,
      solatium_amount: 290000000,
      additional_interest: 34800000,
      asset_damages_value: 8500000,
      total_award_amount: 623300000,
      approved_by: 'Govind Bodke, IAS (District Collector)',
      status: 'DECLARED'
    }
  ];

  for (const a of awards) {
    await db.run(
      `INSERT INTO awards (id, project_id, award_number, award_date, collector_order_ref, total_land_area_ha,
        total_parcels_count, total_market_value, solatium_amount, additional_interest, asset_damages_value,
        total_award_amount, approved_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.project_id, a.award_number, a.award_date, a.collector_order_ref, a.total_land_area_ha,
       a.total_parcels_count, a.total_market_value, a.solatium_amount, a.additional_interest,
       a.asset_damages_value, a.total_award_amount, a.approved_by, a.status]
    );
  }
  console.log(' Awards seeded');

  // 9. COMPENSATION & BENEFICIARIES
  // Populate compensation records from the seeded parcels
  let compCount = 0;
  for (const p of allParcels.slice(0, 50)) {
    const compId = `CMP-${String(compCount + 1).padStart(4, '0')}`;
    const baseValue = Math.round(p.assessed_compensation * 0.45);
    const solatium = baseValue; // 100%
    const interest = Math.round(p.assessed_compensation * 0.10);
    const total = p.assessed_compensation;
    const isDisbursed = p.disbursed_compensation >= total;
    const isPartial = p.disbursed_compensation > 0 && !isDisbursed;
    const paymentStatus = isDisbursed ? 'DISBURSED' : (isPartial ? 'PROCESSING' : (p.is_disputed ? 'ON_HOLD' : 'TREASURY_ESCROW'));
    const utr = isDisbursed ? `SBIN000${912340 + compCount}RTGS` : null;

    await db.run(
      `INSERT INTO compensation (
        id, parcel_id, award_id, beneficiary_name, aadhaar_hash, bank_account_masked,
        ifsc_code, bank_name, base_land_value, solatium_amount, interest_amount,
        structures_value, trees_crops_value, total_assessed, total_disbursed,
        payment_status, payment_mode, utr_number, disbursement_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        compId, p.id, compCount < 25 ? 'AWD-001' : 'AWD-002', p.owner_name,
        `SHA256-${uuidv4().substring(0, 16)}`, `XXXX-XXXX-${3450 + (compCount * 17) % 5000}`,
        'SBIN0001245', 'State Bank of India', baseValue, solatium, interest,
        150000, 75000, total, p.disbursed_compensation, paymentStatus, 'DBT_PFMS',
        utr, isDisbursed ? '2024-04-12' : null
      ]
    );
    compCount++;
  }
  console.log(` ${compCount} Compensation & beneficiary DBT records seeded`);

  // 10. AFFECTED FAMILIES & R&R CASES
  const familyHeads = [
    { name: 'Shantaram Bhikaji Patil', projId: 'PRJ-001', dist: 'DIST-MH-01', cat: 'OBC', members: 5, bpl: 0, disp: 1 },
    { name: 'Kisan Devaji Gharat', projId: 'PRJ-001', dist: 'DIST-MH-01', cat: 'ST', members: 6, bpl: 1, disp: 1 },
    { name: 'Pandurang Mahadu Raut', projId: 'PRJ-001', dist: 'DIST-MH-01', cat: 'OBC', members: 4, bpl: 0, disp: 0 },
    { name: 'Balaram Vithal Tandel', projId: 'PRJ-002', dist: 'DIST-MH-02', cat: 'ST', members: 7, bpl: 1, disp: 1 },
    { name: 'Damodar Janu Jadhav', projId: 'PRJ-002', dist: 'DIST-MH-02', cat: 'SC', members: 5, bpl: 1, disp: 1 },
    { name: 'Jagdish Ramchandra Yadav', projId: 'PRJ-003', dist: 'DIST-UP-02', cat: 'OBC', members: 8, bpl: 0, disp: 1 },
    { name: 'Harinarayan Shivpujan Mishra', projId: 'PRJ-003', dist: 'DIST-UP-02', cat: 'GENERAL', members: 4, bpl: 0, disp: 0 },
    { name: 'Chennappa Venkatesh', projId: 'PRJ-004', dist: 'DIST-KA-01', cat: 'SC', members: 5, bpl: 1, disp: 1 },
    { name: 'Narsimhaiah Muniyappa', projId: 'PRJ-004', dist: 'DIST-KA-01', cat: 'OBC', members: 4, bpl: 0, disp: 0 },
    { name: 'Govindbhai Jethabhai Bharwad', projId: 'PRJ-005', dist: 'DIST-GJ-03', cat: 'OBC', members: 6, bpl: 1, disp: 1 },
    { name: 'Manubhai Dayabhai Solanki', projId: 'PRJ-005', dist: 'DIST-GJ-03', cat: 'SC', members: 5, bpl: 1, disp: 1 },
    { name: 'Satyabrata Pradhan', projId: 'PRJ-007', dist: 'DIST-OD-01', cat: 'OBC', members: 5, bpl: 0, disp: 1 }
  ];

  let famIdx = 1;
  for (const f of familyHeads) {
    const famId = `FAM-${String(famIdx).padStart(3, '0')}`;
    await db.run(
      `INSERT INTO affected_families (id, project_id, family_head_name, family_head_aadhaar,
        family_members_count, social_category, bpl_card_holder, displacement_type,
        is_displaced, current_village, district_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        famId, f.projId, f.name, `XXXX-XXXX-${2340 + famIdx * 19}`, f.members, f.cat,
        f.bpl, f.disp ? 'TITLE_HOLDER' : 'AGRICULTURAL_LABOURER', f.disp, 'Gram Panchayat Revenue Village', f.dist
      ]
    );

    // Create R&R dossier case for displaced families
    if (f.disp) {
      const rrCaseId = `RR-${String(famIdx).padStart(3, '0')}`;
      const isSettled = f.projId === 'PRJ-005' || f.projId === 'PRJ-007';
      await db.run(
        `INSERT INTO rr_cases (id, family_id, project_id, resettlement_colony_name,
          house_allotment_status, house_plot_number, housing_grant_amount, housing_grant_disbursed,
          one_time_resettlement_allowance, resettlement_allowance_disbursed, annuity_monthly_grant,
          skill_training_provided, skill_course_name, overall_rr_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rrCaseId, famId, f.projId, 'Adarsh Punarvas Colony, Sector 4',
          isSettled ? 'OCCUPIED' : 'UNDER_CONSTRUCTION', `PLOT-${100 + famIdx}`,
          150000, isSettled ? 1 : 0, 50000, 1, 2000,
          isSettled ? 1 : 0, 'Heavy Motor Vehicle Driver & Electrician',
          isSettled ? 'RESETTLED' : 'IN_PROGRESS'
        ]
      );
    }
    famIdx++;
  }
  console.log(' Affected families & R&R dossiers seeded');

  // 11. DOCUMENTS REPOSITORY
  const docs = [
    {
      id: 'DOC-001',
      project_id: 'PRJ-001',
      parcel_id: 'PCL-0001',
      document_type: 'LAND_RECORD_7_12',
      title: 'Extract 7/12 & RoR Cadastral Ledger for Sy 100/1A',
      file_name: 'MAH_THN_7_12_Sy100_1A.pdf',
      version: 'v1.1',
      uploaded_by: 'Vikramaditya Deshmukh (SLAO)',
      verified: 1,
      verified_by: 'Pooja Kadam, IAS'
    },
    {
      id: 'DOC-002',
      project_id: 'PRJ-001',
      parcel_id: null,
      document_type: 'GAZETTE_SEC11',
      title: 'Gazette Extra-Ordinary Sec 11 Notification Bulletin',
      file_name: 'MAHSR_Sec11_OfficialGazette_2022.pdf',
      version: 'v1.0',
      uploaded_by: 'Sunita Verma, IAS',
      verified: 1,
      verified_by: 'Dr. Rajeshwar Sharma'
    },
    {
      id: 'DOC-003',
      project_id: 'PRJ-002',
      parcel_id: 'PCL-0020',
      document_type: 'VALUATION_REPORT',
      title: 'Structural and Agricultural Tree Valuation Survey Report',
      file_name: 'DME_Palghar_Valuation_Package3.pdf',
      version: 'v1.0',
      uploaded_by: 'Govind Bodke, IAS',
      verified: 1,
      verified_by: 'Anand Kumar Patil, IAS'
    },
    {
      id: 'DOC-004',
      project_id: 'PRJ-003',
      parcel_id: null,
      document_type: 'COLLECTOR_AWARD',
      title: 'Collector Final Award Order Section 23/30 EDFC Chandauli',
      file_name: 'EDFC_Award_Order_Sec23_2023.pdf',
      version: 'v1.0',
      uploaded_by: 'S. Rajalingam, IAS',
      verified: 1,
      verified_by: 'Sunita Verma, IAS'
    }
  ];

  for (const d of docs) {
    await db.run(
      `INSERT INTO documents (id, project_id, parcel_id, document_type, title, file_name,
        file_size_kb, mime_type, version, uploaded_by, verified, verified_by, file_url)
       VALUES (?, ?, ?, ?, ?, ?, 2048, 'application/pdf', ?, ?, ?, ?, ?)`,
      [d.id, d.project_id, d.parcel_id, d.document_type, d.title, d.file_name, d.version, d.uploaded_by, d.verified, d.verified_by, `/uploads/${d.file_name}`]
    );
  }
  console.log(' Document repository records seeded');

  // 12. 12-STAGE MILESTONES FOR PROJECTS
  const stages12 = [
    { num: 1, name: 'Project Proposal' },
    { num: 2, name: 'Land Requirement & SIA' },
    { num: 3, name: 'Scrutiny & Verification' },
    { num: 4, name: 'Statutory Approval' },
    { num: 5, name: 'Section 11 Notification' },
    { num: 6, name: 'Section 19 Declaration' },
    { num: 7, name: 'Award Declaration' },
    { num: 8, name: 'Compensation Assessment' },
    { num: 9, name: 'Compensation Disbursement' },
    { num: 10, name: 'Possession Takeover' },
    { num: 11, name: 'Rehabilitation & Resettlement' },
    { num: 12, name: 'Project Closure' }
  ];

  let msIndex = 1;
  for (const p of projects) {
    for (const st of stages12) {
      const msId = `MS-${String(msIndex).padStart(4, '0')}`;
      let status = 'PENDING';
      let actualDate = null;

      // Determine milestone status based on project current stage
      const stageMap = {
        'PROPOSAL': 1, 'LAND_REQUIREMENT': 2, 'SCRUTINY': 3, 'APPROVAL': 4,
        'NOTIFICATION': 5, 'ACQUISITION': 6, 'AWARD': 7, 'COMPENSATION_ASSESSMENT': 8,
        'COMPENSATION_DISBURSEMENT': 9, 'POSSESSION': 10, 'REHABILITATION_RESETTLEMENT': 11,
        'PROJECT_CLOSURE': 12
      };

      const currentStageNum = stageMap[p.current_stage] || 6;
      if (st.num < currentStageNum) {
        status = 'COMPLETED';
        actualDate = '2023-05-15';
      } else if (st.num === currentStageNum) {
        status = p.overall_status === 'DELAYED' ? 'DELAYED' : 'IN_PROGRESS';
      }

      await db.run(
        `INSERT INTO milestones (id, project_id, stage_name, stage_number, target_date,
          actual_completion_date, status, responsible_agency, remarks)
         VALUES (?, ?, ?, ?, '2025-06-30', ?, ?, ?, ?)`,
        [msId, p.id, st.name, st.num, actualDate, status, p.implementing_agency, `Milestone monitoring stage ${st.num} for ${p.name}`]
      );
      msIndex++;
    }
  }
  console.log(' 12-Stage Milestones seeded for all infrastructure projects');

  // 13. ALERTS (Statutory deadlines, delays, R&R backlogs)
  const alerts = [
    {
      id: 'ALT-001',
      project_id: 'PRJ-002',
      alert_type: 'STATUTORY_DEADLINE',
      severity: 'CRITICAL',
      title: 'Section 19 Declaration Expiry Alert',
      message: 'Preliminary notification issued on 12-Jun-2023. Section 19 declaration must be published within 12 months under RFCTLARR Section 19(7) to prevent lapse of land acquisition proceedings in Palghar district.',
      is_resolved: 0
    },
    {
      id: 'ALT-002',
      project_id: 'PRJ-002',
      alert_type: 'DELAYED_AWARD',
      severity: 'HIGH',
      title: 'Collector Award Deliberation Overdue (>74 Days)',
      message: 'Award declaration hearing pending before Special Land Acquisition Officer. Compensation disbursal SLA violated for 18 parcels.',
      is_resolved: 0
    },
    {
      id: 'ALT-003',
      project_id: 'PRJ-003',
      alert_type: 'RR_BACKLOG',
      severity: 'HIGH',
      title: 'Resettlement Colony Housing Backlog',
      message: '48 families displaced in Sonnagar-Dankuni section awaiting physical house handover at Chandauli resettlement enclave.',
      is_resolved: 0
    },
    {
      id: 'ALT-004',
      project_id: 'PRJ-001',
      alert_type: 'LITIGATION_FLAG',
      severity: 'MEDIUM',
      title: 'Interim Stay Application in High Court',
      message: 'Special Civil Application filed regarding Sy 114/2 Pelhar village. Hearing scheduled for next month; possession paused on 1.2 Ha.',
      is_resolved: 0
    },
    {
      id: 'ALT-005',
      project_id: 'PRJ-004',
      alert_type: 'PENDING_DISBURSEMENT',
      severity: 'MEDIUM',
      title: 'Pending Treasury Fund Sanction for Bengaluru Suburban',
      message: '₹45 Crores escrow transfer pending state finance clearance for Yeshwanthpur depot expansion parcels.',
      is_resolved: 0
    }
  ];

  for (const al of alerts) {
    await db.run(
      `INSERT INTO alerts (id, project_id, alert_type, severity, title, message, is_resolved)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [al.id, al.project_id, al.alert_type, al.severity, al.title, al.message, al.is_resolved]
    );
  }
  console.log(' Active SLA alerts seeded');

  // 14. INITIAL AUDIT LOGS
  const auditLogs = [
    {
      id: 'AUD-0001',
      user_id: 'USR-004',
      user_name: 'Pooja Kadam, IAS',
      user_role: 'DISTRICT_ADMIN',
      action: 'APPROVE',
      entity: 'AWARD',
      entity_id: 'AWD-001',
      previous_value: 'DRAFT',
      new_value: 'DECLARED',
      ip_address: '10.24.112.45'
    },
    {
      id: 'AUD-0002',
      user_id: 'USR-005',
      user_name: 'Vikramaditya Deshmukh',
      user_role: 'LAND_AUTHORITY',
      action: 'DISBURSE',
      entity: 'COMPENSATION',
      entity_id: 'CMP-0001',
      previous_value: 'PROCESSING',
      new_value: 'DISBURSED',
      ip_address: '10.24.112.89'
    },
    {
      id: 'AUD-0003',
      user_id: 'USR-006',
      user_name: 'Pradeep R. Nair',
      user_role: 'PROJECT_AGENCY',
      action: 'UPDATE',
      entity: 'POSSESSION',
      entity_id: 'PCL-0001',
      previous_value: 'DEMARCATED',
      new_value: 'COMPLETED',
      ip_address: '10.24.115.12'
    },
    {
      id: 'AUD-0004',
      user_id: 'USR-002',
      user_name: 'Sunita Verma, IAS',
      user_role: 'CENTRAL_MINISTRY',
      action: 'UPDATE',
      entity: 'PROJECT',
      entity_id: 'PRJ-002',
      previous_value: 'ON_TRACK',
      new_value: 'DELAYED',
      ip_address: '10.10.4.15'
    }
  ];

  for (const lg of auditLogs) {
    await db.run(
      `INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity, entity_id, previous_value, new_value, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [lg.id, lg.user_id, lg.user_name, lg.user_role, lg.action, lg.entity, lg.entity_id, lg.previous_value, lg.new_value, lg.ip_address]
    );
  }
  console.log(' Audit logs seeded');

  console.log('✅ Database initialization and seeding completed successfully!');
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  runSeed().then(() => process.exit(0)).catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}
