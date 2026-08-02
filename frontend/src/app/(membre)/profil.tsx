import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';

import { GlassCard } from '@/components/glass-card';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { useResponsive } from '@/hooks/use-responsive';
import { authService } from '@/services/auth';

export default function MembreProfilScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { rs, rf, pagePadding, contentMaxWidth } = useResponsive();

  const [newCode, setNewCode] = useState(user?.codeAcces ?? '');
  const [saving, setSaving] = useState(false);

  const handleSaveCode = async () => {
    if (!user || !newCode.trim() || newCode === user.codeAcces) return;
    setSaving(true);
    try {
      await authService.changeCode(newCode.trim().toUpperCase());
      Toast.show({ type: 'success', text1: 'Code modifié', text2: 'Reconnectez-vous avec votre nouveau code' });
      await logout();
      router.replace('/');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message || 'Impossible de modifier le code' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text, textAlign: 'center', marginTop: 100 }}>
          Utilisateur non connecté
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + rs(12),
            paddingBottom: insets.bottom + rs(90),
            paddingHorizontal: pagePadding,
            gap: rs(12),
            maxWidth: contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text, fontSize: rf(24) }]}>
          Profil
        </Text>

        <GlassCard style={{ gap: rs(12) }} glow glowColor={theme.accentLight}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontSize: rf(16) }]}>
            Informations personnelles
          </Text>
          <View style={[styles.infoRow, { gap: rs(4) }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted, fontSize: rf(13) }]}>
              Nom
            </Text>
            <Text style={[styles.infoValue, { color: theme.text, fontSize: rf(13) }]}>
              {user.nom}
            </Text>
          </View>
          <View style={[styles.infoRow, { gap: rs(4) }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted, fontSize: rf(13) }]}>
              Code d'accès
            </Text>
            <Text style={[styles.infoValue, { color: theme.text, fontSize: rf(13) }]}>
              {user.codeAcces}
            </Text>
          </View>
          <View style={[styles.infoRow, { gap: rs(4) }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted, fontSize: rf(13) }]}>
              Rôle
            </Text>
            <Text style={[styles.infoValue, { color: theme.accentLight, fontSize: rf(13) }]}>
              {user.role === 'ADMIN' ? 'Administrateur' : 'Membre'}
            </Text>
          </View>
          <View style={[styles.infoRow, { gap: rs(4) }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted, fontSize: rf(13) }]}>
              Membre depuis
            </Text>
            <Text style={[styles.infoValue, { color: theme.text, fontSize: rf(13) }]}>
              {user.dateCreation}
            </Text>
          </View>
          {user.dateExpiration && (
            <View style={[styles.infoRow, { gap: rs(4) }]}>
              <Text style={[styles.infoLabel, { color: theme.textMuted, fontSize: rf(13) }]}>
                Expire le
              </Text>
              <Text style={[styles.infoValue, { color: theme.danger, fontSize: rf(13) }]}>
                {user.dateExpiration}
              </Text>
            </View>
          )}
        </GlassCard>

        <GlassCard style={{ gap: rs(12) }}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontSize: rf(16) }]}>
            Modifier le code d'accès
          </Text>
          <Text style={[styles.sectionSub, { color: theme.textMuted, fontSize: rf(12) }]}>
            Votre nouveau code doit contenir entre 4 et 10 caractères
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.bg,
                borderColor: theme.surfaceBorder,
                color: theme.text,
                height: rs(48),
                borderRadius: rs(14),
                paddingHorizontal: rs(16),
                fontSize: rf(18),
              },
            ]}
            placeholder="Nouveau code d'accès"
            placeholderTextColor={theme.textMuted}
            value={newCode}
            onChangeText={(t) => setNewCode(t.toUpperCase())}
            autoCapitalize="characters"
            maxLength={10}
          />
          <Pressable
            style={[
              styles.saveButton,
              { backgroundColor: theme.accent, height: rs(50), borderRadius: rs(16), opacity: newCode.trim() && newCode !== user.codeAcces ? 1 : 0.5 },
            ]}
            onPress={handleSaveCode}
            disabled={saving || !newCode.trim() || newCode === user.codeAcces}>
            <Text style={[styles.saveText, { fontSize: rf(15) }]}>
              {saving ? 'Enregistrement...' : 'Valider'}
            </Text>
          </Pressable>
        </GlassCard>

        <Pressable
          onPress={handleLogout}
          style={[
            styles.logoutBtn,
            {
              backgroundColor: 'rgba(255,82,82,0.1)',
              borderColor: 'rgba(255,82,82,0.3)',
              paddingVertical: rs(12),
              borderRadius: rs(12),
            },
          ]}>
          <Text style={[styles.logoutText, { color: theme.danger, fontSize: rf(15) }]}>
            Se déconnecter
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {},
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  sectionSub: {
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontWeight: '500',
  },
  infoValue: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  logoutBtn: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontWeight: '700',
  },
});