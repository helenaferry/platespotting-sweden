
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import MapPlaceholder from '../map-placeholder/MapPlaceholder';

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
    if (props.initialPosition) {
      setLocation(props.initialPosition.lat, props.initialPosition.lng);
    } else {
      // get current position from browser
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation(pos.coords.latitude, pos.coords.longitude);
        }
      );
    }
  })

  function setLocation(lat, lng) {
    setPosition({
      lat: lat,
      lng: lng
    })
    props.updateLocation({ lat: lat, lng: lng })
    setLocationSet(true)
  }

  function DraggableMarker() {
    const [draggable, setDraggable] = useState(false)
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current
          if (marker != null) {
            setPosition(marker.getLatLng())
            props.updateLocation(marker.getLatLng())
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

  function LeafletgeoSearch() {
    const map = useMap();
    useEffect(() => {
      const provider = new OpenStreetMapProvider({
        params: {
          countrycodes: "se"
        }
      });

      const searchControl = new GeoSearchControl({
        provider,
        style: 'bar',
        showMarker: false,
        searchLabel: 'Sök adress eller plats'
      });

      map.addControl(searchControl);
      map.on('geosearch/showlocation', searchHandler)

      return () => map.removeControl(searchControl);
    }, [map]);

    return null;
  }

  function searchHandler(result) {
    const marker = markerRef.current
    if (marker != null) {
      marker.setLatLng(result.marker._latlng);
    }
    setPosition(result.marker._latlng);
    props.updateLocation(result.marker._latlng);
  }

  return (<div className="h-96 border">{locationSet ? <MapContainer className="h-96" center={position} zoom={17} scrollWheelZoom={true}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <DraggableMarker />
    <LeafletgeoSearch />
  </MapContainer>
    : <MapPlaceholder/>
  }</div>);
}