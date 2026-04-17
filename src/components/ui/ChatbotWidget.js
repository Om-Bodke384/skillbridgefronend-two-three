import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

export default function ChatbotWidget() {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m SkillBot 🤖 Ask me anything about coding, SkillBridge features, or your learning journey!' }
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');

    const updatedMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Send only actual conversation (skip the greeting)
      const history = updatedMessages.slice(1, -1); // exclude greeting + latest
      const { data } = await api.post('/chatbot/ask', { message: userMsg, history });
      setMessages([...updatedMessages, { role: 'assistant', content: data.data.reply }]);
    } catch {
      setMessages([...updatedMessages, { role: 'assistant', content: 'Sorry, I ran into an error. Please try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-80 h-[420px] bg-gray-900 border border-gray-700 rounded-2xl flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 rounded-t-2xl bg-indigo-900/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-sm">🤖</div>
              <span className="text-white font-semibold text-sm">SkillBot</span>
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-lg leading-none">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-hidden">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-400 px-3 py-2 rounded-xl text-sm rounded-bl-sm">
                  SkillBot is typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask SkillBot..."
              className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-3 py-2 outline-none border border-gray-700 focus:border-indigo-500 placeholder-gray-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-13 h-13 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110"
      >
        {open ? '✕' : '🤖'}
      </button>
    </div>
  );
}
