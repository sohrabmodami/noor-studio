import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">نور<span> استودیو</span></div>
      <p>© ۱۴۰۵ — تمامی حقوق محفوظ است</p>
      <div className="footer-socials">
        <a className="soc" href="#" aria-label="اینستاگرام">ig</a>
        <a className="soc" href="#" aria-label="تلگرام">tg</a>
        <a className="soc" href="#" aria-label="واتساپ">wa</a>
      </div>
    </footer>
  );
}
