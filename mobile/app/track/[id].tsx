import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import api from '../../lib/api';

const STATUS_STEPS = [
  { key: 'pending_payment', label: 'Payment Pending', icon: 'wallet-outline' },
  { key: 'pending_confirmation', label: 'Order Placed', icon: 'checkmark-circle-outline' },
  { key: 'processing', label: 'Processing', icon: 'time-outline' },
  { key: 'shipped', label: 'Out for Delivery', icon: 'bicycle-outline' },
  { key: 'completed', label: 'Delivered', icon: 'home-outline' },
];

export default function TrackScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
  });

  if (isLoading || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading tracking info...</Text>
      </View>
    );
  }

  const currentStepObj = STATUS_STEPS.find(s => s.key === order.status) || STATUS_STEPS[0];
  const currentIndex = STATUS_STEPS.findIndex(s => s.key === order.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Overview Card */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View>
            <Text style={styles.orderId}>Order #{order._id.substring(0, 8).toUpperCase()}</Text>
            <Text style={styles.orderTitle} numberOfLines={1}>{order.title}</Text>
          </View>
          <Text style={styles.price}>₹{order.price}</Text>
        </View>
        
        {order.deliveryTimeline && (
          <View style={styles.timelineBox}>
            <Ionicons name="time" size={16} color={colors.accent} />
            <Text style={styles.timelineText}>Est. Delivery: {order.deliveryTimeline}</Text>
          </View>
        )}
      </View>

      {/* Tracker Timeline */}
      <View style={styles.trackerCard}>
        <Text style={styles.trackerTitle}>Delivery Status</Text>
        
        <View style={styles.timeline}>
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isLast = index === STATUS_STEPS.length - 1;

            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepVisuals}>
                  <View style={[styles.stepCircle, isCompleted && styles.stepCircleActive]}>
                    <Ionicons name={step.icon as any} size={16} color={isCompleted ? colors.surface : colors.textMuted} />
                  </View>
                  {!isLast && <View style={[styles.stepLine, index < currentIndex && styles.stepLineActive]} />}
                </View>
                
                <View style={styles.stepContent}>
                  <Text style={[styles.stepLabel, isCurrent && styles.stepLabelCurrent, isCompleted && !isCurrent && styles.stepLabelCompleted]}>
                    {step.label}
                  </Text>
                  {isCurrent && <Text style={styles.stepSubtext}>Your order is currently {step.label.toLowerCase()}</Text>}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsBox}>
        {order.billGenerated && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/bill/${order._id}` as any)}>
            <Ionicons name="document-text-outline" size={20} color={colors.accent} />
            <Text style={styles.actionText}>View Invoice</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.actionBtnContact} onPress={() => router.push(`/message/${order.sellerId}` as any)}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.surface} />
          <Text style={styles.actionTextContact}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textMuted },
  overviewCard: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.xl, marginBottom: spacing.lg, ...shadows.sm,
  },
  overviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  orderId: { ...typography.caption, color: colors.textSecondary, marginBottom: 4 },
  orderTitle: { ...typography.h3, color: colors.textPrimary, maxWidth: '80%' },
  price: { ...typography.h2, color: colors.accent },
  timelineBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.accentLight, padding: spacing.md, borderRadius: radii.md,
  },
  timelineText: { ...typography.bodyBold, color: colors.accent },
  trackerCard: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.xl, marginBottom: spacing.lg, ...shadows.sm,
  },
  trackerTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xl },
  timeline: { paddingLeft: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepVisuals: { alignItems: 'center', width: 32 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border,
  },
  stepCircleActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepLine: { width: 2, height: 40, backgroundColor: colors.border, marginVertical: 4 },
  stepLineActive: { backgroundColor: colors.accent },
  stepContent: { flex: 1, marginLeft: spacing.lg, paddingTop: 4, paddingBottom: 24 },
  stepLabel: { ...typography.body, color: colors.textMuted },
  stepLabelCompleted: { color: colors.textPrimary, fontWeight: '600' },
  stepLabelCurrent: { color: colors.accent, fontWeight: '700' },
  stepSubtext: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  actionsBox: { gap: spacing.md },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border,
  },
  actionText: { ...typography.bodyBold, color: colors.accent },
  actionBtnContact: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.accent, padding: spacing.lg, borderRadius: radii.md,
  },
  actionTextContact: { ...typography.bodyBold, color: colors.surface },
});
