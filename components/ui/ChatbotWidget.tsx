"use client";

import { useState } from "react";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Bonjour, je suis IfagHelper !\n\nJe suis là pour vous accompagner tout au long de votre parcours étudiant : orientation, absences, démarches et compréhension de votre situation académique.\n\nN’hésitez pas à me poser une question, je vous aiderai pas à pas."
    }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = input;

  // 1️⃣ Affiche le message utilisateur
  setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
  setInput("");

  // 2️⃣ Message temporaire
  setMessages(prev => [
    ...prev,
    { sender: "bot", text: "IfagHelper réfléchit…" }
  ]);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_AI_API_URL}/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      }
    );

    const data = await res.json();

    // 3️⃣ Remplace le message "réfléchit"
    setMessages(prev => {
      const copy = [...prev];
      copy[copy.length - 1] = {
        sender: "bot",
        text: data.reply || "Je n’ai pas pu répondre pour le moment."
      };
      return copy;
    });

  } catch (err) {
    setMessages(prev => {
      const copy = [...prev];
      copy[copy.length - 1] = {
        sender: "bot",
        text: "⚠️ Une erreur est survenue. Veuillez réessayer."
      };
      return copy;
    });
  }
};
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-12 left-6 z-50 w-14 h-14 rounded-full bg-slate-900 border-2 border-violet-500 text-white text-xl shadow-lg"
      >
        🙂
      </button>

      {open && (
        <div className="fixed bottom-12 left-20 z-50 w-80 h-[420px] bg-slate-900 rounded-xl shadow-2xl flex flex-col">
          <div className="p-3 font-semibold border-b border-slate-700">
            IfagHelper - Ai Assistant
          </div>

          <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] p-2 rounded-lg ${
                  msg.sender === "user"
                    ? "self-end bg-violet-600"
                    : "self-start bg-slate-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-slate-700 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ex : Dois-je m’inquiéter de mes absences ?"
              className="flex-1 px-2 py-1 rounded-md bg-slate-800 outline-none text-sm"
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-3 rounded-md bg-indigo-600 text-white"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
