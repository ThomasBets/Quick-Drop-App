import { useState } from "react";
import MainLayout from "../../Layouts/MainLayout";
import { router, Link } from "@inertiajs/react";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    function handleLogin(event) {
        event.preventDefault();

        router.post(
            "/login",
            {
                email: formData.email,
                password: formData.password,
            },
            {
                onError: (errors) => {
                    setErrors(errors);
                    setLoading(false);
                },
                onSuccess: (page) => {
                    setLoading(false);
                    setMessage("Login successful!");
                },
            }
        );
    }

    return (
        <MainLayout
            header={
                <div className="link space-x-5 mr-10">
                    <Link href="/">Back</Link>
                </div>
            }
            main={
                <div className="w-full max-w-xl">
                    <form onSubmit={handleLogin} className="form">
                        {/* Title */}
                        <h2 className="text-2xl text font-bold text-center mb-4">
                            Login
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

                        {/* Email input field */}
                        <div>
                            <label className="block text mb-2">Email</label>
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
                            {/* Display email field errors */}
                            {errors.email && (
                                <p className="error">{errors.email}</p>
                            )}
                        </div>

                        {/* Password input field */}
                        <div>
                            <label className="block text mb-2">Password</label>
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
                            {/* Display password field errors */}
                            {errors.password && (
                                <p className="error">{errors.password[0]}</p>
                            )}
                        </div>

                        {/* Submit button */}
                        <button type="submit" className="mt-4 button">
                            Login
                        </button>

                        {/* Navigation link to register page */}
                        <p className="text-center text">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="text-teal-600 hover:underline"
                            >
                                Register
                            </Link>
                        </p>
                    </form>
                </div>
            }
        />
    );
}
