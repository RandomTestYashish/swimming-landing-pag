import { useEffect, useState } from 'react';
import { Sun, MoonStars } from '@phosphor-icons/react';
import './Header.css';

const NAV = [
  { label: 'Learn', href: '#chapter-01' },
  { label: 'Strokes', href: '#chapter-05' },
  { label: 'Basics', href: '#chapter-03' },
  { label: 'Safety', href: '#chapter-09' },
];

type HeaderProps = {
  onJump: (href: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
};

export function Header({ onJump, theme, onToggleTheme }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  /**
   * Over the hero and the lab the header floats on the scene, which is the
   * point. Over the paper-backed sections it has nothing behind it, so the
   * wordmark and the chapter headings collide. Carry a backdrop there only.
   * Observed rather than listened for, so this costs nothing per frame.
   */
  useEffect(() => {
    const marks = document.querySelectorAll('main.chapters, .ft');
    if (!marks.length) return;
    const under = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) under.add(e.target);
          else under.delete(e.target);
        }
        setSolid(under.size > 0);
      },
      // a band across the top roughly as deep as the header and its rail
      { rootMargin: '0px 0px -88% 0px', threshold: 0 }
    );
    marks.forEach((m) => io.observe(m));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (href: string) => { setOpen(false); onJump(href); };

  return (
    <>
      <div className={`chrome-bg${solid ? ' is-on' : ''}`} aria-hidden="true" />
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
            className="hdr__theme"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark'
              ? <Sun size={17} weight="light" aria-hidden="true" />
              : <MoonStars size={17} weight="light" aria-hidden="true" />}
          </button>

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
    </>
  );
}
