"use client";
import { useState } from "react";
export default function HomePage() {
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("Natural");
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  async function generateReplies() {
    if (!message.trim()) return;
    setLoading(true);
    setReplies([]);
    try {
      const response = await fetch("/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          tone,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      setReplies(data.replies || []);
    } catch (error) {
      setReplies([
        `Error: ${error.message}`,
      ]);
    } finally {
      setLoading(false);
    }
  }
  function copyReply(reply) {
    navigator.clipboard.writeText(reply);
  }
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Dating Reply Assistant
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Never get stuck on what to say.
          </h1>
          <p className="mt-3 text-slate-400">
            Paste a message, choose your style, and generate natural replies.
          </p>
        </header>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Their message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste their Facebook Dating message here..."
            rows={6}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none transition focus:border-blue-500"
          />
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Reply style
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-blue-500"
            >
              <option>Natural</option>
              <option>Funny</option>
              <option>Playful</option>
              <option>Flirty</option>
              <option>Confident</option>
              <option>Short & Casual</option>
              <option>Romantic</option>
            </select>
          </div>
          <button
            onClick={generateReplies}
            disabled={loading || !message.trim()}
            className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Replies"}
          </button>
        </section>
        {replies.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-bold">
              Reply options
            </h2>
            <div className="space-y-4">
              {replies.map((reply, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <p className="leading-7 text-slate-200">
                    {reply}
                  </p>
                  <button
                    onClick={() => copyReply(reply)}
                    className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Copy Reply
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
        <footer className="mt-10 text-center text-sm text-slate-500">
          AI-assisted replies. Review and send messages yourself.
        </footer>
      </div>
    </main>
  );
}