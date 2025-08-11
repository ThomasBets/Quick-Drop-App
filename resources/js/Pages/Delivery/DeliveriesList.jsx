import MainLayout from "../../Layouts/MainLayout";
import { Link, router, usePage } from "@inertiajs/react";
import Pagination from "../../Components/Pagination";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function DeliveriesList() {
    const { deliveries, sortField, sortDirection } = usePage().props;

    const [currentSortField, setCurrentSortField] = useState(sortField || "");
    const [currentSortDirection, setCurrentSortDirection] = useState(
        sortDirection || "asc"
    );

    // Αρχικό state από Laravel backend
    const [deliveryList, setDeliveryList] = useState(deliveries?.data || []);

    const handleSortClick = (field) => {
        let direction = "asc";
        if (currentSortField === field) {
            direction = currentSortDirection === "asc" ? "desc" : "asc";
        }
        setCurrentSortField(field);
        setCurrentSortDirection(direction);

        router.get(
            "/deliveries",
            { sort: field, direction },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handlePageClick = (pageUrl) => {
        if (!pageUrl) return;
        const url = new URL(pageUrl);
        const params = new URLSearchParams(url.search);

        params.set("sort", currentSortField);
        params.set("direction", currentSortDirection);

        router.visit(`${url.pathname}?${params.toString()}`);
    };

    useEffect(() => {
        const deliveriesRef = collection(db, "deliveries");

        const unsubscribe = onSnapshot(deliveriesRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const newDelivery = { id: change.doc.id, ...change.doc.data() };

                setDeliveryList((prevList) => {
                    const existsIndex = prevList.findIndex(
                        (d) => d.id === newDelivery.id
                    );

                    if (change.type === "added") {
                        if (existsIndex === -1 && newDelivery.pickup_location) {
                            // Only add if it's a completely new doc AND has required data
                            return [newDelivery, ...prevList];
                        }
                    } else if (change.type === "modified") {
                        if (existsIndex !== -1) {
                            const updatedList = [...prevList];
                            updatedList[existsIndex] = {
                                ...updatedList[existsIndex],
                                ...newDelivery,
                            };
                            return updatedList;
                        }
                    } else if (change.type === "removed") {
                        if (existsIndex !== -1) {
                            return prevList.filter(
                                (d) => d.id !== newDelivery.id
                            );
                        }
                    }
                    return prevList;
                });
            });
        });

        return () => unsubscribe();
    }, []);

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
                                                    currentSortField ===
                                                        "status" &&
                                                    currentSortDirection ===
                                                        "asc"
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
                                                    currentSortField ===
                                                        "distance" &&
                                                    currentSortDirection ===
                                                        "asc"
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
                                                href={`/deliveries/${delivery.id}?direction=${currentSortDirection}&sort=${currentSortField}`}
                                            >
                                                {delivery.pickup_location
                                                    ?.address || "-"}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/deliveries/${delivery.id}?direction=${currentSortDirection}&sort=${currentSortField}`}
                                            >
                                                {delivery.dropoff_location
                                                    ?.address || "-"}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            {delivery.status}
                                        </td>
                                        <td className="px-4 py-3">
                                            {delivery.distance
                                                ? delivery.distance.toFixed(2)
                                                : "-"}{" "}
                                            km
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
