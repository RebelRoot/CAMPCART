import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import api from '../../lib/api';

const GRID_CATEGORIES = [
  { key: 'books', label: 'Books', icon: 'book-outline', color: '#3B82F6' },
  { key: 'electronics', label: 'Electronics', icon: 'phone-portrait-outline', color: '#8B5CF6' },
  { key: 'furniture', label: 'Furniture', icon: 'bed-outline', color: '#F59E0B' },
  { key: 'tutoring', label: 'Tutoring', icon: 'school-outline', color: '#10B981' },
  { key: 'food', label: 'Food', icon: 'fast-food-outline', color: '#EF4444' },
  { key: 'coding', label: 'Coding', icon: 'code-slash-outline', color: '#6366F1' },
  { key: 'design', label: 'Design', icon: 'color-palette-outline', color: '#EC4899' },
  { key: 'essentials', label: 'Essentials', icon: 'basket-outline', color: '#14B8A6' },
  { key: 'services', label: 'Services', icon: 'construct-outline', color: '#F97316' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', search],
    queryFn: () => api.get(`/gigs?search=${search}`).then(r => r.data),
    enabled: search.length > 2,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Explore</Text>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="What are you looking for?"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {search.length > 2 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultCard} onPress={() => router.push(`/gig/${item._id}`)}>
              <Image source={{ uri: item.cover }} style={styles.resultImage} />
              <View style={styles.resultBody}>
                <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.resultPrice}>₹{item.price}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: spacing.xl }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{isLoading ? 'Searching...' : 'No results found'}</Text>
            </View>
          }
        />
      ) : (
        /* Category Grid */
        <View style={styles.grid}>
          {GRID_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={styles.catCard}
              onPress={() => router.push(`/(tabs)?cat=${cat.key}` as any)}
            >
              <View style={[styles.catIcon, { backgroundColor: cat.color + '15' }]}>
                <Ionicons name={cat.icon as any} size={28} color={cat.color} />
              </View>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h1, color: colors.primary, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, marginBottom: spacing.md },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginHorizontal: spacing.xl, marginBottom: spacing['2xl'],
    backgroundColor: colors.surface, borderRadius: radii.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  input: { flex: 1, ...typography.body, color: colors.textPrimary },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, gap: spacing.md,
  },
  catCard: {
    width: '30%', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radii.lg, paddingVertical: spacing.xl, ...shadows.sm,
    marginBottom: spacing.sm,
  },
  catIcon: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  catLabel: { ...typography.caption, color: colors.textPrimary },
  resultCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm,
    ...shadows.sm,
  },
  resultImage: { width: 56, height: 56, borderRadius: radii.sm, backgroundColor: colors.border },
  resultBody: { flex: 1, marginLeft: spacing.md },
  resultTitle: { ...typography.bodyBold, color: colors.textPrimary },
  resultPrice: { ...typography.caption, color: colors.accent, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { ...typography.body, color: colors.textMuted },
});
