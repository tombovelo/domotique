import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { GlassCard } from '@/components/glass-card';
import { useTheme } from '@/hooks/use-theme';
import { useThemeStore, type ThemeMode } from '@/hooks/use-theme-store';
import { useAuth } from '@/hooks/use-auth';
import { useResponsive } from '@/hooks/use-responsive';
import { getBaseUrl } from '@/services/api';

const MODES: { key: ThemeMode; label: string }[] = [
  { key: 'system', label: 'Système' },
  { key: 'light', label: 'Clair' },
  { key: 'dark', label: 'Sombre' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { mode, setMode } = useThemeStore();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { rs, rf, pagePadding, contentMaxWidth } = useResponsive();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
    ]);
  };

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
          Paramètres
        </Text>

        <GlassCard style={{ gap: rs(12) }} glow glowColor={theme.accentLight}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontSize: rf(16) }]}>
            Thème d&apos;affichage
          </Text>
          <View style={[styles.modeRow, { gap: rs(8) }]}>
            {MODES.map((m) => {
              const active = mode === m.key;
              return (
                <Pressable
                  key={m.key}
                  onPress={() => setMode(m.key)}
                  style={[
                    styles.modePill,
                    {
                      backgroundColor: active ? theme.accent : theme.surface,
                      borderColor: active ? theme.accentLight : theme.surfaceBorder,
                      paddingVertical: rs(10),
                      paddingHorizontal: rs(16),
                      borderRadius: rs(12),
                    },
                  ]}>
                  <Text
                    style={[
                      styles.modeLabel,
                      {
                        color: active ? '#fff' : theme.text,
                        fontSize: rf(13),
                      },
                    ]}>
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard style={{ gap: rs(8) }}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontSize: rf(16) }]}>
            Informations
          </Text>
          <View style={[styles.infoRow, { gap: rs(4) }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted, fontSize: rf(13) }]}>
              Application
            </Text>
            <Text style={[styles.infoValue, { color: theme.text, fontSize: rf(13) }]}>
              Tombovelo v1.0.0
            </Text>
          </View>
          <View style={[styles.infoRow, { gap: rs(4) }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted, fontSize: rf(13) }]}>
              Serveur
            </Text>
            <Text style={[styles.infoValue, { color: theme.text, fontSize: rf(13) }]}>
              {getBaseUrl().replace('http://', '').replace(':3000', '')}
            </Text>
          </View>
          <View style={[styles.infoRow, { gap: rs(4) }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted, fontSize: rf(13) }]}>
              Statut
            </Text>
            <Text style={[styles.infoValue, { color: theme.accentLight, fontSize: rf(13) }]}>
              Connecté
            </Text>
          </View>
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
            Déconnexion
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
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modePill: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    fontWeight: '600',
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
  logoutBtn: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontWeight: '700',
  },
});
