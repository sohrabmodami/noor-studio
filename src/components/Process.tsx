import SectionHeading from './SectionHeading';
import { useData } from '../context/DataContext';

export default function Process() {
  const { data } = useData();
  const steps = data.process;

  return (
    <>
      <SectionHeading
        eyebrow="۰۳ / روند کار"
        title="یک "
        accent="استودیوی آهسته"
        titleAfter="."
        id="process"
        right={<span style={{ fontSize: 13, color: 'var(--muted)' }}>حدود ۴ هفته برای هر پروژه</span>}
      />
      <section className="process">
        {steps.map(step => (
          <div key={step.num} className="process-step">
            <span className="step-k">
              <span className="step-num">{step.num}</span>
              {step.label}
            </span>
            <div className="step-t">{step.title}</div>
            <div className="step-d">{step.desc}</div>
          </div>
        ))}
      </section>
    </>
  );
}
