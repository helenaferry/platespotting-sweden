
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

export default function LocationSelectorMap(props) {
  const markerRef = useRef(null)
  const center = {
    lat: 0,
    lng: 0,
  } 
  const [position, setPosition] = useState(center)
  const [locationSet, setLocationSet] = useState(false)

  useEffect(() => {
    //do we support geolocation
    if (!("geolocation" in navigator)) {
      return;
    }
    // get position
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
        props.updateLocation({lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationSet(true)
      }
    );
  }, [position, props])


  function DraggableMarker() {
    const [draggable, setDraggable] = useState(false)
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current
          if (marker != null) {
            setPosition(marker.getLatLng())
            props.updateLocation(position)
          }
        },
      }),
      [],
    )

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}>
      </Marker>
    )
  }

  return (locationSet ? <MapContainer className="h-96 border" center={position} zoom={15} scrollWheelZoom={true}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <DraggableMarker />
  </MapContainer>
  : <p>Kartan fungerar inte i denna webbläsare. Har du gett den tillåtelse att hämta din position?</p>
  );
}