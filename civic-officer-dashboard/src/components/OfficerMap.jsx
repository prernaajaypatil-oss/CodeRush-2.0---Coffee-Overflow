import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon issue in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default coordinates centered on city region
const defaultCenter = [21.1458, 79.0882]; 

export default function OfficerMap({ complaints = [] }) {
  // Sample mapping data with coordinates
  const markers = complaints.map((item, index) => ({
    ...item,
    lat: item.lat || defaultCenter[0] + (Math.random() - 0.5) * 0.05,
    lng: item.lng || defaultCenter[1] + (Math.random() - 0.5) * 0.05,
  }));

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Geospatial Incident Map</h3>
          <p className="text-xs text-slate-500">Live GPS tracking of reported grievances</p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
          📍 {markers.length} Active Pins
        </span>
      </div>

      <div className="h-80 rounded-xl overflow-hidden border border-slate-200 z-0 relative">
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker, idx) => (
            <Marker key={marker.id || idx} position={[marker.lat, marker.lng]}>
              <Popup>
                <div className="p-1">
                  <span className="text-xs font-bold uppercase text-indigo-600 block">
                    #{marker.id} • {marker.category}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    Status: <span className="text-amber-600">{marker.status || 'Pending'}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{marker.location || 'Location tagged'}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}