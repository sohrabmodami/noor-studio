import { useData } from '../context/DataContext';
import './Footer.css';

export default function Footer() {
  const { content } = useData();
  const f = content?.footer;
  const brand = f?.brand ?? 'نور استودیو';
  const [first, ...rest] = brand.split(' ');

  return (
    <footer className="footer">
      <div className="footer-logo">{first}<span> {rest.join(' ')}</span></div>
      <p>{f?.copyright ?? '© ۱۴۰۵ — تمامی حقوق محفوظ است'}</p>
      <div className="footer-socials">
        <a className="soc" href={f?.instagram ?? '#'} aria-label="اینستاگرام">ig</a>
        <a className="soc" href={f?.telegram ?? '#'} aria-label="تلگرام">tg</a>
        <a className="soc" href={f?.whatsapp ?? '#'} aria-label="واتساپ">wa</a>
      </div>
    </footer>
  );
}
