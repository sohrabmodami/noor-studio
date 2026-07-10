import { FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import { useData } from '../context/DataContext';
import './CTA.css';

function telHref(phone: string) {
  return `tel:+98${phone.replace(/\D/g, '').replace(/^0/, '')}`;
}

function instagramHandle(url: string) {
  return url
    .replace(/^https?:\/\/(www\.)?instagram\.com\/?/i, '')
    .replace(/^@/, '')
    .replace(/\/$/, '') || 'Noorstudio.gorgan';
}

export default function CTA() {
  const { content } = useData();
  const c = content?.cta;
  const phoneOne = c?.phoneOne || '09010278986';
  const phoneTwo = c?.phoneTwo || '09111708194';
  const instagram = c?.instagramLink || c?.btnSecondaryLink || 'https://instagram.com/Noorstudio.gorgan';
  const whatsapp = c?.whatsappLink || 'https://wa.me/989010278986';
  const address = c?.address || 'گرگان، عدالت ۴۷، سرنبش میربهبهانی ۱، مجتمع مادر، طبقه ۵';
  const handle = instagramHandle(instagram);

  return (
    <section id="cta" className="cta-section">
      <div className="cta-box">
        <div className="cta-head">
          <span className="cta-kicker">رزرو و مشاوره</span>
          <h2>{c?.title ?? 'آماده‌اید لحظاتتان را جاودان کنید؟'}</h2>
          <p>{c?.text ?? 'برای مشاوره رایگان و رزرو با ما در ارتباط باشید.'}</p>
          <a className="cta-main-action" href={telHref(phoneOne)} aria-label={`تماس با ${phoneOne}`}>
            <FaPhoneAlt aria-hidden="true" />
            <span>تماس فوری</span>
          </a>
        </div>

        <div className="cta-contact-panel">
          <div className="cta-panel-head">
            <span>راه‌های ارتباطی</span>
            <strong>NOOR Studio</strong>
          </div>
          <div className="cta-contact-grid">
            <a className="cta-contact-card" href={telHref(phoneOne)} aria-label={`تماس مستقیم با ${phoneOne}`}>
              <span className="cta-icon"><FaPhoneAlt aria-hidden="true" /></span>
              <span>
                <small>مریم دائمی</small>
                <strong>{phoneOne}</strong>
              </span>
            </a>
            <a className="cta-contact-card" href={telHref(phoneTwo)} aria-label={`تماس با ${phoneTwo}`}>
              <span className="cta-icon"><FaPhoneAlt aria-hidden="true" /></span>
              <span>
                <small>آیسن مومنی</small>
                <strong>{phoneTwo}</strong>
              </span>
            </a>
            <a className="cta-contact-card" href={whatsapp} target="_blank" rel="noreferrer" aria-label="ارسال پیام در واتساپ">
              <span className="cta-icon"><FaWhatsapp aria-hidden="true" /></span>
              <span>
                <small>واتساپ</small>
                <strong>ارسال پیام</strong>
              </span>
            </a>
            <a className="cta-contact-card" href={instagram} target="_blank" rel="noreferrer" aria-label={`اینستاگرام ${handle}`}>
              <span className="cta-icon"><FaInstagram aria-hidden="true" /></span>
              <span>
                <small>اینستاگرام</small>
                <strong>{handle}</strong>
              </span>
            </a>
          </div>
          <div className="cta-address">
            <span className="cta-icon"><FaMapMarkerAlt aria-hidden="true" /></span>
            <p>{address}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
