import MainLayout from "../../Layouts/MainLayout";
import { Link, router, usePage } from "@inertiajs/react";
import Pagination from "../../Components/Pagination";

export default function DeliveriesList() {
    const { deliveries } = usePage().props;

    console.log("Deliveries prop:", deliveries);

    function handlePageClick(pageUrl) {
        if (!pageUrl) return;
        router.visit(pageUrl);
    }

    return (
        <MainLayout
            header={
                <div className="link space-x-5 mr-10">
                    <Link href="/dashboard">Back</Link>
                </div>
            }
            main={
                <div>
                    <div className="overflow-x-auto py-6">
                        <table className="text-left w-full overflow-hidden rounded-lg">
                            <thead className="bg-teal-600 text-teal-50">
                                <tr>
                                    <th className="px-4 py-4">
                                        Pickup Location
                                    </th>
                                    <th className="px-4 py-4">
                                        Dropoff Location
                                    </th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Disatnce (Km)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gradient-to-b from-teal-100/60 to-teal-200/90 divide-y divide-gray-700">
                                {deliveries?.data?.map((delivery) => (
                                    <tr key={delivery.id}>
                                        <td className="px-4 py-3 text z-20 relative">
                                            <Link
                                                href={`/deliveries/${delivery.id}`}
                                                className="block w-full h-full"
                                            >
                                                {
                                                    delivery.pickup_location
                                                        .address
                                                }
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text z-20 relative">
                                            <Link
                                                href={`/deliveries/${delivery.id}`}
                                                className="block w-full h-full"
                                            >
                                                {
                                                    delivery.dropoff_location
                                                        .address
                                                }
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text z-20 relative">
                                            <Link
                                                href={`/deliveries/${delivery.id}`}
                                                className="block w-full h-full"
                                            >
                                                {delivery.status}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text z-20 relative">
                                            <Link
                                                href={`/deliveries/${delivery.id}`}
                                                className="block w-full h-full"
                                            >
                                                {delivery.distance.toFixed(2)}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        links={deliveries.links}
                        onPageClick={handlePageClick}
                    />
                </div>
            }
        />
    );
}
