export default function Hero({ siteName = '링크잇', siteNameEn = 'LINK IT', totalLinks = 0, totalCats = 0 }) {
  return (
    <section className="app-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 45%)' }}
      />
      <div className="hero-sparkles" aria-hidden="true" />
      <div className="relative max-w-[1560px] mx-auto px-4 py-12 md:py-16 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="h-px w-10 md:w-16" style={{ background: 'var(--hero-sub)' }} />
          <span className="text-xs md:text-sm font-mono tracking-[0.35em] font-semibold" style={{ color: 'var(--hero-sub)' }}>
            PREMIUM LINK HUB
          </span>
          <span className="h-px w-10 md:w-16" style={{ background: 'var(--hero-sub)' }} />
        </div>

        <h1 className="hero-title text-5xl md:text-7xl font-black tracking-tight m-0" style={{ color: 'var(--hero-text)' }}>
          {siteName}
        </h1>
        <div className="hero-title text-sm md:text-base font-mono tracking-[0.5em] mt-2 font-semibold" style={{ color: 'var(--hero-sub)' }}>
          {siteNameEn}
        </div>

        <p className="text-base md:text-xl font-bold mt-5" style={{ color: 'var(--hero-text)' }}>
          당신의 모든 링크, 한곳에서 가장 빠르게
        </p>

        <div className="flex items-center justify-center gap-3 md:gap-5 mt-7 flex-wrap">
          <div className="hero-stat rounded-2xl px-6 py-3 min-w-[130px]">
            <div className="text-2xl md:text-3xl font-black" style={{ color: 'var(--hero-text)' }}>{totalLinks.toLocaleString()}</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--hero-sub)' }}>등록 링크</div>
          </div>
          <div className="hero-stat rounded-2xl px-6 py-3 min-w-[130px]">
            <div className="text-2xl md:text-3xl font-black" style={{ color: 'var(--hero-text)' }}>{totalCats}</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--hero-sub)' }}>카테고리</div>
          </div>
          <div className="hero-stat rounded-2xl px-6 py-3 min-w-[130px]">
            <div className="text-2xl md:text-3xl font-black" style={{ color: 'var(--hero-text)' }}>24시간</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--hero-sub)' }}>실시간 업데이트</div>
          </div>
        </div>
      </div>
    </section>
  );
}
