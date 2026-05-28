import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Loading = () => {
  const navigate = useNavigate()
  const { fetchUser } = useAppContext()

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        await fetchUser()
      } catch (_) {
        // fetchUser handles its own errors via toast
      } finally {
        navigate('/')
      }
    }, 8000)
    return () => clearTimeout(timeout)
  }, [fetchUser, navigate]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='bg-gradient-to-b from-[#531B81] to-[#29184B] flex items-center justify-center h-screen w-screen'>
      <div className='w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin'></div>
    </div>
  )
}

export default Loading
