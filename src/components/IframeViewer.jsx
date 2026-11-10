import { useState, useEffect, useRef } from 'react';

function BrandPopup({ link, siteName, config, onDismiss }) {
  const [count, setCount] = useState(config?.countdown ?? 3);

  useEffect(() => {
    if (count <= 0) return;
    const id = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [count]);

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="overflow-hidden max-w-[420px] w-[92%] relative rounded-xl"
        style={{ background: 'linear-gradient(180deg, #1a1030 0%, #0d0d1a 100%)', border: '2px solid rgba(255,110,199,0.4)' }}>

        {/* 헤더 */}
        <div className="pt-6 pb-4 text-center"
          style={{ background: 'linear-gradient(180deg, rgba(255,110,199,0.2) 0%, transparent 100%)' }}>
          <div className="text-5xl font-black mb-1">
            <span style={{ color: '#ff6ec7', textShadow: '0 0 20px rgba(255,110,199,0.6)' }}>LINK</span>
            <span style={{ color: '#4dd0ff', textShadow: '0 0 20px rgba(77,208,255,0.5)' }}> 링크잇</span>
          </div>
          <div className="text-sm font-bold" style={{ color: '#a78bfa' }}>주소안내</div>
        </div>

        {/* 주소 배너들 */}
        <div className="px-4 space-y-2.5 mb-4">
          {/* 현재주소 */}
          <div className="flex items-center rounded-lg overflow-hidden" style={{ background: 'linear-gradient(90deg, #dc2626 0%, #991b1b 100%)' }}>
            <div className="shrink-0 px-3 py-2.5 font-black text-white text-sm"
              style={{ background: 'rgba(0,0,0,0.3)', borderRight: '2px solid rgba(255,255,255,0.15)' }}>
              현재주소
            </div>
            <div className="flex-1 px-3 py-2.5 text-center">
              <span className="text-white font-black text-lg tracking-wide" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                lki-77.de
              </span>
            </div>
          </div>

          {/* 다음주소 */}
          <div className="flex items-center rounded-lg overflow-hidden" style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #5b21b6 100%)' }}>
            <div className="shrink-0 px-3 py-2.5 font-black text-white text-sm"
              style={{ background: 'rgba(0,0,0,0.3)', borderRight: '2px solid rgba(255,255,255,0.15)' }}>
              다음주소
            </div>
            <div className="flex-1 px-3 py-2.5 text-center">
              <span className="text-white font-black text-lg tracking-wide" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                lki-77.de
              </span>
            </div>
          </div>

          {/* 평생주소 */}
          <div className="flex items-center rounded-lg overflow-hidden" style={{ background: 'linear-gradient(90deg, #d97706 0%, #b45309 100%)' }}>
            <div className="shrink-0 px-3 py-2.5 font-black text-white text-sm"
              style={{ background: 'rgba(0,0,0,0.3)', borderRight: '2px solid rgba(255,255,255,0.15)' }}>
              평생주소
            </div>
            <div className="flex-1 px-3 py-2.5 text-center">
              <span className="font-black text-lg tracking-wide" style={{ color: '#fde68a', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                lki-77.de
              </span>
            </div>
          </div>
        </div>

        {/* 북마크 안내 */}
        <div className="flex items-center justify-center gap-2 px-4 mb-5">
          <span className="text-xl">📢</span>
          <span className="text-sm text-white">
            평생주소를 <span className="font-black" style={{ color: '#ff6ec7' }}>북마크</span>해 두세요.
          </span>
        </div>

        {/* 하단 버튼 바 */}
        <div className="flex border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <button
            onClick={onDismiss}
            disabled={count > 0}
            className="flex-1 py-3.5 text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-r"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {count > 0 ? `${count}초 후 확인 가능` : '오늘 그만보기'}
          </button>
          <button
            onClick={onDismiss}
            disabled={count > 0}
            className="flex-1 py-3.5 text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#e5e7eb' }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function ProxyBanners() {
  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch('/banners.json')
      .then((r) => r.json())
      .then((b) => { if (b.length) setBanners(b); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div className="shrink-0 bg-surface-card border-b border-border overflow-hidden">
      <div className="max-w-[900px] mx-auto px-2 py-1.5">
        <a
          href={banners[idx].url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block rounded-lg overflow-hidden"
          title={banners[idx].label || banners[idx].alt || '배너'}
        >
          <img
            src={banners[idx].image}
            alt={banners[idx].alt || banners[idx].label || '배너'}
            className="w-full block object-cover"
            style={{ maxHeight: '80px' }}
            loading="eager"
          />
        </a>
      </div>
    </div>
  );
}

export default function IframeViewer({ link, siteName = '링크잇', config, onClose }) {
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [popupOpen, setPopupOpen] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!link) return;
    setLoaded(false);
    setSlow(false);
    setPopupOpen(true);
    loadedRef.current = false;
    const id = setTimeout(() => {
      if (!loadedRef.current) setSlow(true);
    }, 20000);
    return () => clearTimeout(id);
  }, [link]);

  useEffect(() => {
    if (!link) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [link, onClose]);

  if (!link) return null;

  const iframeSrc = link.frameable
    ? link.url
    : '/proxy?url=' + encodeURIComponent(link.url);

  const openNewTab = () => window.open(link.url, '_blank', 'noopener,noreferrer');

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-surface">
      {/* 상단 링크잇 바 */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-surface-card shrink-0">
        <span className="holo-text text-lg font-black tracking-tight shrink-0">{siteName}</span>
        <span className="text-text-muted text-sm truncate hidden sm:block">— {link.label}</span>
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={openNewTab}
            className="holo-confirm text-xs font-bold px-3 py-2 rounded-lg bg-accent text-white cursor-pointer whitespace-nowrap"
          >
            새 탭에서 열기 ↗
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text text-sm px-3 py-2 rounded-lg border border-border cursor-pointer whitespace-nowrap"
          >
            ✕ 닫기
          </button>
        </div>
      </div>

      {/* 배너 */}
      <ProxyBanners />

      {/* iframe + 오버레이 팝업 */}
      <div className="relative flex-1 bg-black">
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          title={link.label}
          referrerPolicy="no-referrer"
          className="w-full h-full border-0 block"
          onLoad={() => { loadedRef.current = true; setLoaded(true); }}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-modals"
        />

        {/* 링크잇 팝업 (iframe 위에 오버레이) */}
        {popupOpen && (
          <BrandPopup
            link={link}
            siteName={siteName}
            config={config}
            onDismiss={() => setPopupOpen(false)}
          />
        )}

        {/* 로딩 중 */}
        {!loaded && !slow && !popupOpen && (
          <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm pointer-events-none">
            불러오는 중…
          </div>
        )}

        {/* 타임아웃 폴백 */}
        {slow && !loaded && !popupOpen && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="holo-box bg-surface-card rounded-2xl p-6 text-center max-w-sm">
              <div className="text-base font-bold text-text mb-1">사이트를 불러올 수 없어요</div>
              <div className="text-xs text-text-muted leading-relaxed mb-4">
                사이트가 응답하지 않습니다.<br />
                새 탭에서 직접 열어주세요.
              </div>
              <button
                onClick={openNewTab}
                className="holo-confirm w-full py-2.5 rounded-xl bg-accent text-white font-extrabold text-sm cursor-pointer"
              >
                {link.label} 새 탭에서 열기 ↗
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
