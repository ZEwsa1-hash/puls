'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { time: '00:00', value: 62 },
  { time: '04:00', value: 58 },
  { time: '08:00', value: 72 },
  { time: '12:00', value: 85 },
  { time: '16:00', value: 78 },
  { time: '20:00', value: 68 },
  { time: '24:00', value: 64 },
];

const mockStats = {
  avg: 72,
  max: 92,
  min: 54,
};

const periods = ['День', 'Неделя', 'Месяц'];
const menuItems = [
  { name: 'Пульс', icon: '♥' },
  { name: 'Питание', icon: '🍎' },
  { name: 'Тренировки', icon: '🏃' },
];

export default function Home() {
  const [activePeriod, setActivePeriod] = useState('День');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (login === 'Lin' && password === '12345') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="bg-[#1c1f26] p-8 rounded-lg w-80 border" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--accent)' }}>Пульс</h1>
          <input
            type="text"
            placeholder="Логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-[#16181c] border outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-[#16181c] border outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full p-3 rounded font-semibold transition-colors"
            style={{ background: 'var(--accent)', color: '#0f1419' }}
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      <aside className="w-56 flex-shrink-0 p-4" style={{ background: 'var(--sidebar-bg)' }}>
        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--accent)' }}>Пульс</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className="w-full flex items-center gap-3 p-3 rounded transition-colors text-left"
              style={{
                background: item.name === 'Пульс' ? 'var(--card-bg)' : 'transparent',
                color: item.name === 'Пульс' ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <div className="flex gap-2 mb-6">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className="px-4 py-2 rounded transition-colors"
              style={{
                background: activePeriod === period ? 'var(--accent)' : 'var(--card-bg)',
                color: activePeriod === period ? '#0f1419' : 'var(--text-muted)',
              }}
            >
              {period}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded" style={{ background: 'var(--card-bg)' }}>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Среднее</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{mockStats.avg}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>уд/мин</div>
          </div>
          <div className="p-4 rounded" style={{ background: 'var(--card-bg)' }}>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Макс</div>
            <div className="text-2xl font-bold" style={{ color: '#ff6b6b' }}>{mockStats.max}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>уд/мин</div>
          </div>
          <div className="p-4 rounded" style={{ background: 'var(--card-bg)' }}>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Мин</div>
            <div className="text-2xl font-bold" style={{ color: '#4ecdc4' }}>{mockStats.min}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>уд/мин</div>
          </div>
        </div>

        <div className="p-4 rounded" style={{ background: 'var(--card-bg)', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <XAxis
                dataKey="time"
                stroke="#71767b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71767b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[40, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: '#1c1f26',
                  border: '1px solid #2f3336',
                  borderRadius: '8px',
                  color: '#e7e9ea',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#20b2aa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#20b2aa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
