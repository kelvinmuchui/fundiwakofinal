"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

interface ConversationUser {
  _id: string;
  name: string;
  photoURL?: string;
  headline?: string;
  role: string;
  isVerified?: boolean;
}

interface Conversation {
  _id: string;
  participants: [string, string];
  lastMessage?: string;
  lastMessageAt?: string;
  otherUser?: ConversationUser;
  unreadCount: number;
}

export default function MessagesList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const truncateMessage = (message: string, length: number = 50) => {
    return message.length > length ? message.substring(0, length) + '...' : message;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No conversations yet</p>
        <p className="text-sm text-gray-500">Connect with people to start messaging</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Link
          key={conversation._id}
          href={`/messages/${conversation._id}`}
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border ${
            selectedConversation === conversation._id
              ? 'bg-primary-50 border-primary-300'
              : 'border-transparent'
          }`}
        >
          {/* Avatar */}
          {conversation.otherUser?.photoURL ? (
            <Image
              src={conversation.otherUser.photoURL}
              alt={conversation.otherUser.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
              {conversation.otherUser?.name.charAt(0)}
            </div>
          )}

          {/* Message Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-semibold text-gray-900 ${
                conversation.unreadCount > 0 ? 'font-bold' : ''
              }`}>
                {conversation.otherUser?.name}
              </h3>
              {conversation.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </span>
              )}
            </div>
            <p className={`text-sm truncate ${
              conversation.unreadCount > 0
                ? 'text-gray-900 font-medium'
                : 'text-gray-600'
            }`}>
              {truncateMessage(conversation.lastMessage || 'No messages yet')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(conversation.lastMessageAt)}
            </p>
          </div>

          {/* Verification Badge */}
          {conversation.otherUser?.isVerified && (
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-700 text-xs rounded-full">
                ✓
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
