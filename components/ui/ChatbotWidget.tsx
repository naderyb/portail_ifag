"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: "bot" | "user"; text: string; timestamp: string }[]
  >([
    {
      sender: "bot",
      text: "Bonjour, je suis IfagHelper !\n\nJe suis là pour vous accompagner tout au long de votre parcours étudiant : orientation, absences, démarches et compréhension de votre situation académique.\n\nN’hésitez pas à me poser une question, je vous aiderai pas à pas.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { sender: "user" as const, text: userMessage, timestamp: now },
    ]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      const botTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot" as const,
          text:
            data.reply ||
            "Je n'ai pas pu répondre pour le moment. Veuillez réessayer plus tard.",
          timestamp: botTimestamp,
        },
      ]);
    } catch (err) {
      const errorTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot" as const,
          text: "⚠️ Une erreur est survenue. Vérifiez votre connexion et réessayez dans un instant.",
          timestamp: errorTimestamp,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-2xl shadow-lg ring-2 ring-violet-400 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400/60 sm:bottom-6 sm:right-6"
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
      >
        💬
      </button>

      {/* Chat Window */}
      <div
        className={`fixed inset-x-3 bottom-24 z-50 mx-auto flex w-auto max-w-md flex-col rounded-2xl bg-slate-900/95 shadow-2xl ring-1 ring-slate-700 backdrop-blur-md sm:bottom-28 sm:inset-x-auto sm:right-6 sm:mx-0 sm:w-96 transform transition-all duration-200 ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        }`}
        role="dialog"
        aria-label="Fenêtre de conversation IfagHelper"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg">
              🤖
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-50">
                IfagHelper
              </h3>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <span className="relative flex h-2 w-2 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                En ligne · Réponses instantanées
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
            aria-label="Fermer le chat"
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex max-h-[65vh] min-h-[260px] flex-col gap-3 overflow-y-auto p-4 sm:max-h-[420px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-sm transition-transform ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white"
                    : "bg-slate-800 text-slate-100"
                }`}
              >
                {msg.sender === "bot" && (
                  <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-violet-300">
                    IfagHelper
                  </span>
                )}
                <div>{msg.text}</div>
                <div
                  className={`mt-1 text-[10px] text-slate-400 ${
                    msg.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl bg-slate-800 px-3 py-2 text-xs text-slate-300">
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                  style={{ animationDelay: "300ms" }}
                ></span>
                <span className="ml-2">IfagHelper rédige une réponse…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700 bg-slate-900/90 p-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ex: Est-ce que j'ai cours demain?"
              className="flex-1 rounded-xl bg-slate-800/90 px-3 py-2 text-sm text-white outline-none ring-1 ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/80"
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 px-4 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Envoyer le message"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
