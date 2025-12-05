'use client';

// Importações necessárias
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Correção dos Ícones (Bug conhecido do Leaflet no React) ---
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  lat: number;
  lng: number;
  address?: string;
}

export default function Map({ lat, lng, address }: MapProps) {
  // Coordenadas padrão (Lisboa) se não houver outras
  const position: [number, number] = [lat || 38.722, lng || -9.139];

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 z-0">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={icon}>
          <Popup>
            {address || "Localização aproximada"}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}