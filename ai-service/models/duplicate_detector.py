import math

def calculate_bounding_box(coords):
    """Calculates min/max lat/lng from polygon coordinate array."""
    lats = [c[1] for c in coords]
    lngs = [c[0] for c in coords]
    return {
        "min_lat": min(lats),
        "max_lat": max(lats),
        "min_lng": min(lngs),
        "max_lng": max(lngs)
    }

def boxes_intersect(b1, b2, margin=0.0002):
    """Checks whether two bounding boxes overlap within margin."""
    return not (
        b1["max_lng"] + margin < b2["min_lng"] or
        b1["min_lng"] - margin > b2["max_lng"] or
        b1["max_lat"] + margin < b2["min_lat"] or
        b1["min_lat"] - margin > b2["max_lat"]
    )

def detect_duplicate_parcels(target_parcel: dict, existing_parcels: list) -> dict:
    """
    Detects potential duplicate claims, overlapping survey numbers, or geometric
    parcel boundary collisions across land acquisition records.
    """
    target_survey = str(target_parcel.get("survey_number", "")).strip().lower()
    target_village = str(target_parcel.get("village", "")).strip().lower()
    target_dist = str(target_parcel.get("district_id", "")).strip().lower()
    target_lat = float(target_parcel.get("latitude", 0))
    target_lng = float(target_parcel.get("longitude", 0))

    collisions = []

    for p in existing_parcels:
        if p.get("id") == target_parcel.get("id"):
            continue

        p_survey = str(p.get("survey_number", "")).strip().lower()
        p_village = str(p.get("village", "")).strip().lower()
        p_dist = str(p.get("district_id", "")).strip().lower()
        p_lat = float(p.get("latitude", 0))
        p_lng = float(p.get("longitude", 0))

        match_reasons = []
        severity = "LOW"
        collision_score = 0

        # Exact survey match in same village/district
        if target_survey and p_survey and target_survey == p_survey and target_village == p_village:
            collision_score += 70
            severity = "CRITICAL"
            match_reasons.append(f"Identical Survey Number '{target_parcel.get('survey_number')}' in village '{p.get('village')}' (Collision with {p.get('parcel_code', p.get('id'))})")

        # Spatial distance check (< 250 meters)
        lat_diff = (target_lat - p_lat) * 111000  # meters approx
        lng_diff = (target_lng - p_lng) * 111000 * math.cos(math.radians(target_lat or 19.0))
        distance_meters = math.sqrt(lat_diff**2 + lng_diff**2)

        if distance_meters < 80:
            collision_score += 65
            severity = "CRITICAL" if severity != "CRITICAL" else severity
            match_reasons.append(f"Spatial overlap: Center coordinates located within {int(distance_meters)}m of existing parcel {p.get('parcel_code', p.get('id'))}")
        elif distance_meters < 300:
            collision_score += 30
            match_reasons.append(f"Adjacent parcel proximity ({int(distance_meters)}m) detected with {p.get('parcel_code', p.get('id'))}")

        # Name / Aadhaar token collision
        if target_parcel.get("owner_aadhaar_token") and p.get("owner_aadhaar_token") == target_parcel.get("owner_aadhaar_token") and p.get("id") != target_parcel.get("id"):
            collision_score += 40
            match_reasons.append("Identical Aadhaar token registered across multiple acquisition claim files")

        if collision_score >= 40:
            collisions.append({
                "colliding_parcel_id": p.get("id"),
                "colliding_parcel_code": p.get("parcel_code"),
                "survey_number": p.get("survey_number"),
                "village": p.get("village"),
                "distance_meters": round(distance_meters, 1),
                "collision_score": min(collision_score, 100),
                "severity": severity,
                "reasons": match_reasons
            })

    # Sort collisions by severity / collision score
    collisions.sort(key=lambda x: x["collision_score"], reverse=True)

    has_duplicate = len(collisions) > 0 and collisions[0]["collision_score"] >= 60

    return {
        "is_duplicate_detected": has_duplicate,
        "highest_risk_severity": collisions[0]["severity"] if collisions else "NONE",
        "collisions_count": len(collisions),
        "collisions": collisions[:5],
        "recommendation": "Hold award declaration pending Joint Measurement Survey (JMS) ground demarcation verification" if has_duplicate else "No spatial or cadastral survey collision detected. Safe to proceed with notification."
    }
