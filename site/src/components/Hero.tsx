import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4'

const NAV_ITEMS = ['Start', 'Story', 'Rates', 'Benefits', 'FAQ']

// The source clip dollies back from an engine close-up to a wide shot; the move
// is effectively finished by 8s. Looping only the tail keeps the jet cruising at
// a fixed size instead of receding.
const LOOP_START = 8.0
const LOOP_END = 9.6

// The tail window already frames the whole jet; anything above ~1.05 crops the
// nose and tail on a 16:9 viewport. Scaling happens around the jet's centre of
// mass so the counter-scale below doesn't shift it.
const ZOOM = 1.0
const ZOOM_ORIGIN = '48% 76%'

// The tail still creeps back ~6% across the window. Growing the scale by the
// same amount cancels it, and resetting at the loop point offsets the frame
// jump rather than compounding it.
const RESIDUAL_DRIFT = 0.06

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let frame = 0

    // Keeps the jet inside the cruising window and scales out the drift left in
    // it. rAF drives the scale; timeupdate is the backstop for when the browser
    // throttles rAF in a background tab and playback would otherwise run past
    // LOOP_END into the loop attribute's restart at 0.
    const hold = () => {
      if (video.currentTime >= LOOP_END || video.currentTime < LOOP_START - 0.1) {
        video.currentTime = LOOP_START
      }
      const progress = (video.currentTime - LOOP_START) / (LOOP_END - LOOP_START)
      const scale = ZOOM * (1 + RESIDUAL_DRIFT * Math.min(Math.max(progress, 0), 1))
      video.style.transform = `scale(${scale.toFixed(4)})`
    }

    const start = () => {
      hold()
      void video.play().catch(() => {})
    }

    const tick = () => {
      hold()
      frame = requestAnimationFrame(tick)
    }

    if (video.readyState >= 1) start()
    else video.addEventListener('loadedmetadata', start, { once: true })

    video.addEventListener('timeupdate', hold)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      video.removeEventListener('loadedmetadata', start)
      video.removeEventListener('timeupdate', hold)
    }
  }, [])

  return (
    <section className="relative h-screen overflow-hidden bg-gray-100">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: `scale(${ZOOM})`, transformOrigin: ZOOM_ORIGIN }}
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
      />

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
