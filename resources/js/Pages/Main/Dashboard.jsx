import { router, usePage, Link } from "@inertiajs/react";
import MainLayout from "../../Layouts/MainLayout";

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth?.user;

    function handleLogout(event) {
        event.preventDefault();

        router.post("/logout", {
            onError: (errors) => {
                setErrors(errors);
                setLoading(false);
            },
            onSuccess: (page) => {
                setLoading(false);
                setMessage("Logout successful!");
            },
        });
    }
    return (
        <MainLayout
            header={
                <div className="flex flex-1 w-full items-center justify-between px-10">
                    {user?.role === "sender" ? (
                        <div>
                            <Link href="/deliveries/create" className="link">
                                Delivery Request
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <Link>Deliveries</Link>
                        </div>
                    )}

                    {/* User info and logout */}
                    <div className="flex items-center space-x-6">
                        <div className="flex flex-col items-center">
                            <p className="text text-xl">{user?.name}</p>
                            <p className="text"> {user?.role}</p>
                        </div>
                        <form onSubmit={handleLogout}>
                            <button className="link">Logout</button>
                        </form>
                    </div>
                </div>
            }
            main={null}
        />
    );
}
