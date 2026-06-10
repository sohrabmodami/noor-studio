import { useState } from 'react';
import MenuEditor from './sections/MenuEditor';
import SlidesEditor from './sections/SlidesEditor';
import CardsEditor from './sections/CardsEditor';
import CategoriesEditor from './sections/CategoriesEditor';
import StatsEditor from './sections/StatsEditor';
import ProcessEditor from './sections/ProcessEditor';
import ContactEditor from './sections/ContactEditor';
import SiteEditor from './sections/SiteEditor';

type Section =
  | 'menu'
  | 'slides'
  | 'cards'
  | 'categories'
  | 'stats'
  | 'process'
  | 'contact'
  | 'site';

const NAV: { id: Section; label: string; icon: string; desc: string }[] = [
  { id: 'menu',       label: 'منو',          icon: '☰',  desc: 'آیتم‌های ناوبری و دکمه CTA' },
  { id: 'slides',     label: 'اسلایدر',      icon: '▶',  desc: 'اسلایدهای هیرو' },
  { id: 'cards',      label: 'پروژه‌ها',     icon: '◫',  desc: 'کارت‌های گالری' },
  { id: 'categories', label: 'دسته‌بندی‌ها', icon: '⊞',  desc: 'فیلترهای گالری' },
  { id: 'stats',      label: 'آمار',         icon: '◎',  desc: 'اعداد و معرفی' },
  { id: 'process',    label: 'روند کار',     icon: '→',  desc: 'مراحل کار با استودیو' },
  { id: 'contact',    label: 'تماس',         icon: '✉',  desc: 'اطلاعات تماس و CTA' },
  { id: 'site',       label: 'سایت',         icon: '⚙',  desc: 'فوتر، رمز و بازنشانی' },
];

interface Props {
  onLogout: () => void;
}

export default function AdminApp({ onLogout }: Props) {
  const [active, setActive] = useState<Section>('menu');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (active) {
      case 'menu':       return <MenuEditor />;
      case 'slides':     return <SlidesEditor />;
      case 'cards':      return <CardsEditor />;
      case 'categories': return <CategoriesEditor />;
      case 'stats':      return <StatsEditor />;
      case 'process':    return <ProcessEditor />;
      case 'contact':    return <ContactEditor />;
      case 'site':       return <SiteEditor />;
    }
  };

  const handleNav = (id: Section) => {
    setActive(id);
    setSidebarOpen(false);
  };

  return (
    <div className="ap-root">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="ap-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`ap-sidebar${sidebarOpen ? ' ap-sidebar-open' : ''}`}>
        <div className="ap-sidebar-top">
          <div className="ap-brand">
            <span className="ap-brand-noor">NOOR</span>
            <span className="ap-brand-sub">پنل مدیریت</span>
          </div>
        </div>

        <nav className="ap-nav">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`ap-nav-item${active === item.id ? ' active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="ap-nav-icon">{item.icon}</span>
              <span className="ap-nav-text">
                <span className="ap-nav-label">{item.label}</span>
                <span className="ap-nav-desc">{item.desc}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="ap-sidebar-footer">
          <a
            href="/"
            className="ap-sidebar-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            ↗ مشاهده سایت
          </a>
          <button className="ap-sidebar-link ap-logout" onClick={onLogout}>
            خروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ap-main">
        <div className="ap-topbar">
          <button
            className="ap-hamburger"
            onClick={() => setSidebarOpen(s => !s)}
            aria-label="منو"
          >
            ☰
          </button>
          <h1 className="ap-page-title">
            {NAV.find(n => n.id === active)?.label}
          </h1>
          <a
            href="/"
            className="ap-view-site"
            target="_blank"
            rel="noopener noreferrer"
          >
            مشاهده سایت ↗
          </a>
        </div>

        <div className="ap-content">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
