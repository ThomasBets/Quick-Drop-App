import { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { usePage } from "@inertiajs/react";

export default function FloatingChat({ deliveryId, receiverId }) {
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const { auth } = usePage().props;

    useEffect(() => {
        if (!deliveryId) return;

        const q = query(
            collection(db, "deliveries", String(deliveryId), "messages")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let count = 0;
            snapshot.docs.forEach((doc) => {
                const msg = doc.data();

                if (!msg.read_at && msg.sender_id !== auth?.user?.id) count++;
            });
            setUnread(count);
        });

        return () => unsubscribe();
    }, [deliveryId]);

    return (
        <div className="fixed bottom-20 right-10">
            {open && (
                <ChatWindow
                    deliveryId={deliveryId}
                    receiverId={receiverId}
                    onClose={() => setOpen(false)}
                />
            )}

            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="relative bg-teal-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                >
                    💬
                    {unread > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {unread}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
}
