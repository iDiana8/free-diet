import ProgressRing from './ProgressRing';

const metricCards = [
  { key: 'protein', title: 'Белки', unit: 'г' },
  { key: 'fat', title: 'Жиры', unit: 'г' },
  { key: 'carbs', title: 'Углеводы', unit: 'г' },
  { key: 'water_ml', title: 'Вода', unit: 'мл' },
];

function formatBalance(value, unit) {
  if (value === 0) {
    return `в норме · ${unit}`;
  }

  const prefix = value > 0 ? '+' : '';

  return `${prefix}${value} ${unit}`;
}

function getBalanceClass(value) {
  if (value > 0) {
    return 'metric-card--over';
  }

  if (value < 0) {
    return 'metric-card--under';
  }

  return 'metric-card--ok';
}

function DashboardCard({ dashboard, selectedDate }) {
  const { summary, progress, targets, balances } = dashboard;

  return (
    <section className="dashboard-card">
      <div className="dashboard-card__header">
        <div>
          <div className="dashboard-card__eyebrow">Дневная аналитика</div>
          <h2 className="dashboard-card__title">Сводка питания за {selectedDate}</h2>
            Здесь видно, как человек заполнил рацион по калориям, макроэлементам и воде.
          </p>
        </div>
        <div className="dashboard-card__summary">
          <span>Всего ккал</span>
          <strong>{summary.calories}</strong>
        </div>
      </div>

      <div className="dashboard-card__body">
        <ProgressRing
          value={progress.calories}
          target={targets.calories}
          label="Калорийность"
          unit="ккал"
          accentClass={balances.calories > 0 ? 'progress-ring--alert' : 'progress-ring--good'}
        />

        <div className="dashboard-card__metrics">
          {metricCards.map((metric) => (
            <article key={metric.key} className={`metric-card ${getBalanceClass(balances[metric.key])}`}>
              <div className="metric-card__title">{metric.title}</div>
              <div className="metric-card__value">{summary[metric.key]} {metric.unit}</div>
              <div className="metric-card__meta">Цель: {targets[metric.key]} {metric.unit}</div>
              <div className="metric-card__balance">{formatBalance(balances[metric.key], metric.unit)}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DashboardCard;
