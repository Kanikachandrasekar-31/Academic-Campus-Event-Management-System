import { useState, useRef, useEffect } from 'react';
import { api } from '../utils/api';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm CampusMind — ask me about your attendance, marks, assignments, events, or announcements." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((p) => [...p, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot/ask', { message: text });
      setMessages((p) => [...p, { role: 'bot', text: res?.reply || "Sorry, I didn't catch that." }]);
    } catch (err) {
      setMessages((p) => [...p, { role: 'bot', text: err.message || 'Something went wrong reaching the chatbot.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open CampusMind chatbot"
        style={{
          position: 'fixed', bottom: 22, right: 22, zIndex: 1050,
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: 'var(--accent)', color: 'white', fontSize: 22,
          boxShadow: '0 6px 18px rgba(0,0,0,0.2)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', bottom: 84, right: 22, zIndex: 1050,
            width: 340, maxWidth: 'calc(100vw - 32px)', height: 440,
            background: 'var(--card-bg, #fff)', border: '1px solid var(--border)',
            borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          <div style={{ padding: '12px 16px', background: 'var(--rail-bg)', color: 'white' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>CampusMind Assistant</div>
            <div style={{ fontSize: 11, opacity: 0.75 }}>Attendance · Marks · Assignments · Events</div>
          </div>

          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? 'var(--accent)' : 'var(--accent-soft)',
                  color: m.role === 'user' ? 'white' : 'var(--text)',
                  padding: '8px 12px', borderRadius: 12, fontSize: 13,
                  maxWidth: '85%', lineHeight: 1.4, whiteSpace: 'pre-wrap',
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--text-muted)', padding: '4px 12px' }}>
                CampusMind is typing…
              </div>
            )}
          </div>

          <form onSubmit={send} style={{ display: 'flex', borderTop: '1px solid var(--border)', padding: 8, gap: 6 }}>
            <input
              className="form-control form-control-sm"
              placeholder="Ask about attendance, marks, events…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button type="submit" className="btn btn-sm btn-primary" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
