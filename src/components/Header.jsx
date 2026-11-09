import { useState, useEffect } from 'react';

function formatClock(d) {
  const date = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  }).format(d);
  const time = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(d);
  return `${date} ${time}`;
}

export default function Header({ siteName = '링크잇', siteNameEn = 'LINK IT' }) {
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="bg-surface-card">
      <div className="max-w-[1560px] mx-auto px-4 py-5 flex items-center justify-center gap-10 flex-wrap">
        <a href="#" className="no-underline text-center shrink-0">
          <div className="relative inline-block">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              {siteNameEn.split(' ')[0] || 'LINK'}
            </span>
            <div className="holo-text text-4xl font-black tracking-tight text-text pt-1">
              {siteName.slice(0, -1)}
              <span className="text-brand">{siteName.slice(-1)}</span>
            </div>
          </div>
          <div className="text-[10px] tracking-[0.3em] text-text-muted font-mono mt-0.5">
            {siteNameEn}
          </div>
        </a>
        <div className="live-clock font-mono text-base md:text-lg font-semibold text-text tabular-nums">
          {clock}
        </div>
      </div>
    </header>
  );
}
