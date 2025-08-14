import MainLayout from "../../../Layouts/MainLayout";
import { Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { db } from "../../../firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

export default function DeliveryCreate() {
    const { locations } = usePage().props;

    const [formData, setFormData] = useState({
        pickup_location_id: "",
        dropoff_location_id: "",
        package_description: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    function handleDeliveryCreate(e) {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setMessage("");

        router.post("/deliveries", formData, {
            onSuccess: (page) => {
                setLoading(false);
                setMessage("Delivery created successfully!");
                setFormData({
                    pickup_location_id: "",
                    dropoff_location_id: "",
                    package_description: "",
                });

                // Get the new delivery from Laravel response (including distance)
                const delivery = page.props.delivery;

                // Save full delivery to Firestore
                if (delivery?.id) {
                    setDoc(doc(db, "deliveries", delivery.id.toString()), {
                        ...delivery,
                        createdAt: serverTimestamp(),
                    }).catch((err) => {
                        console.error(
                            "Error adding delivery to Firestore:",
                            err
                        );
                    });
                }
            },
            onError: (errors) => {
                setLoading(false);
                setErrors(errors);
            },
        });
    }

    return (
        <MainLayout
            header={
                <div className="link space-x-5 mr-10">
                    <Link href="/dashboard">Back</Link>
                </div>
            }
            main={
                <div className="w-full max-w-xl">
                    <form onSubmit={handleDeliveryCreate} className="form">
                        <div className="mb-4">
                            <label className="block mb-1 text">
                                Pickup Location
                            </label>
                            <select
                                className="form_field"
                                value={formData.pickup_location_id}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        pickup_location_id: e.target.value,
                                    })
                                }
                            >
                                <option value="" disabled>
                                    -- Select address --
                                </option>
                                {locations.map((location) => (
                                    <option
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.address}
                                    </option>
                                ))}
                            </select>
                            {errors.pickup_location_id && (
                                <p className="error">
                                    {errors.pickup_location_id}
                                </p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 text">
                                Delivery Location
                            </label>
                            <select
                                className="form_field"
                                value={formData.dropoff_location_id}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        dropoff_location_id: e.target.value,
                                    })
                                }
                            >
                                <option value="" disabled>
                                    -- Select address --
                                </option>
                                {locations.map((location) => (
                                    <option
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.address}
                                    </option>
                                ))}
                            </select>
                            {errors.dropoff_location_id && (
                                <p className="error">
                                    {errors.dropoff_location_id}
                                </p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 text">
                                Package Description
                            </label>
                            <textarea
                                className="form_field"
                                value={formData.package_description}
                                placeholder="Package details"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        package_description: e.target.value,
                                    })
                                }
                                rows={3}
                            />
                            {errors.package_description && (
                                <p className="error">
                                    {errors.package_description}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="button"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Request a Delivery"}
                        </button>

                        {message && <p className="success mt-2">{message}</p>}
                    </form>
                </div>
            }
        />
    );
}
