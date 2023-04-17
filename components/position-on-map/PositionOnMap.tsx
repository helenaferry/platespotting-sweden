import { LocationType } from "./../../types/LocationType";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useState, useEffect } from "react";
export default function PositionOnMap(props: LocationType) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div>
      <div className="h-64 w-full border">
        {isMounted && (
          <MapContainer
            className="h-64 w-full"
            center={[props.lat, props.lng]}
            zoom={17}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[props.lat, props.lng]}></Marker>
          </MapContainer>
        )}
      </div>
    </div>
  );
}
