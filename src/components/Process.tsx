import { useData } from '../context/DataContext';
import './Process.css';

const DEFAULT_STEPS = [
  { n: '۰۱', title: 'مشاوره رایگان', desc: 'یک جلسه آنلاین یا حضوری برای آشنایی با سلیقه و نیاز شما.' },
  { n: '۰۲', title: 'برنامه‌ریزی', desc: 'انتخاب لوکیشن، تاریخ و تنظیم جزئیات پروژه با هم.' },
  { n: '۰۳', title: 'روز عکاسی', desc: 'یک تجربه راحت و صمیمی — فقط خودتان باشید!' },
  { n: '۰۴', title: 'تحویل آثار', desc: 'ویرایش حرفه‌ای و تحویل فایل‌ها در ۳ تا ۴ هفته.' },
];

export default function Process() {
  const { content } = useData();
  const p = content?.process;
  const steps = p?.steps?.length ? p.steps : DEFAULT_STEPS;

  return (
    <section id="process" className="process-section">
      <div className="process-inner">
        <div className="section-head">
          <span className="section-eyebrow">{p?.eyebrow ?? 'فرآیند کار'}</span>
          <h2 className="section-title">{p?.title ?? 'چطور باهم کار می‌کنیم؟'}</h2>
        </div>
        <div className="process-cards">
          {steps.map(s => (
            <div key={s.n} className="process-card">
              <div className="p-num">{s.n}</div>
              <div className="p-title">{s.title}</div>
              <p className="p-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
