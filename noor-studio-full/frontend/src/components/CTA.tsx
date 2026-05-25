import './CTA.css';

export default function CTA() {
  return (
    <section id="cta" className="cta-section">
      <div className="cta-box">
        <h2>آماده‌اید لحظاتتان را<br /><strong>جاودان کنید؟</strong></h2>
        <p>همین الان رزرو کنید — اولین مشاوره کاملاً رایگان است.</p>
        <div className="cta-btns">
          <a href="mailto:info@noorstudio.ir" className="btn-white">ارسال ایمیل</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="btn-white-out">اینستاگرام ما</a>
        </div>
      </div>
    </section>
  );
}
