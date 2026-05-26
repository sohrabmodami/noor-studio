import './Footer.css';
import { useSiteContent } from '../context/SiteContentContext';

export default function Footer() {
  const { content: { footer } } = useSiteContent();
  const [logoFirst, ...logoRest] = footer.logo.split(' ');
  return (
    <footer className="footer">
      <div className="footer-logo">{logoFirst}<span> {logoRest.join(' ')}</span></div>
      <p>{footer.copyright}</p>
      <div className="footer-socials">
        <a className="soc" href={footer.instagramHref} aria-label="اینستاگرام">ig</a>
        <a className="soc" href={footer.telegramHref} aria-label="تلگرام">tg</a>
        <a className="soc" href={footer.whatsappHref} aria-label="واتساپ">wa</a>
      </div>
    </footer>
  );
}
