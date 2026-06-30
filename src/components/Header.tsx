import { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import './Header.css';

const SECTIONS = [
  { id: 'hero',    label: 'خانه',   icon: 'home'    },
  { id: 'gallery', label: 'گالری',  icon: 'gallery' },
  { id: 'process', label: 'فرآیند', icon: 'process' },
  { id: 'cta',     label: 'تماس',   icon: 'contact' },
];

// SVG paths for each icon
const ICONS: Record<string, JSX.Element> = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  ),
  gallery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
  ),
  process: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3"/>
      <path d="M2 7l10 7 10-7"/>
    </svg>
  ),
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
}

export default function Header() {
  const { logoUrl, apiBase } = useData();
  const [active, setActive]     = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const detectActive = useCallback(() => {
    const scrollY = window.scrollY;
    const winH    = window.innerHeight;
    const docH    = document.documentElement.scrollHeight - winH;

    setScrolled(scrollY > 20);
    setProgress(docH > 0 ? Math.min((scrollY / docH) * 100, 100) : 0);

    let current = SECTIONS[0].id;
    for (const sec of SECTIONS) {
      const el = document.getElementById(sec.id);
      if (el && scrollY >= el.offsetTop - winH * 0.4) current = sec.id;
    }
    setActive(current);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', detectActive, { passive: true });
    detectActive();
    return () => window.removeEventListener('scroll', detectActive);
  }, [detectActive]);

  useEffect(() => {
    const close = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  const handleNav = (id: string) => { setMenuOpen(false); scrollToSection(id); };

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>

        <button className="logo" onClick={() => handleNav('hero')}>
          {logoUrl
            ? <img src={`${apiBase}${logoUrl}`} alt="نور استودیو" className="logo-img" />
            : <>نور<span> استودیو</span></>}
        </button>

        {/* Desktop links */}
        <ul className="nav-links">
          {SECTIONS.map(sec => (
            <li key={sec.id}>
              <button
                className={`nav-link${active === sec.id ? ' active' : ''}`}
                onClick={() => handleNav(sec.id)}
              >
                <span className="nav-icon">{ICONS[sec.icon]}</span>
                {sec.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <button className="nav-cta" onClick={() => handleNav('cta')}>رزرو و مشاوره</button>
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="منو"
          >
            <span /><span /><span />
          </button>
        </div>

        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-drawer${menuOpen ? ' open' : ''}`}>
        <div className="drawer-inner">
          {SECTIONS.map(sec => (
            <button
              key={sec.id}
              className={`drawer-link${active === sec.id ? ' active' : ''}`}
              onClick={() => handleNav(sec.id)}
            >
              <span className="drawer-icon">{ICONS[sec.icon]}</span>
              <span className="drawer-label">{sec.label}</span>
            </button>
          ))}
          <button className="drawer-cta" onClick={() => handleNav('cta')}>رزرو و مشاوره</button>
        </div>
      </div>

      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />}

      {/* Side dots */}
      <nav className="section-dots" aria-label="ناوبری سریع">
        {SECTIONS.map(sec => (
          <button
            key={sec.id}
            className={`section-dot${active === sec.id ? ' active' : ''}`}
            onClick={() => handleNav(sec.id)}
            title={sec.label}
          >
            <span className="dot-tooltip">{sec.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
