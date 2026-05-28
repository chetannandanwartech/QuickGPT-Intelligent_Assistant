import React from 'react'
import { useEffect, useState, useRef } from 'react'
import { assets } from '../assets/assets'
import Message from './Message'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const ChatBox = () => {

  const containerRef = useRef(null)

  const {selectedChat, theme, user, axios, token, setUser} = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!user) return toast('Login to send message')
    if (!prompt.trim()) return
    if (!selectedChat) return toast.error('No chat selected. Please create a new chat.')

    // Capture before clearing — accessible in both success and error paths
    const promptCopy = prompt.trim()

    setLoading(true)
    setPrompt('')

    // Optimistically add the user message to the UI immediately
    setMessages(prev => [...prev, {
      role: 'user',
      content: promptCopy,
      timestamp: Date.now(),
      isImage: false,
    }])

    try {
      const { data } = await axios.post(`/api/message/${mode}`, {
        chatId: selectedChat._id,
        prompt: promptCopy,
        isPublished,
      }, {
        headers: { Authorization: token },
        timeout: mode === 'image' ? 120000 : 30000,
      })

      if (data.success) {
        setMessages(prev => [...prev, data.reply])
        // Sync credit balance locally (avoids a refetch roundtrip)
        setUser(prev => ({ ...prev, credits: prev.credits - (mode === 'image' ? 2 : 1) }))
      } else {
        // API returned a business error — restore prompt so user can edit & retry
        setPrompt(promptCopy)
        setMessages(prev => prev.slice(0, -1))

        if (data.message?.includes('quota')) {
          toast.error('AI quota exhausted — please try again later or upgrade your plan.')
        } else if (data.message?.includes('credits')) {
          toast.error('Not enough credits — purchase more from the Credits page.')
        } else if (data.message?.includes('timed out')) {
          toast.error('Image generation timed out. Please try a simpler prompt.')
        } else {
          toast.error(data.message || 'Something went wrong. Please try again.')
        }
      }
    } catch (error) {
      // Network / timeout error — restore prompt so user can retry
      setPrompt(promptCopy)
      setMessages(prev => prev.slice(0, -1))

      const msg = error.code === 'ECONNABORTED'
        ? mode === 'image'
          ? 'Image generation timed out (2 min limit). Please retry with a simpler prompt.'
          : 'Request timed out. Please check your connection and retry.'
        : (error.message || 'Network error. Please check your connection.')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>

      {/* Chat messages container */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center gap-2'>
            <img
              src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              alt="AskioGPT"
              className='w-full max-w-56 sm:max-w-68'
            />
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white/60'>
              Ask me anything
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <Message key={`${selectedChat?._id}-${index}`} message={message} />
        ))}

        {/* Three-dot loading indicator */}
        {loading && (
          <div className='loader flex items-center gap-1.5 mt-2 p-2'>
            <div className='w-2 h-2 rounded-full bg-gray-400 dark:bg-purple-400 animate-bounce'></div>
            <div className='w-2 h-2 rounded-full bg-gray-400 dark:bg-purple-400 animate-bounce [animation-delay:0.15s]'></div>
            <div className='w-2 h-2 rounded-full bg-gray-400 dark:bg-purple-400 animate-bounce [animation-delay:0.3s]'></div>
          </div>
        )}
      </div>

      {/* Publish to community option (image mode only) */}
      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto cursor-pointer select-none'>
          <p className='text-xs text-gray-600 dark:text-white/70'>Publish Generated Image to Community</p>
          <input
            type="checkbox"
            className='cursor-pointer accent-purple-600'
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {/* Prompt input form */}
      <form
        onSubmit={onSubmit}
        className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/40 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'
      >
        {/* Mode selector */}
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className='text-sm pl-2 pr-1 outline-none bg-transparent text-gray-700 dark:text-white cursor-pointer'
          disabled={loading}
        >
          <option className='bg-white dark:bg-purple-950 text-gray-800 dark:text-white' value="text">Text</option>
          <option className='bg-white dark:bg-purple-950 text-gray-800 dark:text-white' value="image">Image</option>
        </select>

        {/* Divider */}
        <div className='w-px h-5 bg-gray-300 dark:bg-white/20 shrink-0'></div>

        {/* Prompt input */}
        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder={mode === 'image' ? 'Describe the image to generate...' : 'Type your prompt here...'}
          className='flex-1 w-full text-sm outline-none bg-transparent text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 caret-purple-600 dark:caret-white disabled:opacity-50'
          disabled={loading}
        />

        {/* Send button */}
        <button type="submit" disabled={loading} className='shrink-0 disabled:opacity-50 cursor-pointer'>
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className='w-8'
            alt={loading ? 'Loading' : 'Send'}
          />
        </button>
      </form>
    </div>
  )
}

export default ChatBox
