// src/domain/models/MessageModel.ts
export interface MessageModel {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    read: boolean;
    createdAt: Date;
  }
  
  export interface ConversationModel {
    id: string;
    participants: string[]; // IDs des participants
    serviceId?: string; // Service concerné si applicable
    applicationId?: string; // Candidature concernée si applicable
    lastMessage?: {
      content: string;
      senderId: string;
      createdAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
  }