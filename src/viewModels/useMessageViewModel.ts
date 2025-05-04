// src/viewModels/useMessageViewModel.ts
import { create } from 'zustand';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { ConversationModel, MessageModel } from '../domain/models/MessageModel';
import { createDocument, getDocument, queryDocuments, updateDocument } from '../services/firebase/firestore';
import { firestore } from '../services/firebase/config';

interface MessageState {
  conversations: ConversationModel[];
  currentConversation: ConversationModel | null;
  messages: MessageModel[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchConversations: (userId: string) => Promise<ConversationModel[]>;
  fetchMessages: (conversationId: string) => Promise<MessageModel[]>;
  
  getOrCreateConversation: (
    participants: string[], 
    serviceId?: string, 
    applicationId?: string
  ) => Promise<ConversationModel>;
  
  sendMessage: (
    conversationId: string, 
    senderId: string, 
    receiverId: string, 
    content: string
  ) => Promise<MessageModel>;
  
  markMessagesAsRead: (conversationId: string, userId: string) => Promise<void>;
  
  subscribeToMessages: (
    conversationId: string, 
    callback: (messages: MessageModel[]) => void
  ) => () => void;
  
  subscribeToConversations: (
    userId: string, 
    callback: (conversations: ConversationModel[]) => void
  ) => () => void;
  
  setCurrentConversation: (conversation: ConversationModel | null) => void;
  clearError: () => void;
}

export const useMessageViewModel = create<MessageState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchConversations: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const constraints = [
        {
          field: 'participants',
          operator: 'array-contains',
          value: userId
        }
      ];
      
      const conversations = await queryDocuments<ConversationModel>(
        'conversations', 
        constraints, 
        'updatedAt', 
        'desc'
      );
      
      set({ conversations });
      return conversations;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    set({ isLoading: true, error: null });
    try {
      const constraints = [
        {
          field: 'conversationId',
          operator: '==',
          value: conversationId
        }
      ];
      
      const messages = await queryDocuments<MessageModel>(
        'messages', 
        constraints, 
        'createdAt', 
        'asc'
      );
      
      set({ messages });
      return messages;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getOrCreateConversation: async (participants, serviceId, applicationId) => {
    set({ isLoading: true, error: null });
    try {
      // Vérifier si une conversation existe déjà entre ces participants
      const constraints = [];
      
      // Note: Firestore ne peut pas faire deux array-contains dans une même requête
      // Nous devons donc filtrer après avoir récupéré les résultats
      const existingConversations = await queryDocuments<ConversationModel>(
        'conversations',
        [
          {
            field: 'participants',
            operator: 'array-contains',
            value: participants[0]
          }
        ]
      );
      
      // Filtrer pour trouver une conversation avec exactement les mêmes participants
      const exactMatch = existingConversations.find(conv => {
        return (
          conv.participants.length === participants.length &&
          participants.every(p => conv.participants.includes(p)) &&
          (serviceId ? conv.serviceId === serviceId : true) &&
          (applicationId ? conv.applicationId === applicationId : true)
        );
      });
      
      if (exactMatch) {
        set({ currentConversation: exactMatch });
        return exactMatch;
      }
      
      // Créer une nouvelle conversation
      const newConversation = await createDocument<ConversationModel>('conversations', {
        participants,
        serviceId,
        applicationId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      set(state => ({
        conversations: [newConversation, ...state.conversations],
        currentConversation: newConversation
      }));
      
      return newConversation;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (conversationId, senderId, receiverId, content) => {
    set({ isLoading: true, error: null });
    try {
      // Créer le message
      const message = await createDocument<MessageModel>('messages', {
        conversationId,
        senderId,
        receiverId,
        content,
        read: false,
        createdAt: new Date()
      });
      
      // Mettre à jour la conversation avec le dernier message
      await updateDocument<ConversationModel>('conversations', conversationId, {
        lastMessage: {
          content,
          senderId,
          createdAt: new Date()
        },
        updatedAt: new Date()
      });
      
      // Mettre à jour l'état
      set(state => ({
        messages: [...state.messages, message]
      }));
      
      return message;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  markMessagesAsRead: async (conversationId, userId) => {
    set({ isLoading: true, error: null });
    try {
      // Récupérer tous les messages non lus adressés à l'utilisateur
      const constraints = [
        {
          field: 'conversationId',
          operator: '==',
          value: conversationId
        },
        {
          field: 'receiverId',
          operator: '==',
          value: userId
        },
        {
          field: 'read',
          operator: '==',
          value: false
        }
      ];
      
      const unreadMessages = await queryDocuments<MessageModel>('messages', constraints);
      
      // Marquer chaque message comme lu
      await Promise.all(
        unreadMessages.map(message =>
          updateDocument<MessageModel>('messages', message.id, { read: true })
        )
      );
      
      // Mettre à jour l'état
      set(state => ({
        messages: state.messages.map(m => 
          m.conversationId === conversationId && m.receiverId === userId 
            ? { ...m, read: true } 
            : m
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  subscribeToMessages: (conversationId, callback) => {
    const q = query(
      collection(firestore, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MessageModel[];
      
      set({ messages });
      callback(messages);
    }, (error) => {
      set({ error: error.message });
    });
  },

  subscribeToConversations: (userId, callback) => {
    const q = query(
      collection(firestore, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConversationModel[];
      
      set({ conversations });
      callback(conversations);
      
      // Calculer le nombre de messages non lus
      let unreadCount = 0;
      conversations.forEach(conv => {
        if (conv.lastMessage && !conv.lastMessage.read && conv.lastMessage.senderId !== userId) {
          unreadCount++;
        }
      });
      
      set({ unreadCount });
    }, (error) => {
      set({ error: error.message });
    });
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },

  clearError: () => {
    set({ error: null });
  }
}));