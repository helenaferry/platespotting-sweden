
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import 'node_modules/leaflet-geosearch/dist/geosearch.css'
import { useAppSelector } from './../../hooks'
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { selectAllSpottings } from './../../store/spottingsSlice'
import Plate from './../plate/Plate'

export default function MarkerMap() {
    const spottings = useAppSelector(selectAllSpottings)
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
                setLocationSet(true)
            }
        );
    })


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

    return (<div className="h-128 border">{locationSet ? <MapContainer className="h-128" center={position} zoom={4} scrollWheelZoom={true}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LeafletgeoSearch />
        {spottings.map(spotting => <Marker key={spotting.id} position={{lat: spotting.location_lat, lng: spotting.location_lng}}>
            <Popup><Plate plateNumber={spotting.plateNumber} /></Popup>
        </Marker>)}
    </MapContainer>
        : <p>Väntar på kartan... Har du gett tillåtelse i webbläsaren att läsa position?</p>
    }</div>);
}