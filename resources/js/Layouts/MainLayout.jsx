import { Link, usePage } from "@inertiajs/react";

export default function MainLayout({ header, main }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <div className="w-screen h-screen flex flex-col bg-teal-50">
            {/* Header Section */}
            <header>
                <div className="flex justify-between items-center h-20">
                    {/* Logo and App Title */}
                    <div className="space-x-5 ml-10 flex items-center text-4xl font-bold">
                        <img src="/images/logo.png" alt="Logo" />
                        {user ? (
                            <Link href="/dashboard" className="text-teal-500">
                                QuickDrop
                            </Link>
                        ) : (
                            <Link href="/" className="text-teal-500">
                                QuickDrop
                            </Link>
                        )}
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
                &copy; {new Date().getFullYear()} QuickDrop. All rights
                reserved.
            </footer>
        </div>
    );
}
