import { v4 as uuidv4 } from 'uuid';
import db from '../models/dbAdapter.js';
import { recordAuditLog } from '../middleware/auditMiddleware.js';

export async function getParcels(req, res) {
  try {
    const {
      project_id, state_id, district_id, status, possession_status,
      land_type, is_disputed, search, limit
    } = req.query;

    let sql = `
      SELECT p.*, prj.name as project_name, prj.project_code,
             s.name as state_name, d.name as district_name
      FROM land_parcels p
      LEFT JOIN projects prj ON p.project_id = prj.id
      LEFT JOIN states s ON p.state_id = s.id
      LEFT JOIN districts d ON p.district_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) {
      sql += ' AND p.project_id = ?';
      params.push(project_id);
    }
    if (state_id) {
      sql += ' AND p.state_id = ?';
      params.push(state_id);
    }
    if (district_id) {
      sql += ' AND p.district_id = ?';
      params.push(district_id);
    }
    if (status) {
      sql += ' AND p.acquisition_status = ?';
      params.push(status);
    }
    if (possession_status) {
      sql += ' AND p.possession_status = ?';
      params.push(possession_status);
    }
    if (land_type) {
      sql += ' AND p.land_type = ?';
      params.push(land_type);
    }
    if (is_disputed !== undefined) {
      sql += ' AND p.is_disputed = ?';
      params.push(Number(is_disputed));
    }
    if (search) {
      sql += ' AND (p.survey_number LIKE ? OR p.owner_name LIKE ? OR p.village LIKE ? OR p.parcel_code LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY p.id ASC';
    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }

    const parcels = await db.query(sql, params);

    // Format geojson features
    const features = parcels.map(p => {
      let geojson = null;
      try {
        if (p.geojson_polygon) {
          geojson = JSON.parse(p.geojson_polygon);
        }
      } catch (e) {
        geojson = null;
      }
      return {
        ...p,
        geojson
      };
    });

    return res.json({
      success: true,
      count: features.length,
      parcels: features
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getParcelById(req, res) {
  try {
    const { id } = req.params;
    const parcel = await db.getOne(
      `SELECT p.*, prj.name as project_name, prj.project_code,
              s.name as state_name, d.name as district_name
       FROM land_parcels p
       LEFT JOIN projects prj ON p.project_id = prj.id
       LEFT JOIN states s ON p.state_id = s.id
       LEFT JOIN districts d ON p.district_id = d.id
       WHERE p.id = ? OR p.parcel_code = ?`,
      [id, id]
    );

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Land parcel not found.' });
    }

    // Compensation record
    const compensation = await db.getOne(
      'SELECT * FROM compensation WHERE parcel_id = ?',
      [parcel.id]
    );

    // Possession records
    const possession = await db.getOne(
      'SELECT * FROM possession WHERE parcel_id = ?',
      [parcel.id]
    );

    // Documents
    const documents = await db.query(
      'SELECT * FROM documents WHERE parcel_id = ?',
      [parcel.id]
    );

    let parsedGeojson = null;
    try {
      if (parcel.geojson_polygon) {
        parsedGeojson = JSON.parse(parcel.geojson_polygon);
      }
    } catch (e) {
      // ignore
    }

    return res.json({
      success: true,
      parcel: {
        ...parcel,
        geojson: parsedGeojson,
        compensation,
        possession,
        documents
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createParcel(req, res) {
  try {
    const {
      project_id, state_id, district_id, taluk, village, survey_number,
      khata_number, land_type, area_ha, owner_name, owner_aadhaar_token,
      latitude, longitude, market_rate_per_ha
    } = req.body;

    if (!project_id || !survey_number || !village || !area_ha || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Missing required parcel geo-tagging fields.' });
    }

    const id = 'PCL-' + uuidv4().substring(0, 6).toUpperCase();
    const parcelCode = `IND-TAG-${Math.floor(10000 + Math.random() * 90000)}`;
    const rate = Number(market_rate_per_ha || 4000000);
    const area = Number(area_ha);
    // Fair compensation calculation
    const baseValue = area * rate * 1.5;
    const totalComp = Math.round(baseValue * 2.12); // Solatium 100% + 12% interest

    // Construct simple polygon around the coordinates
    const lat = Number(latitude);
    const lng = Number(longitude);
    const delta = 0.002;
    const polygonCoords = [
      [Number((lng - delta).toFixed(6)), Number((lat - delta).toFixed(6))],
      [Number((lng + delta).toFixed(6)), Number((lat - delta).toFixed(6))],
      [Number((lng + delta).toFixed(6)), Number((lat + delta).toFixed(6))],
      [Number((lng - delta).toFixed(6)), Number((lat + delta).toFixed(6))],
      [Number((lng - delta).toFixed(6)), Number((lat - delta).toFixed(6))]
    ];

    const geojson = JSON.stringify({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [polygonCoords]
      },
      properties: {
        parcelId: id,
        surveyNo: survey_number,
        areaHa: area,
        status: 'PROPOSED'
      }
    });

    await db.run(
      `INSERT INTO land_parcels (
        id, parcel_code, project_id, state_id, district_id, taluk, village,
        survey_number, khata_number, land_type, area_ha, owner_name, owner_aadhaar_token,
        acquisition_status, possession_status, rr_status, market_rate_per_ha,
        assessed_compensation, disbursed_compensation, is_disputed, latitude, longitude,
        geojson_polygon, field_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PROPOSED', 'PENDING', 'NOT_APPLICABLE', ?, ?, 0, 0, ?, ?, ?, 0)`,
      [
        id, parcelCode, project_id, state_id || 'ST-MH', district_id || 'DIST-MH-01',
        taluk || 'General Taluk', village, survey_number, khata_number || 'KH-NEW',
        land_type || 'Agricultural (Dry)', area, owner_name || 'Khatedar Beneficiary',
        owner_aadhaar_token || 'XXXX-XXXX-9999', rate, totalComp, lat, lng, geojson
      ]
    );

    await recordAuditLog({
      userId: req.user ? req.user.id : null,
      userName: req.user ? req.user.name : 'OFFICER',
      userRole: req.user ? req.user.role : 'LAND_AUTHORITY',
      action: 'CREATE',
      entity: 'PARCEL',
      entityId: id,
      newValue: `Geo-tagged parcel Sy ${survey_number}, Village: ${village}, Area: ${area} Ha`,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Land parcel geo-tagged successfully.',
      parcelId: id,
      parcelCode
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function fieldVerifyParcel(req, res) {
  try {
    const { id } = req.params;
    const { possession_status, remarks, demarcation_verified, latitude, longitude } = req.body;

    const parcel = await db.getOne('SELECT * FROM land_parcels WHERE id = ?', [id]);
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    const officerName = req.user ? req.user.name : 'Field Revenue Officer';
    const newPossession = possession_status || 'DEMARCATED';

    await db.run(
      `UPDATE land_parcels
       SET field_verified = 1,
           field_verified_by = ?,
           field_verified_at = CURRENT_TIMESTAMP,
           possession_status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [officerName, newPossession, id]
    );

    // If completed possession, create possession record
    if (newPossession === 'COMPLETED') {
      const posId = 'POS-' + uuidv4().substring(0, 6).toUpperCase();
      await db.run(
        `INSERT INTO possession (
          id, project_id, parcel_id, possession_type, panchnama_number, handover_date,
          handed_over_by, taken_over_by, remarks
        ) VALUES (?, ?, ?, 'PHYSICAL', ?, CURRENT_DATE, ?, 'Implementing Agency', ?)`,
        [posId, parcel.project_id, parcel.id, `PAN-${Math.floor(1000 + Math.random() * 9000)}`, officerName, remarks || 'On-site boundary stones demarcated and physical handover recorded.']
      );
    }

    await recordAuditLog({
      userId: req.user ? req.user.id : null,
      userName: officerName,
      userRole: req.user ? req.user.role : 'LAND_AUTHORITY',
      action: 'GEO_VERIFY',
      entity: 'PARCEL',
      entityId: id,
      previousValue: parcel.possession_status,
      newValue: `${newPossession} (Field verified: ${remarks || 'Demarcation stones checked'})`,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Field verification completed and recorded.',
      parcelId: id,
      possession_status: newPossession
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
