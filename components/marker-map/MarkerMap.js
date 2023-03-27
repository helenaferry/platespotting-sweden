
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useState, useRef, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import 'node_modules/leaflet-geosearch/dist/geosearch.css'
import { useAppSelector } from './../../hooks'
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { selectAllSpottings } from './../../store/spottingsSlice'
import Plate from './../plate/Plate'
import MemberBadge from './../member-badge/MemberBadge'
import AvatarGroup from '@mui/material/AvatarGroup';

export default function MarkerMap() {
    const spottings = useAppSelector(selectAllSpottings)
    const hasTeamMembers = useAppSelector(
        (state) => state.settings.hasTeamMembers
    );
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
        {spottings.map(spotting => <Marker key={spotting.id} position={{ lat: spotting.location_lat, lng: spotting.location_lng }}>
            <Popup>
                <div className="text-center">
                    <Plate plateNumber={spotting.plateNumber} large={false} /><br />
                    {spotting.dateSpotted}<br />
                    {hasTeamMembers && <AvatarGroup max={5}>
                        {spotting.teamMembers && spotting.teamMembers.map(tm =>
                            <MemberBadge
                                key={tm.id}
                                id={tm.id}
                                name={tm.name}
                                color={tm.color}
                                profile={undefined} />
                        )}
                    </AvatarGroup>}
                    {spotting.note && <p className="!m-auto max-w-[100px] break-all">{spotting.note}</p>}
                </div>
            </Popup>
        </Marker>)}
    </MapContainer>
        : <p>Väntar på kartan... Har du gett tillåtelse i webbläsaren att läsa position?</p>
    }</div>);
}