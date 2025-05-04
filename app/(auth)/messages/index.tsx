// app/(auth)/messages/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { ConversationItem } from '../../../src/components/messages/ConversationItem';
import { Card } from '../../../src/components/ui';
import { createThemedStyles, useTheme } from '../../../src/utils/theme';
import { useAuthViewModel } from '../../../src/viewModels/useAuthViewModel';
import { useMessageViewModel } from '../../../src/viewModels/useMessageViewModel';
import { ConversationModel } from '../../../src/domain/models/MessageModel';

export default function MessagesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { conversations, fetchConversations, isLoading, subscribeToConversations } = useMessageViewModel();
  const { currentUser } = useAuthViewModel();
  
  const [refreshing, setRefreshing] = useState(false);
  const [participantInfo, setParticipantInfo] = useState<Record<string, any>>({});
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Récupérer les conversations initiales
    fetchConversations(currentUser.id);
    
    // S'abonner aux mises à jour en temps réel
    const unsubscribe = subscribeToConversations(currentUser.id, (updatedConversations) => {
      // Traitement des données en temps réel si nécessaire
    });
    
    return () => {
      unsubscribe();
    };
  }, [currentUser]);
  
  useEffect(() => {
    // Charger les informations des participants
    const loadParticipantsInfo = async () => {
      const userIds = conversations
        .flatMap(conv => conv.participants)
        .filter(id => id !== currentUser?.id);
      
      // Créer un set pour éviter les doublons
      const uniqueUserIds = [...new Set(userIds)];
      
      // Charger les infos de chaque participant
      const info: Record<string, any> = {};
      for (const userId of uniqueUserIds) {
        try {
          const user = await fetchUserById(userId);
          if (user) {
            info[userId] = {
              displayName: user.displayName,
              photoURL: user.photoURL,
            };
          }
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
        }
      }
      
      setParticipantInfo(info);
    };
    
    if (conversations.length > 0) {
      loadParticipantsInfo();
    }
  }, [conversations]);
  
  const handleRefresh = async () => {
    if (!currentUser) return;
    
    setRefreshing(true);
    try {
      await fetchConversations(currentUser.id);
    } finally {
      setRefreshing(false);
    }
  };
  
  const getOtherParticipantId = (conversation: ConversationModel): string => {
    return conversation.participants.find(id => id !== currentUser?.id) || '';
  };
  
  const calculateUnreadCount = (conversation: ConversationModel): number => {
    // Cette logique devrait être implémentée dans le ViewModel
    // Pour l'instant, retourner 0
    return 0;
  };
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading && !refreshing ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : conversations.length > 0 ? (
          conversations.map(conversation => {
            const otherParticipantId = getOtherParticipantId(conversation);
            const participantData = participantInfo[otherParticipantId];
            
            return (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onPress={() => router.push(`/(auth)/messages/${otherParticipantId}`)}
                participantName={participantData?.displayName || otherParticipantId}
                participantPhoto={participantData?.photoURL}
                unreadCount={calculateUnreadCount(conversation)}
              />
            );
          })
        ) : (
          <Card padding="md" style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color={theme.colors.textSecondary} style={styles.emptyIcon} />
            <Text style={styles.emptyStateText}>
              Vous n'avez pas encore de conversations.
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Les conversations démarreront après acceptation d'une candidature.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginTop: theme.spacing.lg,
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
}));