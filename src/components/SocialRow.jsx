const BRAND = {
  Google:    { mark: 'G', bg: '#ffffff', fg: '#4285F4', border: true, solid: '#4285F4' },
  Youtube:   { mark: '▶', bg: '#FF0000', fg: '#ffffff', solid: '#FF0000' },
  Naver:     { mark: 'N', bg: '#03C75A', fg: '#ffffff', solid: '#03C75A' },
  Band:      { mark: 'B', bg: '#19C36A', fg: '#ffffff', solid: '#19C36A' },
  Daum:      { mark: 'D', bg: '#2E64FE', fg: '#ffffff', solid: '#2E64FE' },
  Kakao:     { mark: '💬', bg: '#FEE500', fg: '#3C1E1E', solid: '#FEE500' },
  Instagram: { mark: '📷', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', fg: '#ffffff', solid: '#dc2743' },
  Facebook:  { mark: 'f', bg: '#1877F2', fg: '#ffffff', solid: '#1877F2' },
};

export default function SocialRow({ socials }) {
  if (!socials?.length) return null;

  return (
    <section className="max-w-[1560px] mx-auto px-4 pt-3 pb-2">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {socials.map((s, i) => {
          const b = BRAND[s.name] || { mark: s.name[0], bg: '#888', fg: '#fff', solid: '#888' };
          return (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-badge flex items-center justify-center gap-2 bg-surface-card border border-border rounded-lg py-2.5 no-underline"
              style={{ '--brand': b.solid }}
            >
              <span
                className="flex items-center justify-center w-6 h-6 rounded-full text-sm font-black shrink-0"
                style={{
                  background: b.bg,
                  color: b.fg,
                  border: b.border ? '1px solid #e5e7eb' : 'none',
                }}
              >
                {b.mark}
              </span>
              <span className="text-[13px] font-semibold text-text">{s.name}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
