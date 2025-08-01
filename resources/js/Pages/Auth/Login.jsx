export default function Login() {
    return (
        <div className="w-screen h-screen flex flex-col">
            <header className=" h-24 text-4xl font-bold bg-teal-500 text-teal-900 relative">
                <div className="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2">Header</div>
            </header>
            <main className=" w-full flex-1 text-4xl font-bold bg-teal-50 text-teal-900 relative">
                <div className="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2">
                    This is the Login Page!
                </div>
            </main>
        </div>
    );
}
