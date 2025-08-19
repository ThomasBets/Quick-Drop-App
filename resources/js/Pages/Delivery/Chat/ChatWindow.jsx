import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import axios from "axios";
import { db } from "../../../firebase"; // firebase config
import { usePage } from "@inertiajs/react";

export default function ChatWindow({ deliveryId, receiverId, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const { auth } = usePage().props;

    const user = auth?.user ?? auth;

    // scroll to bottom
    const scrollToBottom = () =>
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(() => {
        if (!receiverId) return;

        const q = query(
            collection(db, "deliveries", String(deliveryId), "messages"),
            orderBy("created_at", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map((doc) => doc.data()));
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [deliveryId, receiverId]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const res = await axios.post("/messages", {
                delivery_id: deliveryId,
                receiver_id: receiverId,
                message: newMessage,
            });
            console.log("Message sent:", res.data);
            setNewMessage("");
        } catch (err) {
            console.error(
                "Send message failed:",
                err.response?.data || err.message
            );
        }
    };

    return (
        <div className="flex flex-col w-86 h-104 bg-white border rounded shadow-lg">
            <div className="flex justify-between items-center bg-teal-600 text-teal-50 px-3 py-2 rounded-t">
                <span>Chat</span>
                <button onClick={onClose} className="font-bold">
                    ✕
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={
                            msg.sender_id === user?.id
                                ? "text-right"
                                : "text-left"
                        }
                    >
                        <div
                            className={`inline-block px-3 py-1 rounded ${
                                msg.sender_id === user?.id
                                    ? "bg-teal-600 text-teal-50"
                                    : "bg-gray-200 text-black"
                            }`}
                        >
                            {msg.message}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex p-2 border-t">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border rounded px-2 py-1"
                    placeholder="Send a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="ml-2 bg-teal-600 text-teal-50 px-3 rounded"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
