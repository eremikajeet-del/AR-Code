import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

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
    } catch (err: unknown) {
      console.error('Login error:', err)
      setError((err as Error).message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '28px',
              fontWeight: 400,
              color: '#F0F0F0',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Tamtara
          </p>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              color: '#555555',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            AR Menu Platform
          </p>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '36px',
            fontWeight: 400,
            color: '#F0F0F0',
            marginBottom: '32px',
          }}
        >
          Sign in
        </h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '6px',
              padding: '0 16px',
              color: '#F0F0F0',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              outline: 'none',
              marginBottom: '12px',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#C9A84C')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
          />

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '6px',
              padding: '0 16px',
              color: '#F0F0F0',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              outline: 'none',
              marginBottom: '12px',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#C9A84C')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
          />

          {error && (
            <p
              style={{
                color: '#EF4444',
                fontSize: '12px',
                fontFamily: "'Inter', sans-serif",
                marginTop: '8px',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              background: loading ? '#8a7035' : '#C9A84C',
              color: '#080808',
              border: 'none',
              borderRadius: '6px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '20px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#B8963E'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#C9A84C'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            color: '#555555',
          }}
        >
          No account?{' '}
          <Link
            to="/signup"
            style={{ color: '#555555', textDecoration: 'underline', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F0F0F0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#555555')}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
