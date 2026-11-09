import BrandLogo from './BrandLogo';

function currentDateKR() {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-card mt-8">
      <div className="max-w-[1560px] mx-auto px-4 py-8 text-center">
        <BrandLogo compact />
        <p className="text-xs text-text-muted mt-3">
          링크잇 · 주소모음 · 링크모음 · 사이트모음
        </p>
        <p className="text-[11px] text-text-muted mt-2">
          최종 업데이트: {currentDateKR()}
        </p>
      </div>
    </footer>
  );
}
