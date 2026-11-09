export default function InfoBoxes({ telegram, permanent }) {
  return (
    <section className="max-w-[1560px] mx-auto px-4 pt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <a
          href={telegram?.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="holo-box flex items-center gap-3 bg-accent-light/60 border border-accent-light rounded-xl px-5 py-4 no-underline hover:shadow-md transition"
        >
          <span className="text-2xl">✈</span>
          <span className="font-extrabold text-[17px] text-text">
            링크잇 <span className="text-accent">텔레 공식 채널</span>
          </span>
          <span className="ml-auto text-xl text-text-muted">›</span>
        </a>
        <a
          href={permanent?.url || '#'}
          className="holo-box flex items-center justify-center gap-2 bg-surface-card border border-border rounded-xl px-5 py-4 no-underline hover:shadow-md transition"
        >
          <span className="font-extrabold text-[17px] text-text">평생주소 :</span>
          <span className="font-extrabold text-[17px] text-accent">
            {permanent?.label || 'lki-77.de'}
          </span>
        </a>
      </div>
    </section>
  );
}
