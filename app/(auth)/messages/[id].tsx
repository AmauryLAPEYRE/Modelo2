// app/(auth)/messages/[id].tsx
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MessageItem } from '../../../src/components/messages/MessageItem';
import { Card } from '../../../src/components/ui';
import { MessageModel } from '../../../src/domain/models/MessageModel';
import { createThemedStyles, useTheme } from '../../../src/utils/theme';
import { useAuthViewModel } from '../../../src/viewModels/useAuthViewModel';
import { useMessageViewModel } from '../../../src/viewModels/useMessageViewModel';
import { useUserViewModel } from '../../../src/viewModels/useUserViewModel';

export default function ConversationScreen() {
  const { id: receiverId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { 
    messages, 
    getOrCreateConversation, 
    sendMessage, 
    markMessagesAsRead,
    subscribeToMessages,
    isLoading 
  } = useMessageViewModel();
  const { currentUser } = useAuthViewModel();
  const { fetchUserById } = useUserViewModel();
  
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [receiverInfo, setReceiverInfo] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!currentUser || !receiverId) return;
    
    const initializeConversation = async () => {
      try {
        // Charger les informations du destinataire
        const receiverData = await fetchUserById(receiverId);
        setReceiverInfo(receiverData);
        
        // Obtenir ou créer la conversation
        const conversation = await getOrCreateConversation([currentUser.id, receiverId]);
        setConversationId(conversation.id);
        
        // S'abonner aux messages en temps réel
        const unsubscribe = subscribeToMessages(conversation.id, (newMessages) => {
          // Les messages sont automatiquement mis à jour dans le state
        });
        
        // Marquer les messages comme lus
        await markMessagesAsRead(conversation.id, currentUser.id);
        
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing conversation:', error);
      } finally {
        setIsLoadingConversation(false);
      }
    };
    
    initializeConversation();
  }, [currentUser, receiverId]);
  
  // Défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const handleSend = async () => {
    if (!inputText.trim() || !currentUser || !receiverId || !conversationId) return;
    
    setIsSending(true);
    try {
      await sendMessage(conversationId, currentUser.id, receiverId, inputText.trim());
      setInputText('');
      // Défiler vers le bas après l'envoi
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      // Afficher une erreur à l'utilisateur
    } finally {
      setIsSending(false);
    }
  };
  
  const groupMessages = (messages: MessageModel[]): MessageModel[][] => {
    const groups: MessageModel[][] = [];
    let currentGroup: MessageModel[] = [];
    let currentSenderId: string | null = null;
    
    messages.forEach((message, index) => {
      if (currentSenderId !== message.senderId) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [];
        currentSenderId = message.senderId;
      }
      
      currentGroup.push(message);
      
      // Si c'est le dernier message ou le prochain a un sender différent
      if (index === messages.length - 1 || messages[index + 1].senderId !== message.senderId) {
        groups.push([...currentGroup]);
        currentGroup = [];
        currentSenderId = null;
      }
    });
    
    return groups;
  };
  
  if (isLoadingConversation || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* En-tête personnalisé */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {receiverInfo?.photoURL ? (
            <Image source={{ uri: receiverInfo.photoURL }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <FontAwesome name="user" size={20} color={theme.colors.primary} />
            </View>
          )}
          <Text style={styles.headerName}>{receiverInfo?.displayName || 'Chat'}</Text>
        </View>
      </View>
      
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <Card padding="md" style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color={theme.colors.textSecondary} style={styles.emptyIcon} />
            <Text style={styles.emptyStateText}>
              Aucun message pour le moment.
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Soyez le premier à envoyer un message !
            </Text>
          </Card>
        ) : (
          groupMessages(messages).map((messageGroup, groupIndex) => (
            <View key={groupIndex} style={styles.messageGroup}>
              {messageGroup.map((message, messageIndex) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === currentUser?.id}
                  showTimestamp={messageIndex === messageGroup.length - 1}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
      
      {/* Input de saisie */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Écrivez un message..."
            style={styles.textInput}
            multiline
            maxLength={1000}
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.xs,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
  },
  headerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  headerName: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: theme.spacing.md,
  },
  messageGroup: {
    marginBottom: theme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  emptyStateSubtext: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
  },
  inputContainer: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}));