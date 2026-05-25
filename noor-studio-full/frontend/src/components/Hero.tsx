import './Hero.css';

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-blob" />
      <div className="hero-blob2" />
      <div className="hero-inner">
        <div className="hero-text">
          <div className="hero-badge">✦ استودیو عکاسی نور</div>
          <h1 className="hero-title">
            لحظه‌هایتان را<br />
            <strong>برای همیشه</strong><br />
            نگه می‌داریم
          </h1>
          <p className="hero-desc">
            عکاسی حرفه‌ای در دسته‌های عروسی، پرتره، خانوادگی و تجاری — با صمیمیت و دقت.
          </p>
          <div className="hero-btns">
            <a href="#gallery" className="btn-main">مشاهده گالری</a>
            <a href="#cta" className="btn-outline">مشاوره رایگان</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-frame">
            <svg viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="28" stroke="#c97b6b" strokeWidth="3"/>
              <circle cx="40" cy="40" r="12" stroke="#c97b6b" strokeWidth="2"/>
              <rect x="18" y="28" width="44" height="32" rx="6" stroke="#c97b6b" strokeWidth="2.5"/>
              <path d="M30 28V24h20v4" stroke="#c97b6b" strokeWidth="2"/>
            </svg>
          </div>
          <div className="hero-tag-float">
            <div className="dot" />
            <div>
              <span>در دسترس برای رزرو</span>
              <small>خرداد ۱۴۰۵</small>
            </div>
          </div>
          <div className="hero-stat-float">
            <div className="num">+۵۰</div>
            <small>پروژه موفق</small>
          </div>
        </div>
      </div>
    </section>
  );
}
