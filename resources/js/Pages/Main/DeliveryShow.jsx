import MainLayout from "../../Layouts/MainLayout";
import { Link, router, usePage } from "@inertiajs/react";

export default function DeliveryShow() {
    const { delivery } = usePage().props;

    function acceptDelivery(id) {
        router.patch(`/deliveries/${id}/accept`);
    }

    return (
        <MainLayout
            header={
                <div className="link space-x-5 mr-10">
                    <Link href="/deliveries">Back</Link>
                </div>
            }
            main={
                <div className="max-w-2xl mx-auto bg-gradient-to-b from-teal-100/60 to-teal-200/90 p-6 rounded-lg shadow-md">
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
                                Estimated Time
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
                </div>
            }
        />
    );
}
