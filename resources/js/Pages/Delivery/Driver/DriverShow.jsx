import MainLayout from "../../../Layouts/MainLayout";
import { Link, router, usePage } from "@inertiajs/react";
import LiveSimulation from "../../../Pages/Delivery/Driver/LiveSimulation";
import { cancelLiveSimulation } from "../../../Pages/Delivery/Driver/LiveSimulation";
import FloatingChat from "../Chat/FloatingChat";
import axios from "axios";

export default function DriverShow() {
    const { delivery, auth } = usePage().props;

    function acceptDelivery(id) {
        axios
            .patch(`/deliveries/${id}/accept`, {})
            .then((response) => {
                // Access the returned JSON
                const acceptedDelivery = response.data.delivery;

                if (!acceptedDelivery.estimated_time) {
                    console.error("No estimated_time available for simulation");
                    return;
                }

                LiveSimulation(
                    acceptedDelivery.id,
                    {
                        latitude: auth.driver_location.latitude,
                        longitude: auth.driver_location.longitude,
                    },
                    {
                        latitude: acceptedDelivery.pickup_location.latitude,
                        longitude: acceptedDelivery.pickup_location.longitude,
                    },
                    {
                        latitude: acceptedDelivery.dropoff_location.latitude,
                        longitude: acceptedDelivery.dropoff_location.longitude,
                    },
                    acceptedDelivery.estimated_time
                );

                router.visit(`/deliveries/${id}`, { preserveState: false });
            })
            .catch((error) => {
                console.error(
                    "Error accepting delivery:",
                    error.response?.data || error.message
                );
            });
    }

    function cancelDelivery(id) {
        cancelLiveSimulation(id);

        router.patch(`/deliveries/${id}/cancel`, {});

        router.visit("/driver-deliveries");
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
                    {delivery.status !== "pending" &&
                        delivery.status !== "delivered" &&
                        delivery.driver_id === auth?.id && (
                            <button
                                type="button"
                                onClick={() => cancelDelivery(delivery.id)}
                                className="button"
                            >
                                Cancel
                            </button>
                        )}
                    {delivery.status !== "pending" &&
                        delivery.driver_id === auth?.id && (
                            <FloatingChat
                                delivery={delivery.id}
                                receiver={delivery.sender_id}
                                receiverName={delivery.sender.name}
                            />
                        )}
                </div>
            }
        />
    );
}
