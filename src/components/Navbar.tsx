import { Link, useNavigate } from 'react-router-dom'
import { Box, LogOut, User } from 'lucide-react'
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
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand/Logo */}
        <Link to="/" className="flex items-center gap-2 group transition-all duration-300">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all duration-300">
            <Box className="w-6 h-6 text-white animate-float" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white">
            Aura<span className="text-indigo-400">3D</span>
          </span>
        </Link>

        {/* Auth / Menu */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-sm text-slate-300">
                <User className="w-4 h-4 text-indigo-400" />
                <span className="max-w-[150px] truncate">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-red-500/30 text-slate-300 hover:text-red-400 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-300 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/30"
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
