function getPoints(values, width, height, padding) {
  const max = Math.max(...values, 1);
  const step = (width - padding * 2) / Math.max(values.length - 1, 1);
  return values.map((value, index) => ({
    x: padding + index * step,
    y: height - padding - (value / max) * (height - padding * 2)
  }));
}

function smoothPath(points) {
  if (!points.length) return "";
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const midpoint = (previous.x + point.x) / 2;
    return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
}

export default function Sparkline({ values }) {
  const width = 156;
  const height = 46;
  const points = getPoints(values, width, height, 3);
  const path = smoothPath(points);
  const area = `${path} L ${width - 3} ${height - 2} L 3 ${height - 2} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-11 w-32 sm:w-36" role="img" aria-label="Daily spending trend">
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4b86b4" stopOpacity="0.16" />
          <stop offset="1" stopColor="#4b86b4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkline-fill)" />
      <path d={path} fill="none" stroke="#4b86b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
