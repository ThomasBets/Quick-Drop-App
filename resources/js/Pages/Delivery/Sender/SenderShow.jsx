import MainLayout from "../../../Layouts/MainLayout";
import { Link, router, usePage } from "@inertiajs/react";
import FloatingChat from "../Chat/FloatingChat";

export default function SenderShow() {
    const { delivery } = usePage().props;

    return (
        <MainLayout
            header={
                <div className="link space-x-5 mr-10">
                    <Link href="/sender-deliveries">Back</Link>
                </div>
            }
            main={
                <div>
                    {delivery.status !== "accepted" && (
                        <div className="flex justify-center text-3xl mb-10">
                            <p>Delivery request submitted successfully.</p>
                        </div>
                    )}
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
                            <label className="block text font-medium">
                                Status
                            </label>
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

                        {(delivery.status === "accepted" ||
                            delivery.status === "in_transit") && (
                            <div className="flex justify-center">
                                <button
                                    onClick={() =>
                                        router.visit(
                                            `/sender-deliveries/${delivery.id}/track`
                                        )
                                    }
                                    className="button"
                                >
                                    Live Tracking
                                </button>
                            </div>
                        )}
                    </div>
                    {delivery.status !== "pending" && (
                        <FloatingChat
                            deliveryId={delivery.id}
                            receiverId={delivery.driver_id}
                        />
                    )}
                </div>
            }
        />
    );
}
