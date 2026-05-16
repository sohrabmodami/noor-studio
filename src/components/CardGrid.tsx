import { useState } from 'react';
import CategoryBar from './CategoryBar';
import SectionHeading from './SectionHeading';
import Card from './Card';
import { useData } from '../context/DataContext';

export default function CardGrid() {
  const { data } = useData();
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <>
      <CategoryBar active={activeFilter} onChange={setActiveFilter} />

      <SectionHeading
        eyebrow="۰۱ / آثار منتخب"
        title="قاب‌هایی که "
        accent="دوست"
        titleAfter=" داریم."
        id="work"
        right={
          <button className="sec-head-sort">
            جدیدترین
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        }
      />

      <div className="grid">
        {data.cards.map((card, i) => (
          <Card
            key={card.id}
            card={card}
            hidden={activeFilter !== 'all' && card.cat !== activeFilter}
            revealIdx={i}
          />
        ))}
      </div>
    </>
  );
}
