import MainLayout from "../../../Layouts/MainLayout";
import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { Link } from "@inertiajs/react";

export default function LiveTrackingMap({ delivery }) {
    const [driverLocation, setDriverLocation] = useState(null);

    const pickupLocation = {
        latitude: delivery.pickup_location.latitude,
        longitude: delivery.pickup_location.longitude,
    };

    const dropoffLocation = {
        latitude: delivery.dropoff_location.latitude,
        longitude: delivery.dropoff_location.longitude,
    };

    useEffect(() => {
        if (!delivery.driver_id) return;

        const driverDocRef = doc(
            db,
            "driver_locations",
            `driver_${delivery.driver_id}`
        );
        const unsubscribe = onSnapshot(driverDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setDriverLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                });
            }
        });

        return () => unsubscribe();
    }, [delivery.driver_id]);

    if (!driverLocation) return <p>Loading driver location...</p>;

    const driverCoordinates = [driverLocation.latitude, driverLocation.longitude];
    const pickupCoordinates = [pickupLocation.latitude, pickupLocation.longitude];
    const dropoffCoordinates = [dropoffLocation.latitude, dropoffLocation.longitude];

    return (
        <MainLayout
            header={
                <div className="link space-x-5 mr-10">
                    <Link href={`/deliveries/${delivery.id}`}>Back</Link>
                </div>
            }
            main={
                <MapContainer
                    center={driverCoordinates}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <Marker
                        position={driverCoordinates}
                        icon={L.icon({
                            iconUrl: "/images/driver-icon.png",
                            iconSize: [40, 40],
                        })}
                    />
                    <Marker
                        position={pickupCoordinates}
                        icon={L.icon({
                            iconUrl: "/images/pickup-icon.png",
                            iconSize: [20, 30],
                        })}
                    >
                        <Tooltip direction="top" hover>
                            Pickup Address: {delivery.pickup_location.address}
                        </Tooltip>
                    </Marker>
                    <Marker
                        position={dropoffCoordinates}
                        icon={L.icon({
                            iconUrl: "/images/dropoff-icon.png",
                            iconSize: [20, 30],
                        })}
                    >
                        <Tooltip direction="top" hover>
                            Dropoff Address: {delivery.dropoff_location.address}
                        </Tooltip>
                    </Marker>
                    <Polyline
                        positions={[driverCoordinates, pickupCoordinates]}
                        color="red"
                    />
                    <Polyline
                        positions={[pickupCoordinates, dropoffCoordinates]}
                        color="blue"
                    />
                </MapContainer>
            }
        />
    );
}
