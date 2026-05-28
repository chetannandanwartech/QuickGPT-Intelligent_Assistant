import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import moment from "moment";
import toast from "react-hot-toast";


const Sidebar = ({isMenuOpen, setIsMenuOpen}) => {
  const { chats, setSelectedChat, theme, setTheme, user, navigate, createNewChat, setChats, axios, fetchUsersChats, setToken, token} = useAppContext();
  const [search, setSearch] = useState("");

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    toast.success('Logged out successfully')
  }

  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation()
      const confirm = window.confirm('Are you sure you want to delete this chat?')
      if(!confirm) return
      const {data} = await axios.post('/api/chat/delete', {chatId}, {headers: {Authorization: token } })
      if(data.success){
        setChats(prev => prev.filter(chat => chat._id !== chatId))
        await fetchUsersChats()
        toast.success(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className={`flex flex-col h-screen min-w-72 p-5 bg-white dark:bg-gradient-to-b dark:from-[#1e0f2e]/80 dark:to-[#0a0010]/90 border-r border-gray-200 dark:border-[#80609F]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-10 ${!isMenuOpen && "max-md:-translate-x-full"}`}>
      {/* Logo */}
      <img
        src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
        alt=""
        className="w-full max-w-48"
      />

      {/* New Chat Button */}
      <button onClick={createNewChat} className="flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer">
        <span className="mr-2 text-xl">+</span> New Chat
      </button>

      {/* Search Conversations */}
      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/20 rounded-md">
        <img src={assets.search_icon} className="w-4 not-dark:invert" alt="" />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search conversations"
          className="text-xs text-gray-800 dark:text-white bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-white/40 dark:caret-white flex-1"
        />
      </div>

      {/* Recent Chats */}
      {chats.length > 0 && <p className="mt-4 text-sm text-gray-600 dark:text-white/70">Recent Chats</p>}
      <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((chat) => (
            <div onClick={()=> {navigate('/'); setSelectedChat(chat); setIsMenuOpen(false) }}
              key={chat._id}
              className="p-2 px-4 bg-gray-50 dark:bg-[#57317C]/10 border border-gray-200 dark:border-[#80609F]/20 rounded-md cursor-pointer flex justify-between group hover:bg-gray-100 dark:hover:bg-[#57317C]/20 transition-colors"
            >
              <div className="min-w-0">
                <p className="truncate w-full text-gray-800 dark:text-white/90">
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>
              <img
                src={assets.bin_icon}
                className="hidden group-hover:block w-4 cursor-pointer not-dark:invert shrink-0 ml-2"
                alt="Delete chat" onClick={e=> toast.promise(deleteChat(e, chat._id), {loading: 'Deleting...'})}/>
            </div>
          ))}
      </div>

      {/* Community Images */}
      <div onClick={()=> {navigate('/community'); setIsMenuOpen(false)}} className="flex items-center gap-2 p-3 mt-4 border border-gray-200 dark:border-white/15 rounded-md cursor-pointer hover:scale-[1.02] transition-all">
        <img src={assets.gallery_icon} className="w-4.5 not-dark:invert" alt="" />
        <div className="flex flex-col text-sm">
          <p className="text-gray-700 dark:text-white">Community Images</p>
        </div>
      </div>

      {/* Credits Purchases Option */}
      <div onClick={()=> {navigate('/credits'); setIsMenuOpen(false) }} className="flex items-center gap-2 p-3 mt-4 border border-gray-200 dark:border-white/15 rounded-md cursor-pointer hover:scale-[1.02] transition-all">
        <img src={assets.diamond_icon} className="w-4.5 dark:invert" alt="" />
        <div className="flex flex-col text-sm">
          <p className="text-gray-700 dark:text-white">Credits : {user?.credits}</p>
          <p className="text-xs text-gray-400 dark:text-white/50">Purchase credits to use AskioGPT</p>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between gap-2 p-3 mt-4 border border-gray-200 dark:border-white/15 rounded-md">
        <div className="flex items-center gap-2 text-sm">
          <img src={assets.theme_icon} className="w-4 dark:invert" alt="" />
          <p className="text-gray-700 dark:text-white">Dark Mode</p>
        </div>
        <label className="relative inline-flex cursor-pointer">
          <input onChange={()=> setTheme(theme === 'dark' ? 'light' : 'dark')} type="checkbox" className="sr-only peer" checked={theme === 'dark'} readOnly />
          <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-purple-600 transition-all">
          </div>
          <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
        </label>
      </div>

      {/* User Account */}
      <div className="flex items-center gap-3 p-3 mt-4 border border-gray-200 dark:border-white/15 rounded-md cursor-pointer group">
        <img src={assets.user_icon} className="w-7 rounded-full" alt="" />
        <p className="flex-1 text-sm text-gray-700 dark:text-white truncate">{user ? user.name : 'Login your account'}</p>
        {user && <img onClick={logout} src={assets.logout_icon} className="h-5 cursor-pointer hidden not-dark:invert group-hover:block" />}
      </div>

      <img onClick={()=> setIsMenuOpen(false)} src={assets.close_icon} className="absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert" alt="" />

    </div>
  );
};

export default Sidebar;
