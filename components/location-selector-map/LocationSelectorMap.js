
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
    if (!("geolocation" in navigator) || locationSet) {
      return;
    }
    // get position
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
        props.updateLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationSet(true)
      }
    );
  })


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

  return (<div className="h-96 border">{locationSet ? <MapContainer className="h-96" center={position} zoom={17} scrollWheelZoom={true}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <DraggableMarker />
  </MapContainer>
    : <p>Väntar på kartan... Har du gett tillåtelse i webbläsaren att läsa position?</p>
  }</div>);
}