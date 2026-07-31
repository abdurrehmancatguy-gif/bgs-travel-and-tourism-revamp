import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4'

const NAV_ITEMS = ['Start', 'Story', 'Rates', 'Benefits', 'FAQ']

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <section className="relative h-screen overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
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
