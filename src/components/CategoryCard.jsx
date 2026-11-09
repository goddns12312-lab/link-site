import { useState } from 'react';

const CATEGORY_ICONS = {
  adult: '🔞', op: '🏢', toto: '🎰', mukti: '🔍', webtoon: '📚',
  drama: '📺', sports: '⚽', torrent: '📦', community: '💬',
  adulttoy: '🛍️', korean: '🌏', adultlive: '🎥', globaladult: '🌐',
  adultphoto: '📷', aiadult: '🤖',
};

const INITIAL_COUNT = 10;

export default function CategoryCard({ category, onBridge, bridgeAll }) {
  const [expanded, setExpanded] = useState(false);
  const icon = CATEGORY_ICONS[category.slug] || '📁';

  const sorted = [...category.links].sort(
    (a, b) => (a.rank ?? 999) - (b.rank ?? 999)
  );
  const visibleLinks = expanded ? sorted : sorted.slice(0, INITIAL_COUNT);
  const hiddenCount = sorted.length - INITIAL_COUNT;
  const hasMore = hiddenCount > 0;

  return (
    <div
      id={`category-${category.slug}`}
      className="cat-card bg-surface-card rounded-xl border border-border overflow-hidden"
    >
      <div className="cat-card__head flex items-center gap-2 px-4 py-3 border-b border-border">
        <span className="text-lg">{icon}</span>
        <h3 className="font-bold text-[15px] tracking-tight m-0">{category.title}</h3>
        <span className="cat-count ml-auto text-xs text-text-muted">{category.links.length}</span>
      </div>
      <ul className="list-none m-0 p-0">
        {visibleLinks.map((link, i) => (
          <li key={i} className="border-b border-border last:border-b-0">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(bridgeAll || link.bridge) && onBridge ? (e) => { e.preventDefault(); onBridge(link); } : undefined}
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-text hover:bg-brand-light/20 transition no-underline overflow-hidden text-ellipsis whitespace-nowrap"
            >
              <span className="text-brand font-mono text-[11px] w-5 shrink-0 text-center">
                {i + 1}
              </span>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="more-btn w-full py-2.5 text-xs font-semibold text-text-muted hover:text-brand bg-transparent border-0 border-t border-border cursor-pointer"
        >
          {expanded ? '접기 ▲' : `더보기 (+${hiddenCount}개) ▼`}
        </button>
      )}
    </div>
  );
}
