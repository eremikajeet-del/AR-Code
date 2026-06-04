import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
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
    <div className="min-h-screen bg-panel relative overflow-hidden px-4 py-10 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,151,58,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(232,184,109,0.08),_transparent_25%)]" />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[32px] border border-[#2d2318] bg-[#1a1510]/95 p-12 shadow-[0_40px_120px_rgba(201,151,58,0.15)] lg:flex lg:flex-col lg:justify-center">
          <div className="mb-8 rounded-3xl border border-[#2d2318] bg-[#120d09] p-7 shadow-[0_18px_45px_rgba(201,151,58,0.14)]">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-[#22160f] text-[#e8b86d] text-2xl shadow-[0_14px_40px_rgba(201,151,58,0.16)]">
              🍽️
            </div>
            <p className="mt-6 text-sm uppercase tracking-[0.3em] text-[#e8b86d]">Tamtara</p>
            <h2 className="mt-4 text-4xl font-display font-semibold text-white leading-tight">Restaurant Management Portal</h2>
            <p className="mt-4 max-w-xl text-base text-muted leading-relaxed">Manage premium 3D dish models for your Nagpur dining experience. Secure, elegant, and built for your restaurant's AR menu.</p>
          </div>

          <div className="space-y-6 rounded-[28px] border border-[#2d2318] bg-[#120d09] p-8">
            <div className="text-sm uppercase tracking-[0.28em] text-[#e8b86d]">Premium access</div>
            <p className="text-white text-lg font-medium leading-relaxed">Once signed in, upload menu items, generate shareable QR codes, and keep every dish ready for immersive AR viewing.</p>
            <div className="grid gap-4 text-sm text-muted">
              <div className="rounded-2xl border border-[#2d2318] bg-[#14100d] p-4">Elegant dashboard tailored for restaurant staff</div>
              <div className="rounded-2xl border border-[#2d2318] bg-[#14100d] p-4">Warm, luxurious controls built for premium food presentation</div>
            </div>
          </div>
        </div>

        <div className="glass-card relative overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(201,151,58,0.15),_transparent_40%)] opacity-70" />
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#22160f] text-3xl shadow-[0_14px_40px_rgba(201,151,58,0.16)]">🍽️</div>
              <p className="text-sm uppercase tracking-[0.32em] text-[#e8b86d] font-semibold">Tamtara</p>
              <h1 className="mt-4 text-3xl font-display font-semibold text-white sm:text-4xl">Restaurant Management Portal</h1>
              <p className="mt-3 text-sm text-muted">Sign in to access the premium 3D menu upload and AR sharing experience.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {accessError && (
                <div className="rounded-2xl border border-[#ef5350]/30 bg-[#3f1210] p-4 text-sm text-[#ef5350]">
                  ⛔ {accessError}
                </div>
              )}
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-[#ef5350]/25 bg-[#3f1210] p-4 text-sm text-[#ef5350]">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-[#ef5350]" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-[0.25em] text-[#e8b86d]">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#a89880]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={loading}
                    className="input-panel w-full rounded-xl border border-[#2d2318] px-4 py-4 pl-12 text-sm text-text-primary placeholder:text-text-secondary focus:border-[#c9973a] focus:ring-4 focus:ring-[#c9973a]/10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs uppercase tracking-[0.25em] text-[#e8b86d]">Password</label>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#a89880]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="input-panel w-full rounded-xl border border-[#2d2318] px-4 py-4 pl-12 text-sm text-text-primary placeholder:text-text-secondary focus:border-[#c9973a] focus:ring-4 focus:ring-[#c9973a]/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="gold-button w-full rounded-2xl px-5 py-4 text-sm font-semibold shadow-[0_18px_45px_rgba(201,151,58,0.2)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <div className="mx-auto flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0a0705] border-t-transparent animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-[#2d2318] pt-5 text-center text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#e8b86d] font-semibold hover:text-white">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
