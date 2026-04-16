import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '../../lib/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const [form, setForm] = useState({ username: '', email: '', password: '', college: '', state: '', gender: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password || !form.college) {
      Alert.alert('Missing Fields', 'Fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      router.dismissAll();
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const GENDERS = ['male', 'female', 'other'];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.heroSection}>
          <Text style={styles.title}>Join CampCart</Text>
          <Text style={styles.subtitle}>Create your account and start trading on campus</Text>
        </View>

        <View style={styles.form}>
          {[
            { key: 'username', label: 'Username', icon: 'person-outline', placeholder: 'your_username' },
            { key: 'email', label: 'Email', icon: 'mail-outline', placeholder: 'you@college.edu', keyboard: 'email-address' },
            { key: 'password', label: 'Password', icon: 'lock-closed-outline', placeholder: '••••••••', secure: true },
            { key: 'college', label: 'College / University', icon: 'school-outline', placeholder: 'IIT Delhi' },
            { key: 'state', label: 'State (Optional)', icon: 'location-outline', placeholder: 'Maharashtra' },
          ].map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={styles.inputBox}>
                <Ionicons name={field.icon as any} size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textMuted}
                  value={(form as any)[field.key]}
                  onChangeText={(val) => update(field.key, val)}
                  secureTextEntry={field.secure}
                  autoCapitalize={field.key === 'email' || field.key === 'username' ? 'none' : 'words'}
                  keyboardType={(field.keyboard as any) || 'default'}
                />
              </View>
            </View>
          ))}

          {/* Gender Select */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender (Optional)</Text>
            <View style={styles.genderRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderPill, form.gender === g && styles.genderActive]}
                  onPress={() => update('gender', g)}
                >
                  <Text style={[styles.genderText, form.gender === g && styles.genderTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={[styles.registerBtn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.registerBtnText}>{loading ? 'Creating...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => { router.back(); router.push('/(auth)/login' as any); }}>
            <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginBold}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing['4xl'] },
  heroSection: { paddingTop: spacing['2xl'], marginBottom: spacing['2xl'] },
  title: { ...typography.h1, color: colors.primary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  form: { gap: spacing.lg },
  inputGroup: { gap: spacing.sm },
  label: { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radii.md,
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  input: { flex: 1, ...typography.body, color: colors.textPrimary },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  genderPill: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border,
  },
  genderActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  genderText: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' },
  genderTextActive: { color: colors.surface },
  registerBtn: {
    backgroundColor: colors.accent, borderRadius: radii.md,
    paddingVertical: 16, alignItems: 'center', marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.6 },
  registerBtnText: { ...typography.bodyBold, color: colors.surface },
  loginLink: { alignItems: 'center', marginTop: spacing.md },
  loginLinkText: { ...typography.body, color: colors.textSecondary },
  loginBold: { color: colors.accent, fontWeight: '600' },
});
