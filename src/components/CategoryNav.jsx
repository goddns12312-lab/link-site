const CATEGORY_ICONS = {
  adult: '🔞', op: '🏢', toto: '🎰', mukti: '🔍', webtoon: '📚',
  drama: '📺', sports: '⚽', torrent: '📦', community: '💬',
  adulttoy: '🛍️', korean: '🌏', adultlive: '🎥', globaladult: '🌐',
  adultphoto: '📷', aiadult: '🤖',
};

export default function CategoryNav({ categories }) {
  if (!categories?.length) return null;

  const handleClick = (e, slug) => {
    e.preventDefault();
    const el = document.getElementById(`category-${slug}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-surface-card border-y border-border">
      <div className="max-w-[1560px] mx-auto px-3 py-3 flex flex-wrap justify-center gap-x-1 gap-y-1">
        {categories.map((cat) => (
          <a
            key={cat.code}
            href={`#category-${cat.slug}`}
            onClick={(e) => handleClick(e, cat.slug)}
            className="nav-item flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14px] font-bold text-text no-underline hover:bg-brand-light/40"
          >
            <span className="text-base">{CATEGORY_ICONS[cat.slug] || '📁'}</span>
            {cat.title}
          </a>
        ))}
      </div>
    </nav>
  );
}
