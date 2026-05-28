import React, { useEffect, useState } from "react";
import { assets } from '../assets/assets'
import moment from 'moment';
import Markdown from 'react-markdown'
import Prism from 'prismjs'

const Message = ({ message }) => {

  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Reset image states when message content changes
  useEffect(() => {
    setImgLoaded(false)
    setImgError(false)
  }, [message.content])

  // Syntax-highlight any code blocks in markdown responses
  useEffect(() => {
    Prism.highlightAll()
  }, [message.content])

  return (
    <div>
      {message.role === "user" ? (
        // User message — right-aligned
        <div className="flex items-start justify-end my-4 gap-2">
          <div className="flex flex-col gap-2 p-2 px-4 bg-slate-100 dark:bg-[#57317C]/40 border border-slate-200 dark:border-[#80609F]/30 rounded-xl max-w-2xl">
            <p className="text-sm text-gray-800 dark:text-white/90">{message.content}</p>
            <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">{moment(message.timestamp).fromNow()}</span>
          </div>
          <img src={assets.user_icon} alt="You" className='w-8 rounded-full shrink-0' />
        </div>
      ) 
      : 
      (
        // Assistant message — left-aligned
        <div className='inline-flex flex-col gap-2 p-3 px-4 max-w-2xl bg-primary/20 dark:bg-[#57317C]/25 border border-primary/50 dark:border-[#80609F]/30 rounded-xl my-4'>
          {message.isImage ? (
            <div className="relative mt-1">
              {/* Loading skeleton shown while image loads */}
              {!imgLoaded && !imgError && (
                <div className="w-full max-w-md h-48 bg-gray-200 dark:bg-[#57317C]/40 rounded-lg animate-pulse flex items-center justify-center">
                  <span className="text-xs text-gray-400 dark:text-white/40">Generating image…</span>
                </div>
              )}
              {/* Error state */}
              {imgError && (
                <div className="w-full max-w-md h-32 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-red-500 dark:text-red-400">Image failed to load</span>
                </div>
              )}
              {/* Actual image — fades in on load */}
              {!imgError && (
                <img
                  src={message.content}
                  alt="AI generated image"
                  className={`w-full max-w-md rounded-lg transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'w-0 h-0 overflow-hidden'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => { setImgError(true); setImgLoaded(false); }}
                />
              )}
            </div>
          ) : (
            // Text / markdown response
            <div className="text-sm text-gray-800 dark:text-white/90 reset-tw">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
          <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">{moment(message.timestamp).fromNow()}</span>
        </div>
      )
      }
    </div>
  );
};

export default Message;
