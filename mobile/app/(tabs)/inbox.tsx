import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function InboxScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/conversations').then(r => r.data),
    enabled: !!user,
    refetchInterval: 5000,
  });

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loginPrompt}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
          <Text style={styles.loginTitle}>Sign in to chat</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isUnread = (conv: any) => user.isSeller ? !conv.readBySeller : !conv.readByBuyer;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.convCard, isUnread(item) && styles.unreadCard]}
            onPress={() => router.push(`/message/${item.id}` as any)}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={colors.textMuted} />
            </View>
            <View style={styles.convBody}>
              <Text style={[styles.convName, isUnread(item) && styles.unreadText]}>
                {user.isSeller ? item.buyerId?.substring(0, 8) : item.sellerId?.substring(0, 8)}
              </Text>
              <Text style={styles.convPreview} numberOfLines={1}>{item.lastMessage || 'Start a conversation'}</Text>
            </View>
            <View style={styles.convMeta}>
              <Text style={styles.convTime}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
              {isUnread(item) && <View style={styles.unreadDot} />}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.xl }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>{isLoading ? 'Loading...' : 'No messages yet'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h1, color: colors.primary, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, marginBottom: spacing.lg },
  convCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  unreadCard: {},
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  convBody: { flex: 1, marginLeft: spacing.md },
  convName: { ...typography.bodyBold, color: colors.textPrimary },
  unreadText: { color: colors.accent },
  convPreview: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  convMeta: { alignItems: 'flex-end', gap: 6 },
  convTime: { ...typography.micro, color: colors.textMuted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 64 },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted },
  loginPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loginTitle: { ...typography.h2, color: colors.textPrimary },
  loginBtn: { backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: spacing['3xl'], paddingVertical: 14 },
  loginBtnText: { ...typography.bodyBold, color: colors.surface },
});
