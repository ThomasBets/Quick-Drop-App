import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import axios from "axios";
import { db } from "../../../firebase"; // firebase config
import { usePage } from "@inertiajs/react";

export default function ChatWindow({
    delivery,
    receiver,
    receiverName,
    onClose,
}) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const { auth } = usePage().props;

    const user = auth?.user ?? auth;

    // scroll to bottom

    useEffect(() => {
        if (!receiver || !receiver) return;

        setMessages([]);

        const chatId = [user.id, receiver].sort((a, b) => a - b).join("_");

        const q = query(
            collection(
                db,
                "deliveries",
                String(delivery),
                "chats",
                chatId,
                "messages"
            ),
            orderBy("created_at", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map((doc) => doc.data()));
        });

        return () => unsubscribe();
    }, [delivery, receiver]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const res = await axios.post("/messages", {
                delivery_id: delivery,
                receiver_id: receiver,
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

    useEffect(() => {
        if (!messages.length) return;

        messages.forEach((msg) => {
            if (!msg.read_at && msg.receiver_id === user.id) {
                axios.patch(`/messages/${msg.id}/read`).catch(console.error);
            }
        });
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () =>
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });

    return (
        <div className="flex flex-col w-86 h-104 bg-white border rounded shadow-lg">
            <div className="flex justify-between items-center bg-teal-600 text-teal-50 px-3 py-2 rounded-t">
                <span>{receiverName}</span>
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
                            className={`inline-block px-3 py-1 rounded break-words max-w-3xs ${
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
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border rounded px-2 py-1 resize-none overflow-auto max-h-[4.5rem]"
                    placeholder="Send a message..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault(); // prevent new line
                            sendMessage();
                        }
                    }}
                    rows={1}
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
