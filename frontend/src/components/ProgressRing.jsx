function ProgressRing({ value, target, label, unit, accentClass = '' }) {
  const safePercent = Math.max(0, Math.min(value, 100));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className={`progress-ring ${accentClass}`.trim()}>
      <svg className="progress-ring__svg" viewBox="0 0 140 140" aria-hidden="true">
        <circle className="progress-ring__track" cx="70" cy="70" r={radius} />
        <circle
          className="progress-ring__progress"
          cx="70"
          cy="70"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="progress-ring__content">
        <div className="progress-ring__value">{Math.round(value)}%</div>
        <div className="progress-ring__label">{label}</div>
        <div className="progress-ring__target">Цель: {target} {unit}</div>
      </div>
    </div>
  );
}

export default ProgressRing;
