import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function SellScreen() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loginPrompt}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
          <Text style={styles.loginTitle}>Sign in to sell</Text>
          <Text style={styles.loginDesc}>Create an account to list your items on CampCart</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Listing</Text>
        <Text style={styles.subtitle}>What are you selling today?</Text>

        {/* Quick Sell Categories */}
        <View style={styles.quickGrid}>
          {[
            { icon: 'book-outline', label: 'Textbook', color: '#3B82F6' },
            { icon: 'phone-portrait-outline', label: 'Electronics', color: '#8B5CF6' },
            { icon: 'fast-food-outline', label: 'Food Item', color: '#EF4444' },
            { icon: 'school-outline', label: 'Service', color: '#10B981' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.quickCard} onPress={() => Alert.alert('Coming Soon', 'Sell flow will be implemented in Phase 2!')}>
              <View style={[styles.quickIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={32} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>📸 Selling Tips</Text>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.tipText}>Take clear photos in good lighting</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.tipText}>Set a fair price — check what others charge</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.tipText}>Write a detailed description with condition</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.tipText}>Respond to buyers quickly for faster sales</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h1, color: colors.primary, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  subtitle: { ...typography.body, color: colors.textSecondary, paddingHorizontal: spacing.xl, marginBottom: spacing['2xl'] },
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, gap: spacing.md,
  },
  quickCard: {
    width: '47%', backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.xl, alignItems: 'center', ...shadows.sm,
  },
  quickIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  quickLabel: { ...typography.bodyBold, color: colors.textPrimary },
  tipsCard: {
    margin: spacing.xl, backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.xl, ...shadows.sm,
  },
  tipsTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.lg },
  tip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  tipText: { ...typography.body, color: colors.textSecondary, flex: 1 },
  loginPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['3xl'], gap: spacing.md },
  loginTitle: { ...typography.h2, color: colors.textPrimary },
  loginDesc: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  loginBtn: {
    backgroundColor: colors.accent, borderRadius: radii.md,
    paddingHorizontal: spacing['3xl'], paddingVertical: 14, marginTop: spacing.md,
  },
  loginBtnText: { ...typography.bodyBold, color: colors.surface },
});
