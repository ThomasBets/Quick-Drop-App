import { useEffect, createContext } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../firebase";
import axios from "axios";

export const FcmContext = createContext();

export default function FcmProvider({ children }) {
    useEffect(() => {
        const initFcm = async () => {
            if (!("serviceWorker" in navigator)) return;

            try {
                const registration = await navigator.serviceWorker.register(
                    "/firebase-messaging-sw.js"
                );

                const messaging = getMessaging(app);

                const token = await getToken(messaging, {
                    serviceWorkerRegistration: registration,
                });

                if (token) {
                    await axios.post(
                        "/fcm-token",
                        { token },
                        {
                            headers: { "Content-Type": "application/json" },
                        }
                    );
                }

                onMessage(messaging, (payload) => {
                    console.log("Foreground message received:", payload);
                    if (payload.notification) {
                        alert(
                            `${payload.notification.title}\n${payload.notification.body}`
                        );
                    }
                });
            } catch (err) {
                console.error("FCM init failed:", err);
            }
        };

        initFcm();
    }, []);

    return <FcmContext.Provider value={{}}>{children}</FcmContext.Provider>;
}
