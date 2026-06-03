import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Lazy load Dashboard and Viewer for performance optimization
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Viewer = lazy(() => import('./pages/Viewer'))

// Fullscreen Loading Spinner
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-display">Securing session...</p>
      </div>
    </div>
  )
}

// Protected Route Wrapper (Requires Login)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Redirect to login page but save the current location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// Auth Route Wrapper (Redirects to Dashboard if already logged in)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Layout wrapper that conditionally displays Navbar (hides on public Viewer screen)
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isViewerPage = location.pathname.startsWith('/view/')

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {!isViewerPage && <Navbar />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}

// Main App Routes handler
function AppContent() {
  const { loading } = useAuth()

  // Prevents page flash by rendering a full-page spinner until auth state resolves
  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Layout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public AR Viewer page */}
          <Route path="/view/:id" element={<Viewer />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <Signup />
              </AuthRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
