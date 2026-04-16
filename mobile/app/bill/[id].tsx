import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import api from '../../lib/api';

export default function BillScreen() {
  const { id } = useLocalSearchParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
  });

  if (isLoading || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading invoice...</Text>
      </View>
    );
  }

  const { billData } = order;

  // Fallback if billData is missing
  const bill = billData || {
    billNumber: `INV-${order._id.substring(0, 6).toUpperCase()}`,
    date: new Date(order.createdAt).toLocaleDateString(),
    itemTotal: order.price,
    tax: Math.round(order.price * 0.05), // Fake 5% tax if missing
    total: order.price + Math.round(order.price * 0.05),
    sellerName: 'CampCart Seller',
    buyerName: 'Customer',
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice ${bill.billNumber} for ${order.title}\nTotal: ₹${bill.total}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
          <Ionicons name="receipt" size={32} color={colors.accent} />
          <Text style={styles.brandName}>CampCart</Text>
          <Text style={styles.receiptTitle}>TAX INVOICE</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.infoLabel}>Invoice No</Text>
            <Text style={styles.infoValue}>{bill.billNumber}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{bill.date}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.infoLabel}>Billed To</Text>
            <Text style={styles.infoValue}>{bill.buyerName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.infoLabel}>Sold By</Text>
            <Text style={styles.infoValue}>{bill.sellerName}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Item Details</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemName} numberOfLines={2}>{order.title}</Text>
          <Text style={styles.itemPrice}>₹{bill.itemTotal}</Text>
        </View>

        {order.paymentMethod === 'cod' && order.codFee > 0 && (
          <View style={[styles.itemRow, { marginTop: spacing.sm }]}>
            <Text style={styles.itemName}>COD Handling Fee</Text>
            <Text style={styles.itemPrice}>₹{order.codFee}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{bill.itemTotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (5%)</Text>
          <Text style={styles.summaryValue}>₹{bill.tax}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{bill.total}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for trading on campus!</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Ionicons name="share-outline" size={20} color={colors.surface} />
        <Text style={styles.shareText}>Download & Share</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textMuted },
  receiptCard: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.xl, marginBottom: spacing.lg, ...shadows.md,
  },
  receiptHeader: { alignItems: 'center', marginBottom: spacing.lg },
  brandName: { ...typography.h2, color: colors.primary, marginTop: spacing.sm },
  receiptTitle: { ...typography.caption, color: colors.textMuted, marginTop: 4, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg, borderStyle: 'dashed' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  infoLabel: { ...typography.micro, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { ...typography.bodyBold, color: colors.textPrimary },
  sectionTitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md, textTransform: 'uppercase' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { ...typography.body, color: colors.textPrimary, flex: 1, marginRight: spacing.md },
  itemPrice: { ...typography.bodyBold, color: colors.textPrimary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { ...typography.body, color: colors.textSecondary },
  summaryValue: { ...typography.bodyBold, color: colors.textPrimary },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 2, borderTopColor: colors.border,
  },
  totalLabel: { ...typography.h3, color: colors.textPrimary },
  totalValue: { ...typography.h1, color: colors.accent },
  footer: { marginTop: spacing['2xl'], alignItems: 'center' },
  footerText: { ...typography.caption, color: colors.textMuted, fontStyle: 'italic' },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.accent, padding: spacing.lg, borderRadius: radii.md,
  },
  shareText: { ...typography.bodyBold, color: colors.surface },
});
