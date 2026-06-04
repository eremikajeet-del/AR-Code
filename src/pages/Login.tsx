import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const accessError = location.state?.accessError as string | undefined

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authErr) throw authErr
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto flex min-h-screen max-w-[380px] flex-col justify-center px-6 py-10">
        <div className="text-center">
          <p className="text-[24px] font-serif tracking-[0.08em] text-[#1A1714]">Tamtara</p>
          <p className="mt-2 text-[12px] uppercase text-[#8C8479]">Menu Management</p>
        </div>

        <div className="mt-12">
          <h1 className="text-[32px] font-serif text-[#1A1714]">Welcome back</h1>
          <form onSubmit={handleLogin} className="mt-10 space-y-3">
            <div>
              <label className="block text-[12px] uppercase tracking-[0.15em] text-[#8C8479] mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={loading}
                className="w-full h-11 rounded-[4px] border border-[#E8E4DC] bg-white px-4 text-[14px] text-[#1A1714] placeholder:text-[#8C8479] focus:border-[#1A1714] outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-[0.15em] text-[#8C8479] mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full h-11 rounded-[4px] border border-[#E8E4DC] bg-white px-4 text-[14px] text-[#1A1714] placeholder:text-[#8C8479] focus:border-[#1A1714] outline-none"
              />
            </div>

            {(error || accessError) && (
              <p className="text-[12px] text-[#C0392B]">{error || accessError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-[4px] bg-[#1A1714] text-[14px] font-medium text-white transition-colors duration-200 hover:bg-[#3D3530] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-center text-[13px] text-[#C17D3C]">
            Don't have an account?{' '}
            <Link to="/signup" className="underline decoration-[#C17D3C] decoration-1 hover:no-underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
