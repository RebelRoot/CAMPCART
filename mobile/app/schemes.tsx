import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function SchemesScreen() {
  const [activeType, setActiveType] = useState('All');
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const { data: schemes, isLoading } = useQuery({
    queryKey: ['schemes'],
    queryFn: () => api.get('/schemes').then(r => r.data),
  });

  const getScore = (s: any) => {
    if (!user) return 0;
    let score = 0;
    const c = s.matchCriteria || {};
    if (c.state !== 'All' && c.state === user.state) score += 5;
    if (c.gender === user.gender) score += 3;
    if (s.tags?.includes('Bachelors Eligible')) score += 2;
    return score;
  };

  const filtered = (schemes || [])
    .filter((s: any) => {
      const matchType = activeType === 'All' || s.type === activeType;
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    })
    .sort((a: any, b: any) => getScore(b) - getScore(a));

  const renderCard = ({ item }: any) => {
    const score = getScore(item);
    const isExam = item.type === 'Exam';

    return (
      <TouchableOpacity style={[styles.card, isExam && styles.examCard, score > 0 && styles.matchedCard]} onPress={() => Linking.openURL(item.link)}>
        {score > 0 && (
          <View style={[styles.matchBadge, isExam && { backgroundColor: colors.exam }]}>
            <Text style={styles.matchText}>✨ For You</Text>
          </View>
        )}
        <View style={styles.cardHeader}>
          <View style={[styles.typePill, isExam ? { backgroundColor: colors.examLight } : { backgroundColor: colors.schemeLight }]}>
            <Text style={[styles.typeText, isExam ? { color: colors.exam } : { color: colors.scheme }]}>{item.type}</Text>
          </View>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardFocus}>{item.focus}</Text>

        {item.deadline && (
          <View style={styles.deadlineRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.warning} />
            <Text style={styles.deadlineText}>{item.deadline}</Text>
          </View>
        )}

        <View style={styles.rewardRow}>
          <Ionicons name={isExam ? 'trophy-outline' : 'wallet-outline'} size={16} color={colors.accent} />
          <Text style={styles.rewardText}>{item.reward}</Text>
        </View>

        <Text style={styles.applyHint}>Tap to apply →</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Type Toggles */}
      <View style={styles.toggleRow}>
        {['All', 'Scheme', 'Exam'].map(t => (
          <TouchableOpacity key={t} style={[styles.toggle, activeType === t && styles.toggleActive]} onPress={() => setActiveType(t)}>
            <Text style={[styles.toggleText, activeType === t && styles.toggleTextActive]}>
              {t === 'All' ? 'All' : t === 'Scheme' ? 'Scholarships' : 'Exams'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id || item._id)}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="school-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>{isLoading ? 'Loading...' : 'No results'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toggleRow: {
    flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md, backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  toggle: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderRadius: radii.md, backgroundColor: colors.background,
  },
  toggleActive: { backgroundColor: colors.accent },
  toggleText: { ...typography.caption, color: colors.textSecondary },
  toggleTextActive: { color: colors.surface, fontWeight: '700' },
  list: { padding: spacing.xl, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
    borderLeftWidth: 3, borderLeftColor: colors.scheme,
  },
  examCard: { borderLeftColor: colors.exam },
  matchedCard: { borderWidth: 1, borderColor: colors.success, borderLeftWidth: 3 },
  matchBadge: {
    position: 'absolute', top: -8, right: 16,
    backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: radii.full,
  },
  matchText: { ...typography.micro, color: colors.surface },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  typePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.full },
  typeText: { ...typography.micro },
  category: { ...typography.micro, color: colors.textMuted, textTransform: 'uppercase' },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  cardFocus: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  deadlineText: { ...typography.caption, color: colors.warning, fontWeight: '600' },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  rewardText: { ...typography.body, color: colors.textPrimary },
  applyHint: { ...typography.micro, color: colors.accent, textAlign: 'right', marginTop: spacing.xs },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted },
});
