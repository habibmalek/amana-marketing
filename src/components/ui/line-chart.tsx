// src/components/ui/line-chart.tsx
interface LineChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface LineChartProps {
  title: string;
  data: LineChartDataPoint[];
  className?: string;
  height?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
  lineColor?: string;
  areaOpacity?: number;
}

export function LineChart({ 
  title, 
  data, 
  className = "", 
  height = 300,
  showValues = true,
  formatValue = (value) => value.toLocaleString(),
  lineColor = '#3B82F6',
  areaOpacity = 0.1
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const valueRange = maxValue - minValue;

  // Calculate positions for each data point
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = valueRange > 0 ? 100 - ((item.value - minValue) / valueRange) * 100 : 50;
    return { x, y, value: item.value, label: item.label };
  });

  // Generate SVG path for the line
  const linePath = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  // Generate SVG path for the area (closed path)
  const areaPath = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ` L 100 100 L 0 100 Z`;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((yPos) => (
            <line
              key={yPos}
              x1="0"
              y1={yPos}
              x2="100"
              y2={yPos}
              stroke="#374151"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill={lineColor}
            fillOpacity={areaOpacity}
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="2"
                fill={lineColor}
                stroke="#1F2937"
                strokeWidth="1"
                className="transition-all duration-200 hover:r-3"
              />
              
              {/* Value tooltip on hover */}
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="transparent"
                className="cursor-pointer"
              >
                <title>
                  {point.label}: {formatValue(point.value)}
                </title>
              </circle>
            </g>
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
          {data.map((point, index) => (
            <div key={index} className="text-center flex-1">
              {point.label}
            </div>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-2">
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue(minValue + valueRange * 0.5)}</span>
          <span>{formatValue(minValue)}</span>
        </div>
      </div>
    </div>
  );
}
