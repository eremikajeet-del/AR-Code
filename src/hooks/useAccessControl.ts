import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function useAccessControl() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData?.session?.user

        if (!user) {
          navigate('/login')
          return
        }

        const { data: allowedData, error } = await supabase
          .from('allowed_users')
          .select('email')
          .eq('email', user.email)
          .single()

        if (error || !allowedData) {
          await supabase.auth.signOut()
          navigate('/login', {
            state: {
              accessError: 'Access denied. You have not been invited to use this panel. Please contact the administrator.'
            }
          })
          return
        }

        setAllowed(true)
      } catch (err) {
        navigate('/login')
      } finally {
        setChecking(false)
      }
    }

    checkAccess()
  }, [navigate])

  return { checking, allowed }
}
