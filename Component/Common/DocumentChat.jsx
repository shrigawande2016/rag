'use client';

import { useEffect, useRef, useState } from 'react'

const DocumentChat = ({ documentId, fileName }) => {
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: `Ask me anything about ${fileName || 'this document'} — renewal terms, payment amounts, obligations, risky clauses, whatever you need.`,
        },
    ])
    const scrollRef = useRef(null)

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        const question = input.trim()
        if (!question || sending) return

        setMessages((prev) => [...prev, { role: 'user', text: question }])
        setInput('')
        setSending(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId, message: question }),
            })
            const data = await res.json()

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', text: res.ok ? data.reply : (data.error || "I couldn't find an answer to that in this document.") },
            ])
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', text: "Something went wrong answering that. Please try again." },
            ])
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="w-full bg-white rounded-2xl shadow-sm border border-border-faint flex flex-col h-120 max-h-[70vh]">
            <div className="px-4 py-3.5 border-b border-border-faint">
                <div className="flex items-center gap-2">
                    <span className="w-7 h-7 flex-none rounded-full bg-primary-tint flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    <div className="text-sm font-bold text-text-primary">Ask about this document</div>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`max-w-[85%] text-[13.5px] leading-relaxed rounded-2xl px-3.5 py-2.5 ${
                            msg.role === 'user'
                                ? 'self-end bg-primary text-white rounded-br-sm'
                                : 'self-start bg-background text-text-primary rounded-bl-sm'
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}

                {sending && (
                    <div className="self-start bg-background text-text-faint rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-faint animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-faint animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-faint animate-bounce" />
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-border-faint">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 text-[13.5px] px-3.5 py-2.5 rounded-[10px] border border-border-strong outline-none bg-[#FAF8F5] text-text-primary focus:border-primary transition-colors"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="w-9.5 h-9.5 flex-none rounded-[10px] bg-primary hover:bg-primary-dark text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </form>
        </div>
    )
}

export default DocumentChat
