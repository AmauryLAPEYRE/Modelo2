// src/components/messages/MessageItem.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { MessageModel } from '../../domain/models/MessageModel';
import { formatDate } from '../../utils/formatters';
import { createThemedStyles, useTheme } from '../../utils/theme';

interface MessageItemProps {
  message: MessageModel;
  isOwnMessage: boolean;
  showTimestamp?: boolean;
}

export const MessageItem = ({ message, isOwnMessage, showTimestamp = true }: MessageItemProps) => {
  const theme = useTheme();
  const styles = useStyles();
  
  return (
    <View style={[styles.container, isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer]}>
      <View style={[styles.bubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, isOwnMessage ? styles.ownMessageText : styles.otherMessageText]}>
          {message.content}
        </Text>
        {showTimestamp && (
          <Text style={[styles.timestamp, isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp]}>
            {formatDate(message.createdAt, false, 'HH:mm')}
          </Text>
        )}
      </View>
      {!message.read && !isOwnMessage && (
        <View style={styles.unreadDot} />
      )}
    </View>
  );
};

const useStyles = createThemedStyles((theme) => ({
  container: {
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  ownBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.borderRadius.sm,
  },
  otherBubble: {
    backgroundColor: theme.colors.border,
    borderBottomLeftRadius: theme.borderRadius.sm,
  },
  messageText: {
    fontSize: theme.typography.fontSizes.md,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: theme.typography.fontSizes.xs,
    marginTop: theme.spacing.xs,
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: theme.colors.textSecondary,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: theme.spacing.md,
  },
}));