import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'apps-outline' },
  { key: 'books', label: 'Books', icon: 'book-outline' },
  { key: 'electronics', label: 'Electronics', icon: 'phone-portrait-outline' },
  { key: 'food', label: 'Food', icon: 'fast-food-outline' },
  { key: 'tutoring', label: 'Tutoring', icon: 'school-outline' },
  { key: 'furniture', label: 'Furniture', icon: 'bed-outline' },
  { key: 'coding', label: 'Coding', icon: 'code-slash-outline' },
  { key: 'essentials', label: 'Essentials', icon: 'basket-outline' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCat, setSelectedCat] = React.useState('all');

  const { data: gigs, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['gigs', selectedCat],
    queryFn: () => {
      const params = selectedCat === 'all' ? '' : `?cat=${selectedCat}`;
      return api.get(`/gigs${params}`).then(r => r.data);
    },
  });

  const renderGigCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/gig/${item._id}`)}
    >
      <Image source={{ uri: item.cover }} style={styles.cardImage} />
      {item.condition && item.condition !== 'good' && (
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{item.condition}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price}</Text>
          {item.originalPrice && item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
          )}
        </View>
        <View style={styles.sellerRow}>
          <Ionicons name="person-circle-outline" size={16} color={colors.textMuted} />
          <Text style={styles.sellerName}>{item.cat}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>CampCart</Text>
          {user && <Text style={styles.greeting}>Hey, {user.username} 👋</Text>}
        </View>
        <TouchableOpacity style={styles.notifButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(tabs)/explore')}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder}>Search books, food, tutoring...</Text>
      </TouchableOpacity>

      {/* Category Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContainer}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.catPill, selectedCat === cat.key && styles.catPillActive]}
            onPress={() => setSelectedCat(cat.key)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCat === cat.key ? colors.surface : colors.textSecondary}
            />
            <Text style={[styles.catLabel, selectedCat === cat.key && styles.catLabelActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed */}
      <FlatList
        data={gigs}
        keyExtractor={(item) => item._id}
        renderItem={renderGigCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>{isLoading ? 'Loading...' : 'No listings yet'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  logo: { ...typography.h1, color: colors.primary },
  greeting: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  notifButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    ...shadows.sm,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginHorizontal: spacing.xl, marginBottom: spacing.md,
    backgroundColor: colors.surface, borderRadius: radii.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  searchPlaceholder: { ...typography.body, color: colors.textMuted },
  catScroll: { maxHeight: 48, marginBottom: spacing.md },
  catContainer: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radii.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  catPillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  catLabel: { ...typography.caption, color: colors.textSecondary },
  catLabelActive: { color: colors.surface },
  feed: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  row: { gap: spacing.md, marginBottom: spacing.md },
  card: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg,
    overflow: 'hidden', ...shadows.md,
  },
  cardImage: { width: '100%', height: 140, backgroundColor: colors.border },
  conditionBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  conditionText: { ...typography.micro, color: colors.surface, textTransform: 'capitalize' },
  cardBody: { padding: spacing.md },
  cardTitle: { ...typography.caption, color: colors.textPrimary, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  price: { ...typography.bodyBold, color: colors.accent },
  originalPrice: { ...typography.caption, color: colors.textMuted, textDecorationLine: 'line-through' },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sellerName: { ...typography.micro, color: colors.textMuted, textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted },
});
