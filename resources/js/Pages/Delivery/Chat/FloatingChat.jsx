import { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { usePage } from "@inertiajs/react";

export default function FloatingChat({ delivery, receiver, receiverName }) {
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const { auth } = usePage().props;

    const user = auth?.user ?? auth;

    useEffect(() => {
        if (!delivery || !receiver) return;

        const chatId = [user?.id, receiver].sort((a, b) => a - b).join("_");

        const q = query(
            collection(
                db,
                "deliveries",
                String(delivery),
                "chats",
                chatId,
                "messages"
            )
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let count = 0;
            snapshot.docs.forEach((doc) => {
                const msg = doc.data();

                if (!msg.read_at && msg.receiver_id === user?.id) count++;
            });
            setUnread(count);
        });

        return () => unsubscribe();
    }, [delivery, receiver]);

    return (
        <div className="fixed bottom-20 right-10">
            {open && (
                <ChatWindow
                    delivery={delivery}
                    receiver={receiver}
                    receiverName={receiverName}
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
