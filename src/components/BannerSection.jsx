import { useMemo } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BannerSection({ banners }) {
  const shuffled = useMemo(() => shuffle(banners), [banners]);

  if (!shuffled.length) return null;

  return (
    <section className="max-w-[1244px] mx-auto px-2 pt-4">
      <h2 className="flex items-center justify-center gap-2 text-xl font-black tracking-tight mb-2">
        <span aria-hidden="true">🏆</span>
        <span>
          링크잇 <span className="text-accent">공식보증업체</span>
        </span>
        <span aria-hidden="true">🏆</span>
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {shuffled.map((b, i) => (
          <a
            key={i}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden border border-border hover:shadow-md transition"
          >
            {b.image ? (
              <img src={b.image} alt={b.label} className="w-full h-auto block" loading="lazy" />
            ) : (
              <div className="bg-surface-card flex items-center justify-center h-16 text-sm text-text-muted">
                {b.label}
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
