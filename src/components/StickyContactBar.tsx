import { useData } from '../context/DataContext';
import { FaInstagram, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import './StickyContactBar.css';

function opensNewTab(href: string) {
  return /^https?:/.test(href || '');
}

export default function StickyContactBar() {
  const { content } = useData();
  const enabled = content?.quickContact?.enabled ?? true;
  const text = content?.quickContact?.text || 'برای مشاوره رایگان و رزرو با ما در ارتباط باشید';
  const contactHref = content?.quickContact?.phoneLink || 'tel:+989010278986';
  const whatsappHref = content?.quickContact?.whatsappLink || content?.footer?.whatsapp || 'https://wa.me/989010278986';
  const instagramHref = content?.quickContact?.instagramLink || content?.footer?.instagram || 'https://instagram.com/Noorstudio.gorgan';

  if (!enabled) return null;

  const contactAttrs = opensNewTab(contactHref) ? { target: '_blank', rel: 'noreferrer' } : {};
  const whatsappAttrs = opensNewTab(whatsappHref) ? { target: '_blank', rel: 'noreferrer' } : {};
  const instagramAttrs = opensNewTab(instagramHref) ? { target: '_blank', rel: 'noreferrer' } : {};

  return (
    <aside className="sticky-contact" aria-label="راه‌های تماس سریع">
      <p className="sticky-copy">{text}</p>
      <div className="sticky-actions">
        <a className="sticky-action sticky-action-phone" href={contactHref} aria-label="تماس با ۰۹۰۱۰۲۷۸۹۸۶" title="تماس" {...contactAttrs}>
          <FaPhoneAlt aria-hidden="true" />
        </a>
        <a className="sticky-action sticky-action-whatsapp" href={whatsappHref} aria-label="واتساپ ۰۹۰۱۰۲۷۸۹۸۶" title="واتساپ" {...whatsappAttrs}>
          <FaWhatsapp aria-hidden="true" />
        </a>
        <a className="sticky-action sticky-action-instagram" href={instagramHref} aria-label="اینستاگرام Noorstudio.gorgan" title="اینستاگرام" {...instagramAttrs}>
          <FaInstagram aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}
