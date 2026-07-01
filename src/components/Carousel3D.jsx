import { useRef, useState, useEffect, useCallback } from 'react'

const ANG = 38        // degrees between each slide
const BASE_W = 168    // card width (px)
const BASE_R = 300    // ring radius (px)
const BASE_H = 218    // card height (px)

export default function Carousel3D({ slides }) {
  const rootRef = useRef(null)
  const ringRef = useRef(null)
  const stageRef = useRef(null)
  const posRef = useRef(0)
  const [active, setActive] = useState(0)
  const [dim, setDim] = useState({ cardW: BASE_W, cardH: BASE_H, stageH: BASE_H + 40, R: BASE_R, boost: 0 })
  const n = slides.length

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const PERSP = 1400
    const measure = () => {
      const w = el.clientWidth
      if (!w) return
      const narrow = w < 768
      const boost = narrow ? 70 : 0
      const frontScale = PERSP / (PERSP - (BASE_R + boost))
      const PEEK = 0.6
      const cardW = narrow ? Math.round((w * PEEK) / frontScale) : BASE_W
      const cardH = narrow ? Math.round(cardW * (BASE_H / BASE_W)) : BASE_H
      const stageH = narrow ? Math.round(cardH * frontScale) + 14 : BASE_H + 40
      setDim({ cardW, cardH, stageH, R: BASE_R, boost })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const layout = useCallback(
    (pos, animate) => {
      const el = ringRef.current
      if (!el) return
      const count = el.children.length || n
      let i = 0
      for (const c of el.children) {
        let rel = (((i - pos) % count) + count) % count
        if (rel > count / 2) rel -= count
        const a = Math.abs(rel)
        const forward = (1 - Math.min(a, 1)) * dim.boost
        c.style.transition = animate && a < 1.5 ? 'transform .55s cubic-bezier(.22,1,.36,1), opacity .3s' : 'transform 0s, opacity .25s'
        c.style.transform = `rotateY(${(rel * ANG).toFixed(3)}deg) translateZ(${dim.R + forward}px)`
        c.style.opacity = '1'
        c.style.zIndex = String(Math.round(1000 - a * 100))
        c.style.pointerEvents = a < 0.5 ? 'auto' : 'none'
        i++
      }
    },
    [n, dim.R, dim.boost]
  )

  useEffect(() => {
    const id = requestAnimationFrame(() => layout(posRef.current, false))
    return () => cancelAnimationFrame(id)
  }, [layout])

  const go = (i) => {
    const p = posRef.current
    let delta = (((i - p) % n) + n) % n
    if (delta > n / 2) delta -= n
    posRef.current = p + delta
    layout(posRef.current, true)
    setActive((((Math.round(posRef.current) % n) + n) % n))
  }

  const onPointerDown = (e) => {
    e.preventDefault()
    const startX = e.clientX
    const base = posRef.current
    if (stageRef.current) stageRef.current.style.cursor = 'grabbing'
    const move = (ev) => {
      posRef.current = base - (ev.clientX - startX) * 0.0068
      layout(posRef.current, false)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      if (stageRef.current) stageRef.current.style.cursor = 'grab'
      const target = Math.round(posRef.current)
      posRef.current = target
      layout(target, true)
      setActive((((target % n) + n) % n))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1) }
  }

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    let snap
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientWidth : 1
      posRef.current += e.deltaX * unit * 0.0068
      layout(posRef.current, false)
      clearTimeout(snap)
      snap = setTimeout(() => {
        const target = Math.round(posRef.current)
        posRef.current = target
        layout(target, true)
        setActive((((target % n) + n) % n))
      }, 110)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => { el.removeEventListener('wheel', onWheel); clearTimeout(snap) }
  }, [layout, n])

  return (
    <div ref={rootRef}>
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        role="group"
        aria-label="Personal records carousel"
        tabIndex={0}
        className="carousel-stage"
        style={{
          position: 'relative', height: dim.stageH,
          margin: '6px -14px 2px', overflow: 'hidden',
          perspective: '1400px', perspectiveOrigin: 'center 47%',
          touchAction: 'pan-y', cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none',
        }}
      >
        <div ref={ringRef} style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', willChange: 'transform' }}>
          {slides.map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute', left: '50%', top: '50%',
                width: dim.cardW, height: dim.cardH,
                marginLeft: -dim.cardW / 2, marginTop: -dim.cardH / 2,
                boxSizing: 'border-box', backfaceVisibility: 'hidden', willChange: 'transform,opacity',
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
      {/* dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 4 }}>
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            className="carousel-dot"
            aria-label={`Go to slide ${i + 1} of ${n}`}
            aria-current={i === active}
            style={{
              width: i === active ? 26 : 8, height: 8, borderRadius: 99, cursor: 'pointer',
              border: 'none', padding: 0,
              transition: 'width .3s, background .3s',
              background: i === active ? 'var(--accent)' : 'rgba(212,168,75,.25)',
            }} />
        ))}
      </div>
    </div>
  )
}
