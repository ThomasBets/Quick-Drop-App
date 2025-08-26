import MainLayout from "../../../Layouts/MainLayout";
import { Link, usePage } from "@inertiajs/react";
import Pagination from "../../../Components/Pagination";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";

const ITEMS_PER_PAGE = 10;

export default function DeliveriesList() {
    const {
        sort: initialSort,
        direction: initialDirection,
        page: initialPage,
    } = usePage().props;
    // Sort & paging state
    const [sortField, setSortField] = useState(initialSort || "status");
    const [sortDirection, setSortDirection] = useState(
        initialDirection || "asc"
    );
    const [currentPage, setCurrentPage] = useState(Number(initialPage) || 1);

    // Full list from Firestore
    const [allDeliveries, setAllDeliveries] = useState([]);
    // Deliveries to display on current page after sort & pagination
    const [deliveryList, setDeliveryList] = useState([]);

    // Fetch deliveries live from Firestore
    useEffect(() => {
        const deliveriesRef = collection(db, "deliveries");

        const unsubscribe = onSnapshot(deliveriesRef, (snapshot) => {
            const deliveries = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAllDeliveries(deliveries);
        });

        return () => unsubscribe();
    }, []);

    // Sort & paginate whenever dependencies change
    useEffect(() => {
        let sorted = [...allDeliveries];

        // Sorting logic, similar to your backend
        sorted.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            // Status custom order
            if (sortField === "status") {
                const statusOrder = { pending: 1, active: 2, completed: 3 };
                valA = statusOrder[valA] ?? 99;
                valB = statusOrder[valB] ?? 99;
            }

            if (valA == null) valA = Infinity;
            if (valB == null) valB = Infinity;

            if (valA < valB) return sortDirection === "asc" ? -1 : 1;
            if (valA > valB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        // Paginate
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const paged = sorted.slice(start, start + ITEMS_PER_PAGE);

        setDeliveryList(paged);
    }, [allDeliveries, sortField, sortDirection, currentPage]);

    const totalPages = Math.ceil(allDeliveries.length / ITEMS_PER_PAGE);

    // Sort button click
    const handleSortClick = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        setCurrentPage(1);
    };

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
                                    <th className="px-4 py-3">
                                        <button
                                            onClick={() =>
                                                handleSortClick("status")
                                            }
                                            className="flex items-center text-teal-50"
                                        >
                                            Status
                                            <img
                                                src="/images/arrow-down.svg"
                                                alt=""
                                                className={`w-5 h-5 ml-1 transition-transform duration-200 ${
                                                    sortField === "status" &&
                                                    sortDirection === "asc"
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3">
                                        <button
                                            onClick={() =>
                                                handleSortClick("distance")
                                            }
                                            className="flex items-center text-teal-50"
                                        >
                                            Distance (Km)
                                            <img
                                                src="/images/arrow-down.svg"
                                                alt=""
                                                className={`w-5 h-5 ml-1 transition-transform duration-200 ${
                                                    sortField === "distance" &&
                                                    sortDirection === "asc"
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gradient-to-b from-teal-100/60 to-teal-200/90 divide-y divide-gray-700">
                                {deliveryList.map((delivery) => (
                                    <tr key={delivery.id}>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/deliveries/${delivery.id}`}
                                            >
                                                {
                                                    delivery.pickup_location
                                                        ?.address
                                                }
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/deliveries/${delivery.id}`}
                                            >
                                                {
                                                    delivery.dropoff_location
                                                        ?.address
                                                }
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/deliveries/${delivery.id}`}
                                            >
                                                {delivery.status}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/deliveries/${delivery.id}`}
                                            >
                                                {delivery.distance?.toFixed(2)}{" "}
                                                km
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
