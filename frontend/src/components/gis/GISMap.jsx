import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, MapPin, ZoomIn, Search, CheckCircle2, AlertTriangle, Compass } from 'lucide-react';
import { StatusBadge } from '../common/Badge';

// Fix Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const statusColorMap = {
  POSSESSION: { color: '#059669', fillColor: '#10b981', label: 'Possession Taken' },
  COMPENSATION_DISBURSEMENT: { color: '#0d9488', fillColor: '#14b8a6', label: 'Compensation Disbursed' },
  AWARD: { color: '#2563eb', fillColor: '#3b82f6', label: 'Award Declared' },
  NOTIFICATION: { color: '#7c3aed', fillColor: '#8b5cf6', label: 'Section 11 Notified' },
  ACQUISITION: { color: '#4f46e5', fillColor: '#6366f1', label: 'Section 19 Declared' },
  APPROVAL: { color: '#0284c7', fillColor: '#38bdf8', label: 'Govt Approved' },
  SCRUTINY: { color: '#0369a1', fillColor: '#0ea5e9', label: 'Scrutiny & SIA' },
  PROPOSED: { color: '#d97706', fillColor: '#f59e0b', label: 'Proposed' },
  REHABILITATION_RESETTLEMENT: { color: '#ca8a04', fillColor: '#eab308', label: 'R&R Ongoing' },
  PROJECT_CLOSURE: { color: '#475569', fillColor: '#64748b', label: 'Project Closed' },
  DISPUTED: { color: '#dc2626', fillColor: '#ef4444', label: 'Disputed / Stay' }
};

// Map Recenter Controller
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function GISMap({
  parcels = [],
  selectedParcel = null,
  onSelectParcel,
  center = [20.5937, 78.9629], // Default India Center
  zoom = 5,
  height = '600px'
}) {
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [tileMode, setTileMode] = useState('osm'); // 'osm' | 'topo'

  useEffect(() => {
    if (center) {
      setMapCenter(center);
      setMapZoom(zoom);
    }
  }, [center, zoom]);

  const tileUrls = {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  const [legendOpen, setLegendOpen] = useState(false);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm w-full" style={{ height }}>
      {/* Map Header Floating Toolbar */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-white/95 backdrop-blur rounded-lg shadow-md p-1.5 sm:p-2 border border-slate-200 flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs max-w-[80%] truncate">
        <span className="font-bold text-slate-800 flex items-center gap-1 shrink-0">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700" />
          <span className="hidden sm:inline">GIS Cadastral Overlay</span>
          <span className="sm:hidden">GIS Overlay</span>
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600 truncate"><strong>{parcels.length}</strong> Parcels</span>
      </div>

      {/* Layer & Legend Toggle Buttons */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex items-center space-x-1.5">
        <button
          onClick={() => setLegendOpen(!legendOpen)}
          className="sm:hidden bg-white/95 backdrop-blur px-2 py-1 rounded-lg shadow-md border border-slate-200 text-[11px] font-bold text-slate-700"
        >
          {legendOpen ? 'Hide Legend' : 'Legend'}
        </button>

        <div className="bg-white/95 backdrop-blur rounded-lg shadow-md p-1 border border-slate-200 flex items-center text-xs">
          <button
            onClick={() => setTileMode(tileMode === 'osm' ? 'topo' : 'osm')}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 font-medium text-slate-700 text-[11px] sm:text-xs"
            title="Toggle Map Style"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="capitalize">{tileMode === 'osm' ? 'Topo' : 'Standard'}</span>
          </button>
        </div>
      </div>

      {/* Map Legend (Collapsible on Mobile, Persistent on Desktop) */}
      <div className={`absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 bg-white/95 backdrop-blur rounded-xl shadow-lg p-2.5 sm:p-3 border border-slate-200 text-[10px] sm:text-[11px] max-w-[240px] sm:max-w-xs transition-all ${
        legendOpen ? 'block' : 'hidden sm:block'
      }`}>
        <div className="font-bold text-slate-800 uppercase tracking-wider text-[9px] sm:text-[10px] mb-1.5 flex items-center justify-between">
          <span>Acquisition Status Legend</span>
          <button onClick={() => setLegendOpen(false)} className="sm:hidden text-slate-400 font-bold">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600 shrink-0"></span>
            <span className="text-slate-700 truncate">Possession</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-teal-600 shrink-0"></span>
            <span className="text-slate-700 truncate">DBT Disbursed</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-600 shrink-0"></span>
            <span className="text-slate-700 truncate">Award Declared</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-purple-600 shrink-0"></span>
            <span className="text-slate-700 truncate">Sec 11 / 19</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 shrink-0"></span>
            <span className="text-slate-700 truncate">Proposed / SIA</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-red-600 shrink-0"></span>
            <span className="text-slate-700 truncate">Disputed / Stay</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileUrls[tileMode]}
        />

        {/* Render Land Parcel Polygons */}
        {parcels.map((parcel) => {
          const style = statusColorMap[parcel.acquisition_status] || statusColorMap.PROPOSED;
          const isSelected = selectedParcel && selectedParcel.id === parcel.id;

          let coordinates = [];
          if (parcel.geojson && parcel.geojson.geometry && parcel.geojson.geometry.coordinates) {
            // Leaflet expects [lat, lng], GeoJSON is [lng, lat]
            coordinates = parcel.geojson.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
          } else {
            // Fallback square around parcel lat/lng
            const d = 0.002;
            coordinates = [
              [parcel.latitude - d, parcel.longitude - d],
              [parcel.latitude + d, parcel.longitude - d],
              [parcel.latitude + d, parcel.longitude + d],
              [parcel.latitude - d, parcel.longitude + d]
            ];
          }

          return (
            <React.Fragment key={parcel.id}>
              <Polygon
                positions={coordinates}
                pathOptions={{
                  color: isSelected ? '#f59e0b' : style.color,
                  weight: isSelected ? 4 : 2,
                  fillColor: style.fillColor,
                  fillOpacity: isSelected ? 0.75 : 0.45
                }}
                eventHandlers={{
                  click: () => onSelectParcel && onSelectParcel(parcel)
                }}
              >
                <Popup>
                  <div className="p-2 max-w-xs text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1 mb-1.5">
                      <span className="font-bold text-slate-900">{parcel.survey_number}</span>
                      <StatusBadge status={parcel.acquisition_status} />
                    </div>
                    <div className="space-y-0.5 text-slate-600 text-[11px]">
                      <div><strong>Village:</strong> {parcel.village}, {parcel.taluk}</div>
                      <div><strong>Area:</strong> {parcel.area_ha} Hectares</div>
                      <div><strong>Owner:</strong> {parcel.owner_name}</div>
                      <div><strong>Assessed Comp:</strong> ₹{(parcel.assessed_compensation / 100000).toFixed(2)} Lakhs</div>
                      <div><strong>Possession:</strong> {parcel.possession_status}</div>
                    </div>
                    <button
                      onClick={() => onSelectParcel && onSelectParcel(parcel)}
                      className="mt-2 w-full py-1 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded text-[11px] transition"
                    >
                      View Full Parcel Details
                    </button>
                  </div>
                </Popup>
              </Polygon>

              {/* Center point marker for fast visual locating */}
              <Marker
                position={[parcel.latitude, parcel.longitude]}
                eventHandlers={{
                  click: () => onSelectParcel && onSelectParcel(parcel)
                }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
