import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    try {
      const { data, error: authErr } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authErr) throw authErr

      if (data?.session) {
        navigate('/dashboard')
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account.')
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
          <h1 className="text-[32px] font-serif text-[#1A1714]">Create account</h1>
          {success ? (
            <div className="mt-10 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5EBE0] text-[#1A1714]">
                <CheckCircle className="h-7 w-7" />
              </div>
              <p className="text-center text-[14px] text-[#1A1714]">Account created. Check your email to continue.</p>
              <Link
                to="/login"
                className="mt-4 inline-flex w-full items-center justify-center rounded-[4px] border border-[#1A1714] bg-white px-4 py-3 text-[14px] font-medium text-[#1A1714] transition-colors duration-200 hover:bg-[#F5EBE0]"
              >
                Go to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="mt-10 space-y-3">
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
                  placeholder="•••••••• (min 6 chars)"
                  disabled={loading}
                  className="w-full h-11 rounded-[4px] border border-[#E8E4DC] bg-white px-4 text-[14px] text-[#1A1714] placeholder:text-[#8C8479] focus:border-[#1A1714] outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-[0.15em] text-[#8C8479] mb-2">Confirm password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full h-11 rounded-[4px] border border-[#E8E4DC] bg-white px-4 text-[14px] text-[#1A1714] placeholder:text-[#8C8479] focus:border-[#1A1714] outline-none"
                />
              </div>

              {error && <p className="text-[12px] text-[#C0392B]">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex h-11 w-full items-center justify-center rounded-[4px] bg-[#1A1714] text-[14px] font-medium text-white transition-colors duration-200 hover:bg-[#3D3530] disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Get started'}
              </button>
            </form>
          )}

          {!success && (
            <p className="mt-4 text-center text-[13px] text-[#C17D3C]">
              Already have an account?{' '}
              <Link to="/login" className="underline decoration-[#C17D3C] decoration-1 hover:no-underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
