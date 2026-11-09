import { useState, useEffect } from 'react';

export default function BannerSection() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetch('/banners.json')
      .then((r) => r.json())
      .then(setBanners)
      .catch(() => {});
  }, []);

  if (!banners.length) return null;

  return (
    <section className="max-w-[1560px] mx-auto px-4 pt-4" aria-label="공식보증업체 배너">
      <h2 className="flex items-center justify-center gap-2 text-xl font-black tracking-tight mb-3">
        <span aria-hidden="true">🏆</span>
        <span>
          링크잇 <span className="text-accent">공식보증업체</span>
        </span>
        <span aria-hidden="true">🏆</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] max-w-[1120px] mx-auto">
        {banners.map((b) => (
          <a
            key={b.id}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block rounded-lg overflow-hidden border border-border hover:shadow-lg transition"
            style={{ aspectRatio: '6 / 1' }}
            title={b.label || b.alt}
          >
            <img
              src={b.image}
              alt={b.alt || b.label || '배너'}
              className="w-full h-full block object-cover"
              loading="lazy"
              decoding="async"
              width="600"
              height="100"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
