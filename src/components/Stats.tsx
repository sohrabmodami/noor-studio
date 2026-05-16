import { useData } from '../context/DataContext';

export default function Stats() {
  const { data } = useData();
  const { lead, items } = data.stats;

  return (
    <section className="stats" id="about">
      <div className="stats-lead">
        <span className="stats-eyebrow">۰۲ / دربارهٔ ما</span>
        {lead}
      </div>
      {items.map((stat, i) => (
        <div key={i} className="stat">
          <div className="stat-n">{stat.num}</div>
          <div className="stat-l">{stat.label}</div>
        </div>
      ))}
    </section>
  );
}
