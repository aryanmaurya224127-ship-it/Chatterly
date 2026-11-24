
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import api from "../utils/api";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();

  const socketRef = useRef(null);
  const activeChatRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const refreshChats = async () => {
    const { data } = await api.get("/chats");
    setChats(data);
    return data;
  };

  // Socket connection
  useEffect(() => {
    if (!user) {
      setChats([]);
      setActiveChat(null);
      setMessages([]);
      setOnlineUsers([]);
      setTypingUser("");
      return;
    }

    let mounted = true;

    refreshChats().catch(console.error);

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5001",
      {
        auth: {
          token: localStorage.getItem("chatterly_token")
        }
      }
    );

    socketRef.current = socket;

    const handleOnline = ({ userId }) => {
      setOnlineUsers(prev =>
        [...new Set([...prev, userId])]
      );
    };

    const handleOffline = ({ userId }) => {
      setOnlineUsers(prev =>
        prev.filter(id => id !== userId)
      );
    };

    const handleNotification = () => {
      if (mounted) refreshChats().catch(console.error);
    };

    const handleMessage = message => {
      if (!mounted) return;

      const currentChat = activeChatRef.current;

      if (
        currentChat &&
        String(currentChat._id) === String(message.chat?._id || message.chat)
      ) {
        setMessages(prev =>
          prev.some(m => m._id === message._id)
            ? prev
            : [...prev, message]
        );
      }

      refreshChats().catch(console.error);
    };

    const handleTyping = ({ roomId, name }) => {
      if (
        String(activeChatRef.current?._id) === String(roomId)
      ) {
        setTypingUser(name);
      }
    };

    const handleStopTyping = ({ roomId }) => {
      if (
        String(activeChatRef.current?._id) === String(roomId)
      ) {
        setTypingUser("");
      }
    };

    socket.on("user_online", handleOnline);
    socket.on("user_offline", handleOffline);
    socket.on("message_notification", handleNotification);
    socket.on("message_received", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      mounted = false;

      socket.off("user_online", handleOnline);
      socket.off("user_offline", handleOffline);
      socket.off("message_notification", handleNotification);
      socket.off("message_received", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);

      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [user]);

  // Load messages when chat changes
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      setTypingUser("");
      return;
    }

    let cancelled = false;

    const socket = socketRef.current;
    const chatId = activeChat._id;

    socket?.emit("join_chat", chatId);

    setMessages([]);
    setTypingUser("");

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${chatId}`);

        if (!cancelled) {
          setMessages(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Message fetching error:", error);
        }
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
      socket?.emit("leave_chat", chatId);
    };
  }, [activeChat?._id]);

  // Send message
  const sendMessage = async (content) => {
    if (!activeChat) {
      throw new Error("No active chat selected");
    }

    const chatId = activeChat._id;

    const { data } = await api.post("/messages", {
      content,
      chatId
    });

    if (
      String(activeChatRef.current?._id) === String(chatId)
    ) {
      setMessages(prev =>
        prev.some(m => m._id === data._id)
          ? prev
          : [...prev, data]
      );
    }

    socketRef.current?.emit("new_message", {
      ...data,
      chat: {
        _id: chatId,
        users: activeChat.users
      }
    });

    refreshChats().catch(console.error);

    return data;
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        activeChat,
        setActiveChat,
        messages,
        sendMessage,
        refreshChats,
        socket: socketRef,
        onlineUsers,
        typingUser,
        setTypingUser
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
