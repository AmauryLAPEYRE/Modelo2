// src/components/messages/ConversationItem.tsx
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { ConversationModel } from '../../domain/models/MessageModel';
import { formatDate } from '../../utils/formatters';
import { createThemedStyles, useTheme } from '../../utils/theme';
import { Card } from '../ui';

interface ConversationItemProps {
  conversation: ConversationModel;
  onPress?: () => void;
  participantName?: string;
  participantPhoto?: string;
  unreadCount?: number;
}

export const ConversationItem = ({ 
  conversation, 
  onPress, 
  participantName = '',
  participantPhoto,
  unreadCount = 0
}: ConversationItemProps) => {
  const theme = useTheme();
  const styles = useStyles();
  
  const getPreviewText = (): string => {
    if (!conversation.lastMessage) {
      return 'Aucun message';
    }
    return conversation.lastMessage.content;
  };
  
  const getTimestamp = (): string => {
    if (!conversation.lastMessage) {
      return formatDate(conversation.createdAt);
    }
    return formatDate(conversation.lastMessage.createdAt);
  };
  
  return (
    <Card
      variant="elevated"
      style={styles.card}
      padding="md"
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {participantPhoto ? (
              <Image source={{ uri: participantPhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <FontAwesome name="user" size={20} color={theme.colors.primary} />
              </View>
            )}
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{participantName}</Text>
              {conversation.serviceId && (
                <Text style={styles.serviceId}>Prestation #{conversation.serviceId.slice(-6)}</Text>
              )}
            </View>
          </View>
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>{getTimestamp()}</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
        
        <Text 
          style={[styles.preview, unreadCount > 0 && styles.unreadPreview]} 
          numberOfLines={1}
        >
          {getPreviewText()}
        </Text>
      </View>
      
      <View style={styles.arrow}>
        <FontAwesome name="chevron-right" size={14} color={theme.colors.textSecondary} />
      </View>
    </Card>
  );
};

const useStyles = createThemedStyles((theme) => ({
  card: {
    marginBottom: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  },
  serviceId: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  timestampContainer: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  unreadText: {
    color: 'white',
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  preview: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  unreadPreview: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  arrow: {
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
}));