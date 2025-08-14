import axios from "axios";

let liveSimIntervalId = null; // Παγκόσμιο ID interval

export default async function LiveSimulation(
    deliveryId,
    driverLocation,
    pickupLocation,
    dropoffLocation,
    estimated_time
) {
    // Σταματάμε προηγούμενη προσομοίωση αν υπάρχει
    if (liveSimIntervalId) {
        clearInterval(liveSimIntervalId);
        liveSimIntervalId = null;
    }

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

    const stepDistance = 0.1; // km ανά step
    const stepsToPickup = Math.max(
        1,
        Math.round(distanceToPickup / stepDistance)
    );
    const stepsToDropoff = Math.max(
        1,
        Math.round(distanceToDropoff / stepDistance)
    );

    const waypoints = [];

    // driver → pickup
    for (let i = 0; i <= stepsToPickup; i++) {
        const t = i / stepsToPickup;
        const latitude = driverLatitude + (pickupLatitude - driverLatitude) * t;
        const longitude =
            driverLongitude + (pickupLongitude - driverLongitude) * t;
        waypoints.push({
            latitude: parseFloat(latitude.toFixed(6)),
            longitude: parseFloat(longitude.toFixed(6)),
            status: i < stepsToPickup ? "accepted" : "in_transit",
        });
    }

    // pickup → dropoff
    for (let i = 1; i <= stepsToDropoff; i++) {
        const t = i / stepsToDropoff;
        const latitude =
            pickupLatitude + (dropoffLatitude - pickupLatitude) * t;
        const longitude =
            pickupLongitude + (dropoffLongitude - pickupLongitude) * t;
        waypoints.push({
            latitude: parseFloat(latitude.toFixed(6)),
            longitude: parseFloat(longitude.toFixed(6)),
            status: i < stepsToDropoff ? "in_transit" : "delivered",
        });
    }

    const totalSteps = waypoints.length;
    const endTime = new Date(estimated_time);
    const totalMs = endTime - Date.now();
    const intervalMs = totalMs / totalSteps;

    let index = 0;

    // Ξεκινάμε νέο interval
    liveSimIntervalId = setInterval(async () => {
        if (index >= waypoints.length) {
            clearInterval(liveSimIntervalId);
            liveSimIntervalId = null; // Μηδενίζουμε το ID μόλις ολοκληρωθεί
            return;
        }

        const waypoint = waypoints[index];

        try {
            await axios.patch(`/deliveries/${deliveryId}/location`, {
                latitude: waypoint.latitude,
                longitude: waypoint.longitude,
            });
        } catch (error) {
            console.error("Error updating driver location:", error);
        }

        index++;
    }, intervalMs);
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
