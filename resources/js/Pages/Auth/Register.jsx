import MainLayout from "../../Layouts/MainLayout";
import { Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "",
        phone: "",
        vehicle_type: "",
        license_number: "",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    function handleRegister(event) {
        event.preventDefault();

        router.post("/register", formData, {
            onError: (errors) => {
                setErrors(errors);
                setLoading(false);
            },
            onSuccess: () => {
                setLoading(false);
                setMessage("Registration successful!");
            },
        });
    }

    return (
        <MainLayout
            header={
                <div className="text-2xl font-semibold space-x-5 mr-10">
                    <Link href="/">Back</Link>
                </div>
            }
            main={
                <div className="w-full max-w-xl">
                    <form onSubmit={handleRegister} className="form">
                        <h2 className="text-2xl text font-bold text-center mb-4">
                            Register
                        </h2>

                        {/* Show general success or error message */}
                        {message && (
                            <p className="text_color text-center mb-4">
                                {message}
                            </p>
                        )}

                        {/* Show loading indicator */}
                        {loading && (
                            <div className="flex justify-center my-6">
                                <div className="loader ease-linear rounded-full border-4 border-t-4 border-teal-600 h-8 w-8"></div>
                            </div>
                        )}

                        {/* Name Field */}
                        <div className="mb-6">
                            <label className="block text mb-2">Name*</label>
                            <input
                                type="text"
                                className="form_field"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                            />
                            {errors.name && (
                                <p className="error">{errors.name}</p>
                            )}
                        </div>

                        {/* Role Selector */}
                        <div className="mb-6">
                            <label className="block text mb-2">Role*</label>
                            <select
                                className="form_field"
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        role: e.target.value,
                                    })
                                }
                            >
                                <option className="text" value="" disabled>
                                    Select a role
                                </option>
                                <option className="text" value="sender">
                                    Sender
                                </option>
                                <option className="text" value="driver">
                                    Driver
                                </option>
                            </select>
                            {errors.role && (
                                <p className="error">{errors.role}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="mb-6">
                            <label className="block text mb-2">Email*</label>
                            <input
                                type="email"
                                className="form_field"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                            />
                            {errors.email && (
                                <p className="error">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="mb-6">
                            <label className="block text mb-2">Password*</label>
                            <input
                                type="password"
                                className="form_field"
                                placeholder="********"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                            />
                            {errors.password && (
                                <p className="error">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="mb-6">
                            <label className="block text mb-2">
                                Confirm Password*
                            </label>
                            <input
                                type="password"
                                className="form_field"
                                placeholder="********"
                                value={formData.password_confirmation}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password_confirmation: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Phone Field */}
                        <div className="mb-6">
                            <label className="block text mb-2">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                className="form_field"
                                placeholder="(+30) 6978687868"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Vechicle Type Field */}
                        <div className="mb-6">
                            <label className="block text mb-2">
                                Vechicle Type
                            </label>
                            <input
                                type="text"
                                className="form_field"
                                placeholder="Van"
                                value={formData.vehicle_type}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        vehicle_type: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* License Number Field */}
                        <div className="mb-6">
                            <label className="block text mb-2">
                                License Number
                            </label>
                            <input
                                type="text"
                                className="form_field"
                                placeholder="XNX 9999"
                                value={formData.license_number}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        license_number: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="button">
                            Register
                        </button>

                        {/* Navigation link */}
                        <p className="mt-6 text-center text">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-teal-600 hover:underline mb-6"
                            >
                                Login
                            </Link>
                        </p>
                    </form>
                </div>
            }
        />
    );
}
