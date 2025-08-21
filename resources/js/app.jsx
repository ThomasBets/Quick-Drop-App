import "./bootstrap";
import "../css/app.css";
import "../css/style.css";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import FcmProvider from "./Components/FcmProvider";

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });
        return pages[`./Pages/${name}.jsx`].default;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <FcmProvider>
                <App {...props} />
            </FcmProvider>
        );
    },
});
