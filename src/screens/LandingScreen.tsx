import { useStore } from '../store/useStore'

interface Props {
  onGetStarted: () => void
}

export default function LandingScreen({ onGetStarted }: Props) {
  return (
    <div className="fixed inset-0 overflow-y-auto" style={{background: 'linear-gradient(160deg, #2A1F14 0%, #6B4F28 100%)'}}>
      {/* Hero */}
      <div className="flex flex-col items-center pt-16 pb-10 px-6 text-center">
        <img src="/icon-512.png" alt="Mufasa" className="w-28 h-28 rounded-3xl mb-6 shadow-2xl" />
        <h1 className="text-white mb-3" style={{fontFamily: "Cinzel, serif", fontSize: 52, fontWeight: 900, letterSpacing: 6}}>MUFASA</h1>
        <p className="text-lg text-white/60 mb-8 leading-relaxed">Your AI-powered<br />personal fitness coach</p>
        <button onClick={onGetStarted}
          className="w-full max-w-xs bg-gold text-ink font-extrabold text-base py-4 rounded-2xl shadow-lg active:opacity-80 mb-3">
          Create My Plan — Free
        </button>
        <p className="text-xs text-white/30">No account required · Takes 30 seconds</p>
      </div>

      {/* Features */}
      <div className="px-6 pb-10 max-w-sm mx-auto">
        {[
          { icon: 'smart_toy', title: 'AI-Generated Plans', desc: 'Workout + meal plans personalised to your body type, goal, and lifestyle' },
          { icon: 'restaurant', title: 'Calorie Tracker', desc: '55+ Indian foods with serving sizes. Log in seconds, not minutes' },
          { icon: 'fitness_center', title: 'Workout Tracker', desc: 'Week view, exercise checkoffs, form guides, sport-specific protocols' },
          { icon: 'trending_up', title: 'Progress Tracking', desc: 'Weight trend, monthly targets, 12-week transformation timeline' },
          { icon: 'lock_open', title: 'No Login Required', desc: 'Create your plan instantly — sign in only when you want to start tracking' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="ms ms-sm text-gold-dark">{icon}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-16 text-center">
        <button onClick={onGetStarted}
          className="w-full max-w-xs bg-gold text-ink font-extrabold text-base py-4 rounded-2xl shadow-lg active:opacity-80 mb-4">
          Start Your Transformation
        </button>
        <p className="text-xs text-white/20">Built for Indians · Free forever</p>
      </div>
    </div>
  )
}
