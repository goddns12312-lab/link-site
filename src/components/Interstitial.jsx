import { useState, useEffect, useRef, useCallback } from 'react';

export default function Interstitial({ link, config, siteName = '링크잇', onClose }) {
  const cfg = config || {};
  const initial = Number.isFinite(cfg.countdown) ? cfg.countdown : 3;
  const [count, setCount] = useState(initial);
  const goneRef = useRef(false);

  const go = useCallback(() => {
    if (goneRef.current || !link) return;
    goneRef.current = true;
    const win = window.open(link.url, '_blank', 'noopener,noreferrer');
    if (!win) window.location.href = link.url;
    onClose?.();
  }, [link, onClose]);

  useEffect(() => {
    if (!link) return;
    setCount(initial);
    goneRef.current = false;
  }, [link, initial]);

  useEffect(() => {
    if (!link) return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('preview') === '1' || p.get('bridgetest') === '1') return; // freeze for screenshots
    if (count <= 0) { go(); return; }
    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [link, count, go]);

  if (!link) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,8,18,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="holo-box relative w-[360px] max-w-[calc(100vw-32px)] rounded-3xl bg-surface-card p-7 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-surface border border-border text-text-muted text-lg leading-none cursor-pointer hover:text-text"
          aria-label="닫기"
        >
          ×
        </button>

        <div className="holo-text text-2xl font-black tracking-tight">{siteName}</div>
        <div className="text-xs font-mono tracking-[0.3em] text-text-muted mt-1">{cfg.title || '안내'}</div>

        <div className="my-5 rounded-2xl border border-border bg-surface px-4 py-4">
          <div className="text-sm text-text-muted">{cfg.message || '잠시 후 이동합니다.'}</div>
          <div className="text-lg font-extrabold text-brand mt-1">{link.label}</div>
        </div>

        {cfg.notice && (
          <div className="rounded-xl px-3 py-2.5 text-[12px] font-semibold mb-5"
            style={{ background: 'color-mix(in oklab, var(--color-accent) 16%, transparent)', color: 'var(--color-accent)' }}>
            {cfg.notice}
          </div>
        )}

        <button
          onClick={go}
          className="holo-confirm w-full py-3 rounded-2xl bg-accent text-white font-extrabold text-sm cursor-pointer hover:opacity-90 transition"
        >
          지금 이동하기 ({count})
        </button>
        <button
          onClick={onClose}
          className="mt-2 text-xs text-text-muted hover:text-text cursor-pointer bg-transparent border-0"
        >
          취소
        </button>
      </div>
    </div>
  );
}
