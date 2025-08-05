import MainLayout from "../Layouts/MainLayout";
import { Link } from "@inertiajs/react";

export default function Home() {
    return (
        <MainLayout
            header={
                <div className="text-2xl font-semibold space-x-5 mr-10">
                    <Link href="/login">Login</Link>
                    <Link href="/register">Register</Link>
                </div>
            }
            main={
                <div className="flex flex-wrap items-center justify-between w-full px-5 md:px-20 min-h-[60vh]">
                    <div className="w-full md:w-1/2 lg:w-1/3 mb-8 md:mb-0">
                        <img
                            src="/images/courier.png"
                            alt="Courier"
                            className="rounded-xl max-w-full h-auto ml-20"
                        />
                    </div>
                    <div className="w-full flex flex-col items-center md:w-1/2 lg:w-2/3 text-3xl font-semibold space-y-5 px-4 md:px-10 lg:px-20">
                        <p>Welcome to QuickDrop!</p>

                        <p>Your Delivery, One Tap Away.</p>
                    </div>
                </div>
            }
        />
    );
}
