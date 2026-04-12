type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  intro: string;
};

export function SectionHeading({ eyebrow, title, intro }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-intro">{intro}</p>
    </div>
  );
}
