import axios from "axios";

let liveSimIntervalId = null; // κρατάει το global interval
let currentDeliveryId = null; // κρατάει ποια παράδοση τρέχει

export default async function LiveSimulation(
    deliveryId,
    driverLocation,
    pickupLocation,
    dropoffLocation,
    estimated_time
) {
    // Αν τρέχει ήδη παράδοση (ίδια ή άλλη) → σταματάμε
    if (liveSimIntervalId) {
        clearInterval(liveSimIntervalId);
        liveSimIntervalId = null;
        currentDeliveryId = null;
    }

    currentDeliveryId = deliveryId;

    // Μετατροπή σε αριθμούς
    let driverLatitude = parseFloat(driverLocation.latitude);
    let driverLongitude = parseFloat(driverLocation.longitude);
    const pickupLatitude = parseFloat(pickupLocation.latitude);
    const pickupLongitude = parseFloat(pickupLocation.longitude);
    const dropoffLatitude = parseFloat(dropoffLocation.latitude);
    const dropoffLongitude = parseFloat(dropoffLocation.longitude);

    // Υπολογισμός αποστάσεων
    const distanceToPickup = distanceInKm(
        driverLatitude,
        driverLongitude,
        pickupLatitude,
        pickupLongitude
    );
    const distanceToDropoff = distanceInKm(
        pickupLatitude,
        pickupLongitude,
        dropoffLatitude,
        dropoffLongitude
    );

    // Συνολική διάρκεια μέχρι το estimated_time
    const endTime = new Date(estimated_time);
    const totalMs = endTime - Date.now();

    // Βήματα = κάθε 5 sec
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
            status: i < Math.floor(totalSteps / 2) ? "accepted" : "in_transit",
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
            status: i < Math.ceil(totalSteps / 2) ? "in_transit" : "delivered",
        });
    }

    let index = 0;

    // Ξεκινάμε νέο interval
    liveSimIntervalId = setInterval(async () => {
        // αν φτάσαμε στο τέλος ή αν η παράδοση άλλαξε
        if (index >= waypoints.length || deliveryId !== currentDeliveryId || !liveSimIntervalId) {
            clearInterval(liveSimIntervalId);
            liveSimIntervalId = null;
            currentDeliveryId = null;
            return;
        }

        const waypoint = waypoints[index];

        try {
            await axios.patch(`/deliveries/${deliveryId}/location`, {
                latitude: waypoint.latitude,
                longitude: waypoint.longitude,
                status: waypoint.status,
            });
        } catch (error) {
            console.error("Error updating driver location:", error);
            if (error.response?.status === 403) {
            cancelLiveSimulation(deliveryId);
        }
        }

        index++;
    }, intervalMs);
}

// ➕ Cancel χειροκίνητα
export function cancelLiveSimulation(deliveryId) {
    if (liveSimIntervalId && deliveryId === currentDeliveryId) {
        clearInterval(liveSimIntervalId);
        liveSimIntervalId = null;
        currentDeliveryId = null;
    }
}

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
