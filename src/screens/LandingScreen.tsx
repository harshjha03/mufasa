import { useStore } from '../store/useStore'

interface Props {
  onGetStarted: () => void
}

export default function LandingScreen({ onGetStarted }: Props) {
  const { loadDemoData } = useStore()
  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{background: 'linear-gradient(160deg, #2A1F14 0%, #6B4F28 100%)'}}>

      {/* Hero — compact */}
      <div className="flex flex-col items-center pt-10 pb-6 px-6 text-center">
        <img src="/icon-512.png" alt="Mufasa" className="w-20 h-20 rounded-3xl mb-4 shadow-2xl" />
        <h1 className="text-white mb-2" style={{fontFamily: "Cinzel, serif", fontSize: 44, fontWeight: 900, letterSpacing: 6}}>MUFASA</h1>
        <p className="text-base text-white/60">Your AI-powered personal fitness coach</p>
      </div>

      {/* Features */}
      <div className="flex-1 px-6 overflow-hidden">
        {[
          { icon: 'smart_toy',     title: 'AI-Generated Plans',  desc: 'Workout + meal plans personalised to your body type, goal, and lifestyle' },
          { icon: 'restaurant',    title: 'Calorie Tracker',     desc: '55+ Indian foods with serving sizes. Log in seconds, not minutes' },
          { icon: 'fitness_center',title: 'Workout Tracker',     desc: 'Week view, exercise checkoffs, form guides, sport-specific protocols' },
          { icon: 'trending_up',   title: 'Progress Tracking',   desc: 'Weight trend, monthly targets, 12-week transformation timeline' },
          { icon: 'lock_open',     title: 'No Login Required',   desc: 'Create your plan instantly — sign in only when you want to start tracking' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="ms ms-sm text-gold-dark">{icon}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA — pinned to bottom */}
      <div className="px-6 pb-10 pt-4 text-center">
        <div className="flex gap-3 mb-3">
          <button onClick={onGetStarted}
            className="flex-1 bg-gold font-extrabold text-base py-4 rounded-2xl shadow-lg active:opacity-80"
            style={{ color: '#000000' }}>
            Create My Plan
          </button>
          <button onClick={loadDemoData}
            className="flex-1 bg-white/20 text-white font-bold text-base py-4 rounded-2xl active:opacity-70 border border-white/25">
            Try Demo
          </button>
        </div>
      </div>
    </div>
  )
}
