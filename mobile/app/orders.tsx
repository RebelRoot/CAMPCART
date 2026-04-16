import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending_payment: { color: '#F59E0B', bg: '#FFFBEB', label: 'Pending Payment' },
  pending_confirmation: { color: '#6366F1', bg: '#EEF2FF', label: 'Awaiting Confirm' },
  processing: { color: '#3B82F6', bg: '#EFF6FF', label: 'Processing' },
  shipped: { color: '#8B5CF6', bg: '#F5F3FF', label: 'Shipped' },
  completed: { color: '#10B981', bg: '#ECFDF5', label: 'Completed' },
  cancelled: { color: '#EF4444', bg: '#FEF2F2', label: 'Cancelled' },
};

export default function OrdersScreen() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then(r => r.data),
    enabled: !!user,
  });

  const renderOrder = ({ item }: any) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending_payment;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.orderTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.method}>{item.paymentMethod?.toUpperCase()}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>{isLoading ? 'Loading...' : 'No orders yet'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.xl, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  orderTitle: { ...typography.bodyBold, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  statusText: { ...typography.micro },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  price: { ...typography.bodyBold, color: colors.accent },
  date: { ...typography.caption, color: colors.textMuted },
  method: { ...typography.micro, color: colors.textSecondary },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted },
});
