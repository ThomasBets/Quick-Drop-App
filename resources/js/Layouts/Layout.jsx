import { Link } from "@inertiajs/react";

export default function MainLayout({ header, main }) {
    return (
        <div className="w-screen h-screen flex flex-col bg-teal-50">
            {/* Header Section */}
            <header>
                <div className="flex justify-between items-center h-20">
                    {/* Logo and App Title */}
                    <div className="space-x-5 ml-10 flex items-center text-3xl font-bold text-shadow">
                        <img src="/images/logo.png" alt="Logo" />
                        <Link href="/" className="text-teal-600">Quick Drop</Link>
                    </div>

                    {/* Injected header content*/}
                    {header}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center">
                {main}
            </main>

            {/* Footer Section */}
            <footer className="text-center text-gray-500 text-sm py-6">
                &copy; {new Date().getFullYear()} Quick Drop. All rights
                reserved.
            </footer>
        </div>
    );
}
