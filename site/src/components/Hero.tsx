import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4'

const NAV_ITEMS = ['Start', 'Story', 'Rates', 'Benefits', 'FAQ']

// The source clip dollies back from an engine close-up to a wide shot; the move
// is effectively finished by 8s. Looping only the tail keeps the jet cruising at
// a fixed size instead of receding.
const LOOP_START = 8.0
const LOOP_END = 9.9

// No two frames in the clip match well enough to cut between: comparing every
// candidate window (scale-corrected, 160x90) the best pair still differs by
// MAE 5.1, and this window by 10.7. So two copies run a frame apart and
// cross-dissolve at the seam instead of cutting. FADE is the dissolve length,
// which also sets the visible cycle: LOOP_END - LOOP_START - FADE.
const FADE = 0.5

// The window already frames the whole jet; anything above ~1.05 crops the nose
// and tail on a 16:9 viewport. Scaling happens around the jet's centre of mass,
// measured from the frame analysis.
const ZOOM = 1.0
const ZOOM_ORIGIN = '48% 76%'

// The window still creeps back, but not linearly: measured plane height goes
// 52px at 8.0s -> ~49.7px by 8.7s, then holds flat to the end. Counter-scaling
// on that same curve (ramp to DRIFT_SETTLE, then constant) normalises the jet
// to one size for every frame in the window. That is what lets the dissolve
// work: both layers render the jet identically registered, so only the clouds
// blend and the jet itself never ghosts. A linear ramp to LOOP_END instead
// under-corrects by ~3% mid-dissolve.
const DRIFT_SETTLE = 8.7
const DRIFT_AMOUNT = 0.046

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const a = videoARef.current
    const b = videoBRef.current
    if (!a || !b) return

    const layers = [a, b]
    let activeIndex = 0
    let frame = 0

    const applyScale = (video: HTMLVideoElement) => {
      const progress =
        (video.currentTime - LOOP_START) / (DRIFT_SETTLE - LOOP_START)
      const scale = ZOOM * (1 + DRIFT_AMOUNT * Math.min(Math.max(progress, 0), 1))
      video.style.transform = `scale(${scale.toFixed(4)})`
    }

    const fadeStart = LOOP_END - FADE

    const step = () => {
      const active = layers[activeIndex]
      const incoming = layers[1 - activeIndex]

      // Only rewind a layer that fell outside the window entirely (first paint,
      // or the loop attribute restarting at 0 after a throttled tab overshot the
      // end). The seam itself is owned by the dissolve below: clamping at
      // LOOP_END here would fire before the dissolve completed and hard-cut.
      if (active.currentTime < LOOP_START - 0.1) {
        active.currentTime = LOOP_START
      }

      if (active.currentTime >= fadeStart) {
        if (incoming.paused) {
          incoming.currentTime = LOOP_START
          void incoming.play().catch(() => {})
        }
        const k = Math.min((active.currentTime - fadeStart) / FADE, 1)
        active.style.opacity = String(1 - k)
        incoming.style.opacity = String(k)

        if (k >= 1) {
          active.pause()
          active.currentTime = LOOP_START
          active.style.opacity = '0'
          incoming.style.opacity = '1'
          activeIndex = 1 - activeIndex
        }
      } else {
        active.style.opacity = '1'
      }

      applyScale(active)
      applyScale(incoming)
    }

    const tick = () => {
      step()
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      b.pause()
      b.currentTime = LOOP_START
      b.style.opacity = '0'
      a.currentTime = LOOP_START
      a.style.opacity = '1'
      void a.play().catch(() => {})
      step()
    }

    if (a.readyState >= 1 && b.readyState >= 1) start()
    else a.addEventListener('loadedmetadata', start, { once: true })

    // Backstop for when a background tab throttles rAF and playback would
    // otherwise run past LOOP_END into the loop attribute's restart at 0.
    a.addEventListener('timeupdate', step)
    b.addEventListener('timeupdate', step)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      a.removeEventListener('loadedmetadata', start)
      a.removeEventListener('timeupdate', step)
      b.removeEventListener('timeupdate', step)
    }
  }, [])

  return (
    <section className="relative h-screen overflow-hidden bg-gray-100">
      {[videoARef, videoBRef].map((ref, i) => (
        <video
          key={i}
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transform: `scale(${ZOOM})`,
            transformOrigin: ZOOM_ORIGIN,
            opacity: i === 0 ? 1 : 0,
          }}
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      ))}

      <div className="relative flex h-full flex-col">
        <nav className="mx-auto w-full max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold text-gray-900">SkyElite</span>

            <ul className="hidden items-center gap-8 md:flex">
              {NAV_ITEMS.map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-gray-900 transition-colors hover:text-gray-700"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="text-gray-900 transition-colors hover:text-gray-700 md:hidden"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {menuOpen && (
            <ul className="mt-4 rounded-2xl bg-white/95 py-4 shadow-lg backdrop-blur md:hidden">
              {NAV_ITEMS.map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-6 py-2 text-gray-900 transition-colors hover:text-gray-700"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <div className="flex flex-1 items-center justify-center">
          <div className="-mt-80 flex flex-col items-center px-8 text-center">
            <p className="mb-4 text-sm font-semibold tracking-wider text-gray-600">
              PRIVATE JETS
            </p>

            <h1 className="text-6xl font-normal leading-none tracking-tighter md:text-7xl lg:text-8xl">
              <span className="block text-gray-500">Premium.</span>
              <span className="block" style={{ color: '#202A36', marginTop: '-12px' }}>
                Accessible.
              </span>
            </h1>

            <p className="mb-6 max-w-2xl text-lg text-gray-600 md:text-xl">
              Your dedication deserves recognition.
            </p>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                className="rounded-full bg-gray-300 px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-400"
              >
                Discover
              </button>
              <button
                type="button"
                className="rounded-full px-4 py-2 font-medium text-white transition-colors"
                style={{ backgroundColor: '#202A36' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a2229'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#202A36'
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
