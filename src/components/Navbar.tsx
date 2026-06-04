import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      navigate('/login')
    } else {
      alert(`Error logging out: ${error.message}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full frosted-topbar border-b border-[#c9973a]/15 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-[#2d2318] bg-[#1a1510] text-[#e8b86d] shadow-[0_18px_50px_rgba(201,151,58,0.16)]">🍽️</div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#e8b86d]">Tamtara</p>
            <p className="text-lg font-display font-semibold text-white">Restaurant Portal</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#2d2318] bg-[#120d09] px-4 py-2 text-sm text-[#a89880]">
                <User className="h-4 w-4 text-[#e8b86d]" />
                <span className="max-w-[180px] truncate">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="gold-button inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold shadow-[0_18px_45px_rgba(201,151,58,0.18)] transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-[#a89880] transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="gold-button rounded-2xl px-4 py-2 text-sm font-semibold shadow-[0_18px_45px_rgba(201,151,58,0.18)]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
