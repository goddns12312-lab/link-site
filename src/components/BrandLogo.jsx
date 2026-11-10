export default function BrandLogo({ compact }) {
  return (
    <span className={`logo-shine inline-flex items-center gap-1 ${compact ? 'text-lg' : 'text-2xl'}`}>
      <span className="bg-brand text-white font-mono font-bold px-1.5 py-0.5 rounded text-sm tracking-wider">
        LINK
      </span>
      <span className="holo-text font-black tracking-tight">
        <b>링크</b><b className="text-brand">잇</b>
      </span>
    </span>
  );
}
