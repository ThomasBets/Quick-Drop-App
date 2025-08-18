import MainLayout from "../../../Layouts/MainLayout";
import { Link, router, usePage } from "@inertiajs/react";
import LiveSimulation from "../../../Pages/Delivery/Driver/LiveSimulation";
import { cancelLiveSimulation } from "../../../Pages/Delivery/Driver/LiveSimulation";

export default function DriverShow() {
    const { delivery, auth } = usePage().props;

    function acceptDelivery(id) {
        router.patch(
            `/deliveries/${id}/accept`,
            {},
            {
                onSuccess: (page) => {
                    const updatedDelivery = page.props.delivery;

                    if (!updatedDelivery.estimated_time) {
                        console.error(
                            "No estimated_time available for simulation"
                        );
                        return;
                    }
                    // Redirect back to the deliveries list page with sorting and pagination params if needed
                    LiveSimulation(
                        updatedDelivery.id,
                        {
                            latitude: auth.driver_location.latitude,
                            longitude: auth.driver_location.longitude,
                        },
                        {
                            latitude: updatedDelivery.pickup_location.latitude,
                            longitude:
                                updatedDelivery.pickup_location.longitude,
                        },
                        {
                            latitude: updatedDelivery.dropoff_location.latitude,
                            longitude:
                                updatedDelivery.dropoff_location.longitude,
                        },
                        updatedDelivery.estimated_time
                    );

                    // Προαιρετικά επιστροφή στη λίστα
                    router.visit("/driver-deliveries", {
                        preserveState: false,
                    });
                },
            }
        );
    }

    function cancelDelivery(id) {
        cancelLiveSimulation(id);

        router.patch(`/deliveries/${id}/cancel`, {});
    }

    return (
        <MainLayout
            header={
                <div className="link space-x-5 mr-10">
                    <Link href="/driver-deliveries">Back</Link>
                </div>
            }
            main={
                <div className="max-w-2xl mx-auto text-lg bg-gradient-to-b from-teal-100/60 to-teal-200/90 p-6 rounded-lg shadow-md">
                    <div className="mb-4">
                        <label className="block text font-medium">
                            Pickup Location
                        </label>
                        <div className="mt-1 p-2 bg-teal-200 rounded">
                            {delivery.pickup_location.address}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text font-medium">
                            Dropoff Location
                        </label>
                        <div className="mt-1 p-2 bg-teal-200 rounded">
                            {delivery.dropoff_location.address}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text font-medium">
                            Package Description
                        </label>
                        <div className="mt-1 p-2 bg-teal-200 rounded">
                            {delivery.package_description}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text font-medium">Status</label>
                        <div className="mt-1 p-2 bg-teal-200 rounded capitalize">
                            {delivery.status}
                        </div>
                    </div>

                    {delivery.estimated_time && (
                        <div className="mb-4">
                            <label className="block text font-medium">
                                Estimated Delivery
                            </label>
                            <div className="mt-1 p-2 bg-teal-200 rounded">
                                {delivery.estimated_time}
                            </div>
                        </div>
                    )}

                    {delivery.delivered_at && (
                        <div>
                            <label className="block text font-medium">
                                Delivered At
                            </label>
                            <div className="mt-1 p-2 bg-teal-200 rounded">
                                {delivery.delivered_at}
                            </div>
                        </div>
                    )}
                    {delivery.status === "pending" && (
                        <div className="flex justify-center">
                            <button
                                onClick={() => acceptDelivery(delivery.id)}
                                className="button"
                            >
                                Accept
                            </button>
                        </div>
                    )}
                    {delivery.status !== "pending" && (
                        <button
                            type="button"
                            onClick={() => cancelDelivery(delivery.id)}
                            className="button"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            }
        />
    );
}
