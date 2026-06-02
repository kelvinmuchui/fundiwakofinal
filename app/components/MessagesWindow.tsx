"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { Send, Smile, Paperclip } from "lucide-react";

interface MessageUser {
  _id: string;
  name: string;
  photoURL?: string;
}

interface MessageData {
  _id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  read: boolean;
  createdAt: string;
  status: "sent" | "delivered" | "read";
}

interface MessagesWindowProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto?: string;
}

export default function MessagesWindow({
  conversationId,
  otherUserId,
  otherUserName,
  otherUserPhoto
}: MessagesWindowProps) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Refresh messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: otherUserId,
          content: newMessage.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to send');

      const data = await response.json();
      setMessages([...messages, data.message]);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          {otherUserPhoto ? (
            <Image
              src={otherUserPhoto}
              alt={otherUserName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
              {otherUserName.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{otherUserName}</h3>
            <p className="text-xs text-gray-600">Online</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
          ⋮
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const showDate =
              index === 0 ||
              formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

            return (
              <div key={message._id}>
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${
                    message.fromUserId === otherUserId ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.fromUserId === otherUserId
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-primary-600 text-white'
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.fromUserId === otherUserId
                        ? 'text-gray-600'
                        : 'text-primary-100'
                    }`}>
                      {formatTime(message.createdAt)}
                      {message.fromUserId !== otherUserId && message.status && (
                        <span className="ml-1">
                          {message.status === 'read' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <Smile size={20} />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
