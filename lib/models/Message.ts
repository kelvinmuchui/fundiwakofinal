import { ObjectId } from 'mongodb';

export interface Message {
  _id?: string | ObjectId;
  conversationId: string; // Reference to Conversation
  fromUserId: string; // Sender
  toUserId: string; // Recipient
  content: string; // Message text
  attachments?: Array<{
    type: 'image' | 'file' | 'document';
    url: string;
    name: string;
    size?: number;
  }>;
  
  // Message metadata
  read: boolean;
  readAt?: Date;
  edited: boolean;
  editedAt?: Date;
  
  // Reactions (emoji reactions)
  reactions?: Array<{
    userId: string;
    emoji: string;
    addedAt: Date;
  }>;
  
  // Threading/Replies
  replyTo?: string; // Message ID being replied to
  
  // Status
  status: 'sent' | 'delivered' | 'read' | 'failed';
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date;
}

export interface Conversation {
  _id?: string | ObjectId;
  participants: [string, string]; // Two user IDs
  
  // Metadata
  lastMessage?: string; // Last message content
  lastMessageAt?: Date;
  lastMessageSenderId?: string;
  
  // Unread counts
  unreadCount?: {
    [userId: string]: number;
  };
  
  // Muting
  mutedBy?: string[]; // Users who muted this conversation
  
  // Pinned messages
  pinnedMessages?: string[]; // Message IDs
  
  // Archive status
  archivedBy?: string[];
  
  // Conversation settings
  isGroup?: false; // Phase 2 is 1:1 only, groups in Phase 3
  name?: string;
  avatar?: string;
  
  // Typing indicators
  typingUsers?: Array<{
    userId: string;
    typingSince: Date;
  }>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id?: string | ObjectId;
  userId: string; // Recipient
  type: 'message' | 'typing' | 'call' | 'reaction';
  
  // Message notification
  messageId?: string;
  conversationId?: string;
  fromUserId?: string;
  
  // Content
  title: string;
  body: string;
  
  // Status
  read: boolean;
  readAt?: Date;
  
  // Timestamps
  createdAt: Date;
  expiresAt?: Date; // Auto-delete after some time
}
