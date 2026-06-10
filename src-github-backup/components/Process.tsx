import SectionHeading from './SectionHeading';
import { useData } from '../context/DataContext';

export default function Process() {
  const { data } = useData();
  const steps = data.process;
  const ps = data.processSection;

  return (
    <>
      <SectionHeading
        eyebrow={ps.eyebrow}
        title={ps.title}
        accent={ps.titleAccent}
        titleAfter={ps.titleAfter}
        id="process"
        right={<span style={{ fontSize: 13, color: 'var(--muted)' }}>{ps.subtitle}</span>}
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
