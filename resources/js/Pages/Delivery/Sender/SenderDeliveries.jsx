import MainLayout from "../../../Layouts/MainLayout";
import { Link, usePage } from "@inertiajs/react";
import Pagination from "../../../Components/Pagination";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../firebase";

const ITEMS_PER_PAGE = 10;

export default function DeliveriesList() {
    const { auth } = usePage().props;
    const userId = auth?.user?.id;

    const [currentPage, setCurrentPage] = useState(1);
    const [allDeliveries, setAllDeliveries] = useState([]);
    const [deliveryList, setDeliveryList] = useState([]);

    useEffect(() => {
        if (!userId) return;

        const deliveriesRef = collection(db, "deliveries");
        const q = query(deliveriesRef, where("sender_id", "==", userId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const deliveries = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAllDeliveries(deliveries);
        });

        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const paged = allDeliveries.slice(start, start + ITEMS_PER_PAGE);
        setDeliveryList(paged);
    }, [allDeliveries, currentPage]);

    const totalPages = Math.ceil(allDeliveries.length / ITEMS_PER_PAGE);

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
                                    <th className="px-4 py-4">Pickup Location</th>
                                    <th className="px-4 py-4">Dropoff Location</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4">Distance (Km)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gradient-to-b from-teal-100/60 to-teal-200/90 divide-y divide-gray-700">
                                {deliveryList.map((delivery) => (
                                    <tr key={delivery.id}>
                                        <td className="px-4 py-3">
                                            <Link href={`/deliveries/${delivery.id}`}>
                                                {delivery.pickup_location?.address}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/deliveries/${delivery.id}`}>
                                                {delivery.dropoff_location?.address}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/deliveries/${delivery.id}`}>
                                                {delivery.status}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/deliveries/${delivery.id}`}>
                                                {delivery.distance?.toFixed(2)} km
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            }
        />
    );
}
