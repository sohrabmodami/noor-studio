import { useData } from '../context/DataContext';
import './CTA.css';

export default function CTA() {
  const { content } = useData();
  const c = content?.cta;

  const isExternal = (href: string) => /^https?:|^mailto:/.test(href || '');

  return (
    <section id="cta" className="cta-section">
      <div className="cta-box">
        <h2>{c?.title ?? 'آماده‌اید لحظاتتان را جاودان کنید؟'}</h2>
        <p>{c?.text ?? 'همین الان رزرو کنید — اولین مشاوره کاملاً رایگان است.'}</p>
        <div className="cta-btns">
          {(c?.btnPrimaryText ?? 'ارسال ایمیل') && (
            <a
              href={c?.btnPrimaryLink ?? 'mailto:Maryam.daemii@gmail.com'}
              className="btn-white"
              {...(isExternal(c?.btnPrimaryLink ?? '') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {c?.btnPrimaryText ?? 'ارسال ایمیل'}
            </a>
          )}
          {(c?.btnSecondaryText ?? 'اینستاگرام ما') && (
            <a
              href={c?.btnSecondaryLink ?? 'https://instagram.com'}
              className="btn-white-out"
              {...(isExternal(c?.btnSecondaryLink ?? '') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {c?.btnSecondaryText ?? 'اینستاگرام ما'}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
