type PageLoadingProps = {
  eyebrow: string;
  intro: string;
  title: string;
};

export function PageLoading({ eyebrow, intro, title }: PageLoadingProps) {
  return (
    <div aria-busy="true" aria-live="polite" className="page page-loading">
      <section className="page-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-lead">{intro}</p>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <div className="loading-stack">
            <div className="loading-line loading-line--eyebrow" />
            <div className="loading-line loading-line--title" />
            <div className="loading-line loading-line--body" />
          </div>
          <div className="loading-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <article className="loading-card" key={index}>
                <div className="loading-line loading-line--chip" />
                <div className="loading-line loading-line--card-title" />
                <div className="loading-line loading-line--body" />
                <div className="loading-line loading-line--body loading-line--short" />
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <div className="loading-stack">
            <div className="loading-line loading-line--eyebrow" />
            <div className="loading-line loading-line--title" />
            <div className="loading-line loading-line--body" />
            <div className="loading-line loading-line--body loading-line--short" />
          </div>
          <div className="loading-list">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="loading-list-item" key={index}>
                <div className="loading-dot" />
                <div className="loading-stack">
                  <div className="loading-line loading-line--card-title" />
                  <div className="loading-line loading-line--body" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
