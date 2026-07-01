import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/line-chart"
import type { WeightEntry } from "../types"

const GOLD   = '#D4A84B'
const AZURE  = '#5B8FA8'
const CARD   = '#1C1410'
const ELEV   = '#221A12'
const BORDER = 'rgba(255,255,255,0.07)'
const TEXT   = '#F0E4C8'
const MUTED  = 'rgba(240,228,200,0.45)'

const chartConfig = {
  weight: { label: "Actual",  color: GOLD  },
  target: { label: "Target",  color: AZURE },
} satisfies ChartConfig

interface Props {
  weightLog: WeightEntry[]
  targetLabel?: string
  onLogClick: () => void
}

export function WeightTrendChart({ weightLog, targetLabel, onLogClick }: Props) {
  const hasData = weightLog.length >= 2
  const startW  = weightLog[0]?.weight ?? 80

  const data = weightLog.map(entry => {
    const weeksIn = (new Date(entry.date).getTime() - new Date(weightLog[0].date).getTime()) / (7 * 86400000)
    const target  = parseFloat((startW - (weeksIn / 4.33) * 0.75).toFixed(1))
    const [, m, d] = entry.date.split('-')
    return { date: `${m}/${d}`, weight: entry.weight, target }
  })

  // Y-axis domain with 1 kg padding
  const weights = data.flatMap(d => [d.weight, d.target])
  const yMin = Math.floor(Math.min(...weights) - 1)
  const yMax = Math.ceil(Math.max(...weights)  + 1)

  return (
    <div style={{ margin: '0 16px 14px', background: CARD, borderRadius: 20, padding: 20, border: `1px solid ${BORDER}` }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Weight Trend</p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 14, height: 2.5, background: GOLD, borderRadius: 2 }} />
              <span style={{ fontSize: 9, color: MUTED }}>Actual</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 14, height: 2, borderTop: '2px dashed rgba(91,143,168,0.5)' }} />
              <span style={{ fontSize: 9, color: MUTED }}>Target {targetLabel ? `(${targetLabel})` : '(−0.75 kg/mo)'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onLogClick}
          style={{ width: 34, height: 34, borderRadius: 10, background: GOLD, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(212,168,75,0.3)' }}
        >
          <span style={{ fontSize: 20, fontWeight: 300, color: '#120D08', lineHeight: 1 }}>+</span>
        </button>
      </div>

      {/* Chart */}
      {!hasData ? (
        <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 12, color: MUTED, textAlign: 'center' }}>Log 2+ weight entries to see your trend</p>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="w-full aspect-auto" style={{ height: 160 }}>
          <LineChart data={data} margin={{ left: -8, right: 4, top: 8, bottom: 0 }}>
            <defs>
              <filter id="weight-glow" x="-20%" y="-80%" width="140%" height="260%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 9, fill: MUTED }}
              interval="preserveStartEnd"
            />

            <YAxis
              domain={[yMin, yMax]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: MUTED }}
              tickFormatter={v => `${v}`}
              width={28}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <span style={{ color: name === 'weight' ? GOLD : AZURE, fontWeight: 700 }}>
                      {`${value} kg`}
                    </span>
                  )}
                />
              }
            />

            {/* Target — dashed, no glow */}
            <Line
              dataKey="target"
              type="monotone"
              stroke={AZURE}
              strokeWidth={1.5}
              strokeDasharray="4 5"
              dot={false}
              opacity={0.55}
            />

            {/* Actual — solid with glow */}
            <Line
              dataKey="weight"
              type="monotone"
              stroke={GOLD}
              strokeWidth={2.5}
              dot={false}
              filter="url(#weight-glow)"
            />
          </LineChart>
        </ChartContainer>
      )}
    </div>
  )
}
