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
    const [deliveryStatus, setDeliveryStatus] = useState(delivery.status);

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
        const unsubscribeDriver = onSnapshot(driverDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setDriverLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                });
            }
        });

        const deliveryDocRef = doc(db, "deliveries", String(delivery.id));
        const unsubscribeDelivery = onSnapshot(deliveryDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setDeliveryStatus(data.status);
            }
        });

        return () => {
            unsubscribeDriver();
            unsubscribeDelivery();
        };
    }, [delivery.driver_id, delivery.id]);

    if (!driverLocation) return <p>Loading driver location...</p>;

    const driverCoordinates = [
        driverLocation.latitude,
        driverLocation.longitude,
    ];
    const pickupCoordinates = [
        pickupLocation.latitude,
        pickupLocation.longitude,
    ];
    const dropoffCoordinates = [
        dropoffLocation.latitude,
        dropoffLocation.longitude,
    ];

    const blueLineStart =
        deliveryStatus === "accepted"
            ? pickupCoordinates
            : driverCoordinates || pickupCoordinates;

    console.log(driverCoordinates);

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
                    style={{
                        height: "95%",
                        width: "95%",
                        border: "1px solid #008080",
                        borderRadius: "4px",
                    }}
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
                        positions={[blueLineStart, dropoffCoordinates]}
                        color="blue"
                    />
                    {deliveryStatus === "accepted" && (
                        <Polyline
                            positions={[driverCoordinates, pickupCoordinates]}
                            color="red"
                        />
                    )}
                </MapContainer>
            }
        />
    );
}
