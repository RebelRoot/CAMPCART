import React from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, typography, spacing, radii } from '../../lib/theme';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function MessageScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = React.useState('');

  const { data: messages } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => api.get(`/messages/${id}`).then(r => r.data),
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (desc: string) => api.post('/messages', { conversationId: id, desc }),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
    },
  });

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate(text.trim());
  };

  const renderMessage = ({ item }: any) => {
    const isMine = item.userId === user?._id;
    return (
      <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.bubbleText, isMine && { color: colors.surface }]}>{item.desc}</Text>
        <Text style={[styles.time, isMine && { color: 'rgba(255,255,255,0.6)' }]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        inverted={false}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, !text.trim() && styles.sendDisabled]} onPress={handleSend} disabled={!text.trim()}>
          <Ionicons name="send" size={20} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.xl, paddingBottom: spacing.md },
  bubble: {
    maxWidth: '78%', padding: spacing.md, borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  myBubble: {
    backgroundColor: colors.accent, alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: colors.surface, alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  bubbleText: { ...typography.body, color: colors.textPrimary },
  time: { ...typography.micro, color: colors.textMuted, marginTop: 4, textAlign: 'right' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md, paddingBottom: 34,
    backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
  input: {
    flex: 1, ...typography.body, color: colors.textPrimary,
    backgroundColor: colors.background, borderRadius: radii.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
