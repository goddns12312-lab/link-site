export default function TopBar({ telegram, permanent, topLinks }) {
  return (
    <div className="bg-surface-card border-b border-border text-xs">
      <div className="max-w-[1560px] mx-auto px-4 h-9 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        <a
          href={telegram?.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 bg-brand-light text-brand-dark font-bold px-2.5 py-1 rounded-md no-underline shrink-0"
        >
          ✈ {telegram?.handle || '@linkit'}
        </a>
        <span className="text-text-muted shrink-0">☆ 즐겨찾기</span>
        <a
          href={telegram?.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-accent text-white font-semibold px-2.5 py-1 rounded-md no-underline shrink-0"
        >
          공식 채널 바로가기
        </a>
        <a
          href={permanent?.url || '#'}
          className="bg-brand text-white font-semibold px-2.5 py-1 rounded-md no-underline shrink-0"
        >
          평생주소-{permanent?.label || 'lki-77.de'}
        </a>
        <nav className="ml-auto flex items-center gap-3 shrink-0">
          {(topLinks || []).map((l, i) => (
            <a key={i} href={l.url} className="text-text-muted hover:text-text no-underline">
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
