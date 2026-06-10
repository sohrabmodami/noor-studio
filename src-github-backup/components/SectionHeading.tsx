import type { ReactNode } from 'react';

interface Props {
  eyebrow: string;
  title: string;
  accent: string;
  titleAfter?: string;
  right?: ReactNode;
  id?: string;
}

export default function SectionHeading({ eyebrow, title, accent, titleAfter, right, id }: Props) {
  return (
    <div className="sec-head" id={id}>
      <div>
        <div className="sec-head-num">{eyebrow}</div>
        <h2>
          {title}<b>{accent}</b>{titleAfter}
        </h2>
      </div>
      {right && right}
    </div>
  );
}
