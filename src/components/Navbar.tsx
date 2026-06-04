import { Link, useNavigate } from 'react-router-dom'
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
    <nav className="sticky top-0 z-50 w-full bg-[#FAFAF8] border-b border-[#E8E4DC]">
      <div className="mx-auto flex h-[56px] max-w-[960px] items-center justify-between px-6">
        <Link to="/" className="text-[18px] font-serif text-[#1A1714]">Tamtara</Link>
        <div className="flex items-center gap-5">
          {user ? (
            <>
              <span className="text-[12px] text-[#8C8479]">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-[13px] text-[#8C8479] transition-colors duration-200 hover:text-[#1A1714]"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-5">
              <Link
                to="/login"
                className="text-[13px] text-[#8C8479] transition-colors duration-200 hover:text-[#1A1714]"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="text-[13px] text-[#1A1714] font-medium"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
