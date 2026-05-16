import React from 'react'
import { useAppContext } from '../context/AppContext'

const ChatBox = () => {

  const {selectedChat, theme} = useAppContext()

  const[messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if(selectedChat){
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  return (
    <div>
      ChatBox
    </div>
  )
}

export default ChatBox
