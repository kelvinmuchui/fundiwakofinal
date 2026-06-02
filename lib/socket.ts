import { Server as HTTPServer } from 'http';
import { Socket, Server } from 'socket.io';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

// Store active socket connections: userId -> socketId
const activeUsers = new Map<string, string>();

// Store typing status: conversationId -> Set<userId>
const typingUsers = new Map<string, Set<string>>();

export function initializeSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins with their ID
    socket.on('user:join', (userId: string) => {
      activeUsers.set(userId, socket.id);
      socket.join(userId); // Join personal room
      socket.join('online'); // Join global online room
      
      // Broadcast user is online
      io.to('online').emit('user:online', {
        userId,
        timestamp: new Date(),
      });
      
      console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    // Message sent
    socket.on('message:send', async (data: {
      conversationId: string;
      fromUserId: string;
      toUserId: string;
      content: string;
    }) => {
      try {
        const { conversationId, fromUserId, toUserId, content } = data;
        
        // Emit to recipient
        const recipientSocket = activeUsers.get(toUserId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('message:new', {
            conversationId,
            fromUserId,
            content,
            timestamp: new Date(),
            status: 'delivered',
          });
        }
        
        // Emit confirmation to sender
        socket.emit('message:ack', {
          status: 'sent',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', { message: 'Failed to send message' });
      }
    });

    // User is typing
    socket.on('typing:start', (data: {
      conversationId: string;
      userId: string;
      otherUserId: string;
    }) => {
      const { conversationId, userId, otherUserId } = data;
      
      // Add to typing set
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set());
      }
      typingUsers.get(conversationId)!.add(userId);
      
      // Notify other user
      const otherSocket = activeUsers.get(otherUserId);
      if (otherSocket) {
        io.to(otherSocket).emit('typing:indicator', {
          conversationId,
          userId,
          isTyping: true,
        });
      }
    });

    // User stopped typing
    socket.on('typing:end', (data: {
      conversationId: string;
      userId: string;
      otherUserId: string;
    }) => {
      const { conversationId, userId, otherUserId } = data;
      
      // Remove from typing set
      const typingSet = typingUsers.get(conversationId);
      if (typingSet) {
        typingSet.delete(userId);
        if (typingSet.size === 0) {
          typingUsers.delete(conversationId);
        }
      }
      
      // Notify other user
      const otherSocket = activeUsers.get(otherUserId);
      if (otherSocket) {
        io.to(otherSocket).emit('typing:indicator', {
          conversationId,
          userId,
          isTyping: false,
        });
      }
    });

    // Message read
    socket.on('message:read', async (data: {
      conversationId: string;
      messageId: string;
      toUserId: string;
    }) => {
      const { conversationId, messageId, toUserId } = data;
      
      // Update message status in DB
      try {
        const messagesCol = await getCollection('messages');
        await messagesCol.updateOne(
          { _id: new ObjectId(messageId) },
          { $set: { status: 'read', readAt: new Date() } }
        );
      } catch (error) {
        console.error('Error updating message status:', error);
      }
      
      // Notify sender
      const senderSocket = activeUsers.get(toUserId);
      if (senderSocket) {
        io.to(senderSocket).emit('message:read', {
          conversationId,
          messageId,
          timestamp: new Date(),
        });
      }
    });

    // Conversation archived
    socket.on('conversation:archive', (data: {
      conversationId: string;
      userId: string;
    }) => {
      const { conversationId, userId } = data;
      socket.emit('conversation:archived', { conversationId });
    });

    // User disconnects
    socket.on('disconnect', () => {
      // Remove user from active list
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          
          // Broadcast user is offline
          io.to('online').emit('user:offline', {
            userId,
            timestamp: new Date(),
          });
          
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}

export { activeUsers, typingUsers };
