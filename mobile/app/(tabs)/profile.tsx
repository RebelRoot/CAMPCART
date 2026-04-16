import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import { useAuth } from '../../contexts/AuthContext';

const MENU_ITEMS = [
  { icon: 'receipt-outline', label: 'My Orders', route: '/orders', color: colors.accent },
  { icon: 'wallet-outline', label: 'Camp Cash Wallet', route: '/orders', color: '#10B981' },
  { icon: 'school-outline', label: 'Schemes & Exams', route: '/schemes', color: colors.success },
  { icon: 'storefront-outline', label: 'My Listings', route: '/orders', color: '#F59E0B' },
  { icon: 'create-outline', label: 'Edit Profile', route: '/orders', color: '#8B5CF6' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loginPrompt}>
          <View style={styles.bigAvatar}>
            <Ionicons name="person-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={styles.loginTitle}>Welcome to CampCart</Text>
          <Text style={styles.loginDesc}>Sign in to access your profile, orders, and messages</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/register' as any)}>
            <Text style={styles.secondaryBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            {user.img ? (
              <Image source={{ uri: user.img }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarInitial}>{user.username[0].toUpperCase()}</Text>
            )}
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.college}>{user.college}</Text>
          {user.state && (
            <View style={styles.stateBadge}>
              <Ionicons name="location-outline" size={14} color={colors.accent} />
              <Text style={styles.stateText}>{user.state}</Text>
            </View>
          )}
        </View>

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIconBg}>
              <Ionicons name="wallet" size={24} color="#10B981" />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Camp Cash</Text>
              <Text style={styles.walletBalance}>₹{user.campCash || 0}</Text>
            </View>
            <TouchableOpacity style={styles.addMoneyBtn}>
              <Text style={styles.addMoneyText}>Add Money</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletActions}>
            <TouchableOpacity style={styles.walletAction}>
              <Ionicons name="arrow-up-outline" size={20} color={colors.accent} />
              <Text style={styles.walletActionText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.walletAction}>
              <Ionicons name="arrow-down-outline" size={20} color={colors.success} />
              <Text style={styles.walletActionText}>Receive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.walletAction}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.walletActionText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Sales</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>⭐ {user.isSeller ? '4.8' : '—'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.isSeller ? 'Seller' : 'Buyer'}</Text>
            <Text style={styles.statLabel}>Role</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={() => router.push(item.route as any)}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CampCart v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingTop: spacing['3xl'], paddingBottom: spacing.xl },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accentLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
    borderWidth: 3, borderColor: colors.accent,
  },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  avatarInitial: { fontSize: 36, fontWeight: '700', color: colors.accent },
  username: { ...typography.h2, color: colors.textPrimary },
  college: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  stateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm,
    backgroundColor: colors.accentLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.full,
  },
  stateText: { ...typography.caption, color: colors.accent },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: spacing.xl, marginVertical: spacing.xl,
    backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.xl,
    ...shadows.sm,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.h3, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: colors.border },
  menu: {
    marginHorizontal: spacing.xl, backgroundColor: colors.surface,
    borderRadius: radii.lg, ...shadows.sm, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { ...typography.bodyBold, color: colors.textPrimary, flex: 1, marginLeft: spacing.md },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginHorizontal: spacing.xl, marginTop: spacing['2xl'], padding: spacing.lg,
    backgroundColor: colors.errorLight, borderRadius: radii.lg,
  },
  logoutText: { ...typography.bodyBold, color: colors.error },
  version: { ...typography.micro, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl, marginBottom: spacing['4xl'] },
  walletCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#10B98115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  walletLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  walletBalance: {
    ...typography.h2,
    color: '#10B981',
    fontWeight: '700',
  },
  addMoneyBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  addMoneyText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  walletDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  walletAction: {
    alignItems: 'center',
    gap: 4,
  },
  walletActionText: {
    ...typography.micro,
    color: colors.textSecondary,
  },
  loginPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['3xl'], gap: spacing.md },
  bigAvatar: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: colors.accentLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  loginTitle: { ...typography.h2, color: colors.textPrimary },
  loginDesc: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  primaryBtn: { backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: spacing['3xl'], paddingVertical: 14, marginTop: spacing.md, width: '100%', alignItems: 'center' },
  primaryBtnText: { ...typography.bodyBold, color: colors.surface },
  secondaryBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing['3xl'], paddingVertical: 14, width: '100%', alignItems: 'center' },
  secondaryBtnText: { ...typography.bodyBold, color: colors.textPrimary },
});
