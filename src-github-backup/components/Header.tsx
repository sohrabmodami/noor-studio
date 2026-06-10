import { useState } from 'react';
import logo from '../assets/logo.jpg';
import { useData } from '../context/DataContext';

export default function Header() {
  const { data } = useData();
  const { navItems, ctaLabel } = data.header;
  const [active, setActive] = useState(navItems[0]?.href ?? '#hero');

  return (
    <header className="topbar">
      <a href="#hero" className="topbar-mark">
        <img src={logo} alt="NOOR photo studio" className="topbar-logo" />
      </a>

      <div className="topbar-divider" />

      <nav className="topbar-nav">
        {navItems.map(item => (
          <a
            key={item.href}
            href={item.href}
            className={active === item.href ? 'active' : ''}
            onClick={() => setActive(item.href)}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="topbar-actions">
        <div className="topbar-sep" />
        <button className="topbar-icon-btn" aria-label="جستجو">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
        <div className="topbar-sep" />
        <a href="#contact" className="topbar-cta">{ctaLabel}</a>
      </div>
    </header>
  );
}
