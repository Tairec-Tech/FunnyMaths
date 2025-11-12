import './ProgressChart.css'

interface ProgressChartProps {
  data: Array<{ label: string; value: number; max: number }>
  title?: string
}

export default function ProgressChart({ data, title }: ProgressChartProps) {
  return (
    <div className="progress-chart">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-bars">
        {data.map((item, index) => {
          const percentage = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0
          return (
            <div key={index} className="chart-bar-item">
              <div className="bar-label">
                <span>{item.label}</span>
                <span className="bar-value">
                  {item.value} / {item.max}
                </span>
              </div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{
                    width: `${percentage}%`,
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <span className="bar-percentage">{percentage}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

