// ExerciseFigure — static Material Symbol icons, no animations

interface Props {
  anim: string
  color?: string
  size?: number
}

const ICON_MAP: Record<string, string> = {
  press:  'fitness_center',
  pull:   'vertical_align_top',
  squat:  'accessibility_new',
  curl:   'sports_gymnastics',
  raise:  'open_in_full',
  hinge:  'self_improvement',
  rotate: 'autorenew',
  run:    'directions_run',
  plank:  'horizontal_rule',
  row:    'rowing',
}

export default function ExerciseFigure({ anim, color = '#E4B26A', size = 34 }: Props) {
  const icon   = ICON_MAP[anim] || 'fitness_center'
  const iconPx = Math.round(size * 0.65)

  return (
    <span
      className="ms ms-fill"
      style={{ fontSize: iconPx, color, display: 'block', lineHeight: 1 }}
    >
      {icon}
    </span>
  )
}
