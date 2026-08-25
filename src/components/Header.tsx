import { useEffect, useState } from 'react';
import './Header.css';

const NAV = [
  { label: 'Learn', href: '#chapter-01' },
  { label: 'Strokes', href: '#chapter-05' },
  { label: 'Basics', href: '#chapter-03' },
  { label: 'Safety', href: '#chapter-09' },
];

export function Header({ onJump }: { onJump: (href: string) => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (href: string) => { setOpen(false); onJump(href); };

  return (
    <header className="hdr">
      <div className="hdr__in">
        <a className="hdr__mark" href="#top" onClick={(e) => { e.preventDefault(); go('#top'); }}>
          <span>First</span>
          <span>Float</span>
        </a>

        <nav className="hdr__nav" aria-label="Primary">
          {NAV.map((n) => (
            <button key={n.label} className="hdr__link" onClick={() => go(n.href)}>
              {n.label}
            </button>
          ))}
        </nav>

        <button
          className={`hdr__burger${open ? ' is-open' : ''}`}
          aria-expanded={open}
          aria-controls="hdr-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          <i /><i />
        </button>
      </div>

      <div id="hdr-menu" className={`hdr__menu${open ? ' is-open' : ''}`} hidden={!open}>
        {NAV.map((n) => (
          <button key={n.label} onClick={() => go(n.href)}>{n.label}</button>
        ))}
      </div>
    </header>
  );
}
