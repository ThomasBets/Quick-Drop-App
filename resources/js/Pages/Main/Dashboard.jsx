import { router, usePage } from "@inertiajs/react";
import MainLayout from "../../Layouts/Layout";

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
                // User info and logout
                <div className="flex items-center space-x-6 mr-10">
                    <div className="flex flex-col items-center">
                        <p className="text text-xl">{user?.name}</p>
                        <p className="text"> {user?.role}</p>
                    </div>
                    <form onSubmit={handleLogout}>
                        <button className="link">Logout</button>
                    </form>
                </div>
            }
            main={
                <div className="flex itmes-center justify-center text-5xl font-bold">
                    <h1>This is the Dashboard!</h1>
                </div>
            }
        />
    );
}
