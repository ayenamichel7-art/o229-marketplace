"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for missing default marker icons in Leaflet with bundlers like Webpack/Turbopack
const iconRetinaUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png";
const iconUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png";
const shadowUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  popupTitle?: string;
}

export default function MapComponent({ latitude, longitude, zoom = 13, popupTitle = "Position" }: MapComponentProps) {
  return (
    <MapContainer 
      center={[latitude, longitude]} 
      zoom={zoom} 
      scrollWheelZoom={false} 
      className="h-full w-full rounded-2xl"
      style={{ minHeight: "300px", zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>
          <div className="font-semibold">{popupTitle}</div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
