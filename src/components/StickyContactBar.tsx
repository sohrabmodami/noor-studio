import { useData } from '../context/DataContext';
import { FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import './StickyContactBar.css';

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href || '');
}

export default function StickyContactBar() {
  const { content } = useData();
  const enabled = content?.quickContact?.enabled ?? true;
  const text = content?.quickContact?.text || 'برای رزرو و مشاوره رایگان در تماس باشید';
  const contactHref = content?.quickContact?.phoneLink || content?.cta?.btnPrimaryLink || '#cta';
  const whatsappHref = content?.quickContact?.whatsappLink || content?.footer?.whatsapp || '#cta';

  if (!enabled) return null;

  const contactAttrs = isExternal(contactHref) ? { target: '_blank', rel: 'noreferrer' } : {};
  const whatsappAttrs = isExternal(whatsappHref) ? { target: '_blank', rel: 'noreferrer' } : {};

  return (
    <aside className="sticky-contact" aria-label="راه‌های تماس سریع">
      <p className="sticky-copy">{text}</p>
      <a className="sticky-action sticky-action-phone" href={contactHref} aria-label="تماس" title="تماس" {...contactAttrs}>
        <FaPhoneAlt aria-hidden="true" />
      </a>
      <a className="sticky-action sticky-action-whatsapp" href={whatsappHref} aria-label="واتساپ" title="واتساپ" {...whatsappAttrs}>
        <FaWhatsapp aria-hidden="true" />
      </a>
    </aside>
  );
}
