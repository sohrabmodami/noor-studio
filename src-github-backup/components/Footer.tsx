import { useData } from '../context/DataContext';

export default function Footer() {
  const { data } = useData();
  const s = data.site;

  return (
    <footer>
      <div className="f-left">{s.footerLeft}</div>
      <div className="f-center">{s.footerCenter}</div>
      <div className="f-right"><a href={s.footerSocialHref}>{s.footerSocial}</a></div>
    </footer>
  );
}
