import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function GigDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const { data: gig, isLoading } = useQuery({
    queryKey: ['gig', id],
    queryFn: () => api.get(`/gigs/single/${id}`).then(r => r.data),
  });

  if (isLoading || !gig) {
    return <View style={styles.loading}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  const discount = gig.originalPrice ? Math.round((1 - gig.price / gig.originalPrice) * 100) : 0;

  const handleBuy = (method: string) => {
    if (!user) {
      Alert.alert('Login Required', 'You must sign in to make purchases', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login' as any) },
      ]);
      return;
    }
    Alert.alert('Order Placed!', `${method} order for "${gig.title}" — ₹${gig.price}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <Image source={{ uri: gig.cover }} style={styles.coverImage} />

        {/* Content */}
        <View style={styles.content}>
          {/* Category + Condition */}
          <View style={styles.tagRow}>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{gig.cat}</Text>
            </View>
            {gig.condition && (
              <View style={[styles.catBadge, { backgroundColor: colors.successLight }]}>
                <Text style={[styles.catText, { color: colors.success }]}>{gig.condition}</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{gig.title}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{gig.price}</Text>
            {gig.originalPrice > gig.price && (
              <>
                <Text style={styles.originalPrice}>₹{gig.originalPrice}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discount}% OFF</Text>
                </View>
              </>
            )}
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(i => (
              <Ionicons
                key={i}
                name={i <= Math.round(gig.totalStars / (gig.starNumber || 1)) ? 'star' : 'star-outline'}
                size={18}
                color="#F59E0B"
              />
            ))}
            <Text style={styles.ratingText}>({gig.starNumber || 0} reviews)</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.desc}>{gig.desc}</Text>
          </View>

          {/* Features */}
          {gig.features?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              {gig.features.map((f: string, i: number) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Location */}
          {gig.location?.hostel && (
            <View style={styles.locationCard}>
              <Ionicons name="location-outline" size={22} color={colors.accent} />
              <View>
                <Text style={styles.locationTitle}>Pickup Location</Text>
                <Text style={styles.locationText}>{gig.location.hostel}{gig.location.room ? `, Room ${gig.location.room}` : ''}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.messageBtn} onPress={() => Alert.alert('Coming Soon')}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.codBtn} onPress={() => handleBuy('COD')}>
          <Text style={styles.codBtnText}>Cash on Delivery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={() => handleBuy('Prepaid')}>
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textMuted },
  coverImage: { width, height: width * 0.75, backgroundColor: colors.border },
  content: { padding: spacing.xl },
  tagRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  catBadge: { backgroundColor: colors.accentLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.full },
  catText: { ...typography.micro, color: colors.accent, textTransform: 'capitalize' },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  price: { fontSize: 28, fontWeight: '700', color: colors.accent },
  originalPrice: { ...typography.body, color: colors.textMuted, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: colors.successLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  discountText: { ...typography.micro, color: colors.success },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: spacing.xl },
  ratingText: { ...typography.caption, color: colors.textMuted, marginLeft: 4 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.sm },
  desc: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  featureText: { ...typography.body, color: colors.textSecondary },
  locationCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.accentLight, borderRadius: radii.lg, padding: spacing.lg,
  },
  locationTitle: { ...typography.caption, color: colors.textSecondary },
  locationText: { ...typography.bodyBold, color: colors.accent },
  actionBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md, paddingBottom: 34,
    backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    ...shadows.lg,
  },
  messageBtn: {
    width: 48, height: 48, borderRadius: radii.md, borderWidth: 1, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  codBtn: {
    flex: 1, height: 48, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface,
  },
  codBtnText: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },
  buyBtn: {
    flex: 1, height: 48, borderRadius: radii.md, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  buyBtnText: { ...typography.bodyBold, color: colors.surface },
});
