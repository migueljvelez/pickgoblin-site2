'use client';
import { useState } from 'react';

export default function Home() {
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const emotions = document.getElementById('emotions-movie').value;
    const goal = document.getElementById('goal-movie').value;
    const tastes = document.getElementById('tastes-movie').value;
    const platform = document.getElementById('platforms').value;

    const userMsg = `🎯 Mood: ${emotions}. Intent: ${goal}. Taste: ${tastes}. Platform: ${platform}`;
    setChat([]); // clear previous results
    setChat(prev => [...prev, { type: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotions, goal, tastes, type: 'movie', platform, quantity: '5' }),
      });

      const data = await res.json();
      let recommendations = data?.results || data?.recommendations?.results || data?.recommendations || [];

if (Array.isArray(recommendations) && recommendations.length > 0) {
  setChat(prev => [...prev, { type: 'bot', list: recommendations }]);
} else {
  setChat(prev => [...prev, { type: 'bot', text: 'No recommendation found.' }]);
}
    } catch (e) {
      setChat(prev => [...prev, { type: 'bot', text: '❌ Error fetching recommendations. Try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img src="/logo.png" alt="PickGoblin Logo" style={{ width: '100px', marginBottom: '1em' }} />
        <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold' }}>Pick Goblin</h1>
        <p style={{ color: '#999', fontSize: '1.1rem' }}>Your Filthy Fun Filter.</p>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
        <input type="text" id="emotions-movie" placeholder="Three feelings. That's all we need to sniff you." style={inputStyle} />
        <input type="text" id="goal-movie" placeholder="What do you crave from this watch?" style={inputStyle} />
        <input type="text" id="tastes-movie" placeholder="Your cinematic blood type. Be specific." style={inputStyle} />
        <select id="platforms" style={inputStyle}>
          <option value="all">All Platforms</option>
          <option value="netflix">Netflix</option>
          <option value="hbo">HBO Max</option>
          <option value="disney">Disney+</option>
          <option value="prime">Amazon Prime</option>
          <option value="hulu">Hulu</option>
          <option value="paramount">Paramount+</option>
        </select>
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            ...inputStyle,
            background: '#111',
            color: 'white',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sniffing Recommendations...' : 'Unleash the Filthy Filter'}
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {chat.map((msg, i) =>
          msg.type === 'user' ? (
            <div key={i} style={userStyle}>{msg.text}</div>
          ) : msg.list ? (
            <div key={i} style={{ display: 'flex', gap: '2rem', flexWrap: 'nowrap', justifyContent: 'space-between' }}>
              {msg.list.map((item, idx) => (
                <div key={idx} style={recStyle}>
                  {item.poster && (
                    <img
                      src={item.poster}
                      alt={item.title}
                      style={{ width: '160px', height: 'auto', borderRadius: '10px' }}
                    />
                  )}
                  <h3 style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#444' }}>{item.description}</p>
                  {item.trailer && (
                    <a
                      href={item.trailer}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.85rem' }}
                    >
                      🎥 Watch Trailer
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div key={i} style={botStyle}>{msg.text}</div>
          )
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  padding: '0.75rem',
  fontSize: '1rem',
  marginBottom: '1rem',
  borderRadius: '8px',
  border: '1px solid #ccc',
  width: '100%',
};

const userStyle = {
  background: '#eee',
  padding: '1rem',
  borderRadius: '10px',
  marginBottom: '1rem',
  fontWeight: 'bold',
};

const botStyle = {
  background: '#fff',
  padding: '1rem',
  borderRadius: '10px',
  marginBottom: '1rem',
};

const recStyle = {
  background: '#fff',
  padding: '1rem',
  borderRadius: '10px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  width: '180px',
  textAlign: 'center',
  flexShrink: 0,
};
