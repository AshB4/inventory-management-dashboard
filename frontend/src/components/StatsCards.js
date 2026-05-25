function StatsCards({ stats }) {
  return (
    <section aria-labelledby="analytics-title" className="stats-section" id="analytics">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Operational Snapshot</p>
          <h3 className="panel-title" id="analytics-title">
            Analytics cards
          </h3>
        </div>
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Total products</p>
          <p className="stat-value">{stats.totalProducts}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Low stock count</p>
          <p className="stat-value">{stats.lowStockCount}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Inventory value</p>
          <p className="stat-value">${Number(stats.inventoryValue).toFixed(2)}</p>
        </article>
      </div>
    </section>
  );
}

export default StatsCards;
