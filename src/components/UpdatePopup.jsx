import { useState, useEffect, useRef } from 'react';

function todayKST() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

export default function UpdatePopup({ notice }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('preview') === '1') return;
    try {
      if (localStorage.getItem('link-update-dismiss') === todayKST()) return;
    } catch {}
    setOpen(true);
  }, []);

  useEffect(() => {
    if (open && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [open]);

  const dismiss = (skipToday) => {
    if (skipToday) {
      try { localStorage.setItem('link-update-dismiss', todayKST()); } catch {}
    }
    dialogRef.current?.close();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="holo-box fixed inset-0 m-auto w-80 max-w-[calc(100vw-32px)] p-6 rounded-3xl border border-accent-light bg-surface-card text-center shadow-2xl"
      style={{ borderTop: '3px solid var(--color-accent)' }}
    >
      <button
        onClick={() => dismiss(false)}
        className="absolute right-3 top-3 w-8 h-8 rounded-full bg-accent-light border-0 text-xl cursor-pointer hover:opacity-70"
        aria-label="닫기"
      >
        ×
      </button>
      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-accent-light border-[6px] border-accent-light/50 flex items-center justify-center text-accent text-2xl">
        🔄
      </div>
      <span className="inline-block bg-accent-light text-accent font-bold text-xs px-3 py-1 rounded-full">
        주소 업데이트
      </span>
      <h2 className="text-xl font-black mt-3 mb-2 tracking-tight">주소 업데이트 안내</h2>
      <p className="text-text-muted text-xs leading-relaxed mb-4">
        {notice || '6시간마다 자동 업데이트 됩니다'}
      </p>
      <div className="bg-accent-light/50 rounded-xl p-3 text-xs text-accent font-bold mb-3">
        ◷ &nbsp; 6시간마다 자동 업데이트
      </div>
      <label className="flex items-center justify-center gap-1.5 text-text-muted text-xs mb-3 cursor-pointer">
        <input type="checkbox" id="skip-today" className="accent-accent" />
        오늘 하루 보지 않기
      </label>
      <button
        onClick={() => {
          const skip = document.getElementById('skip-today')?.checked;
          dismiss(skip);
        }}
        className="holo-confirm w-full py-3 bg-accent text-white font-extrabold text-sm border-0 rounded-2xl cursor-pointer hover:opacity-90 transition"
      >
        확인했어요 ✓
      </button>
      <p className="text-[10px] text-text-muted mt-3">이용해 주셔서 감사합니다</p>
    </dialog>
  );
}
