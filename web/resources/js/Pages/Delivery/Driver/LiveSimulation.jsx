import axios from "axios";

let liveSimTimeoutId = null; // holds the timeout
let currentDeliveryId = null; // which delivery is running

export default async function LiveSimulation(
    deliveryId,
    driverLocation,
    pickupLocation,
    dropoffLocation,
    estimated_time
) {
    // Stop any running simulation
    if (liveSimTimeoutId) {
        clearTimeout(liveSimTimeoutId);
        liveSimTimeoutId = null;
        currentDeliveryId = null;
    }

    currentDeliveryId = deliveryId;

    // Convert to numbers
    let driverLatitude = parseFloat(driverLocation.latitude);
    let driverLongitude = parseFloat(driverLocation.longitude);
    const pickupLatitude = parseFloat(pickupLocation.latitude);
    const pickupLongitude = parseFloat(pickupLocation.longitude);
    const dropoffLatitude = parseFloat(dropoffLocation.latitude);
    const dropoffLongitude = parseFloat(dropoffLocation.longitude);

    // Total duration in ms
    const endTime = new Date(estimated_time);

    const totalMs = endTime - Date.now();

    const intervalMs = 5000;
    const totalSteps = Math.max(1, Math.floor(totalMs / intervalMs));

    const waypoints = [];

    // driver → pickup
    for (let i = 0; i <= Math.floor(totalSteps / 2); i++) {
        const t = i / Math.floor(totalSteps / 2);
        const latitude = driverLatitude + (pickupLatitude - driverLatitude) * t;
        const longitude =
            driverLongitude + (pickupLongitude - driverLongitude) * t;
        waypoints.push({
            latitude: parseFloat(latitude.toFixed(6)),
            longitude: parseFloat(longitude.toFixed(6)),
        });
    }

    // pickup → dropoff
    for (let i = 1; i <= Math.ceil(totalSteps / 2); i++) {
        const t = i / Math.ceil(totalSteps / 2);
        const latitude =
            pickupLatitude + (dropoffLatitude - pickupLatitude) * t;
        const longitude =
            pickupLongitude + (dropoffLongitude - pickupLongitude) * t;
        waypoints.push({
            latitude: parseFloat(latitude.toFixed(6)),
            longitude: parseFloat(longitude.toFixed(6)),
        });
    }

    let index = 0;

    // Recursive function using setTimeout
    const tick = async () => {
        if (index >= waypoints.length || deliveryId !== currentDeliveryId) {
            liveSimTimeoutId = null;
            currentDeliveryId = null;
            return;
        }

        const start = Date.now();
        const waypoint = waypoints[index];

        try {
            await axios.patch(`/deliveries/${deliveryId}/location`, {
                latitude: waypoint.latitude,
                longitude: waypoint.longitude,
            });
        } catch (error) {
            console.error("Error updating driver location:", error);
            if (error.response?.status === 403) {
                cancelLiveSimulation(deliveryId);
                return;
            }
        }

        index++;
        const elapsed = Date.now() - start;
        const nextDelay = Math.max(0, intervalMs - elapsed);
        liveSimTimeoutId = setTimeout(tick, nextDelay);
    };

    tick();
}

//  Cancel manually
export function cancelLiveSimulation(deliveryId) {
    if (liveSimTimeoutId && deliveryId === currentDeliveryId) {
        clearTimeout(liveSimTimeoutId);
        liveSimTimeoutId = null;
        currentDeliveryId = null;
    }
}

// Haversine method

function distanceInKm(lat1, lon1, lat2, lon2) {
    const latFrom = (lat1 * Math.PI) / 180;
    const lonFrom = (lon1 * Math.PI) / 180;
    const latTo = (lat2 * Math.PI) / 180;
    const lonTo = (lon2 * Math.PI) / 180;

    const latDiff = latTo - latFrom;
    const lonDiff = lonTo - lonFrom;

    const a =
        Math.sin(latDiff / 2) ** 2 +
        Math.cos(latFrom) * Math.cos(latTo) * Math.sin(lonDiff / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(a));
    const earthRadius = 6371; // km
    return earthRadius * c;
}
