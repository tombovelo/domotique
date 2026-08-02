import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useEffect, useState } from 'react';

import { GlassCard } from '@/components/glass-card';
import { useTheme } from '@/hooks/use-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useAuth } from '@/hooks/use-auth';
import { loadIp } from '@/services/api';

export default function MembreShareScreen() {
  const user = useAuth((s) => s.user);
  const theme = useTheme();
  const { rs, rf, width, pagePadding, contentMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const [serverIp, setServerIp] = useState('');

  useEffect(() => {
    loadIp().then(setServerIp);
  }, []);

  const qrValue = JSON.stringify({ ip: serverIp || '127.0.0.1', code: user?.codeAcces ?? '' });
  const qrSize = Math.min(width - pagePadding * 2 - rs(32) * 2, 240);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: theme.accentLight,
            top: -rs(70),
            right: -rs(60),
            width: rs(180),
            height: rs(180),
            borderRadius: rs(90),
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: theme.neonGreen,
            bottom: -rs(70),
            left: -rs(40),
            width: rs(160),
            height: rs(160),
            borderRadius: rs(80),
          },
        ]}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + rs(8), paddingHorizontal: pagePadding, paddingBottom: rs(8) }]}>
        <View style={{ width: rs(40) }} />
        <Text style={[styles.topTitle, { color: theme.text, fontSize: rf(17) }]}>
          Partager l&apos;accès
        </Text>
        <View style={{ width: rs(40) }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: pagePadding,
            paddingBottom: insets.bottom + rs(90),
            gap: rs(16),
            maxWidth: contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <GlassCard style={{ alignItems: 'center', paddingVertical: rs(24), gap: rs(16) }} glow glowColor={theme.accentLight}>
          <Text style={[styles.qrTitle, { color: theme.text, fontSize: rf(16) }]}>
            QR Code d&apos;accès
          </Text>
          <View style={[styles.qrFrame, { backgroundColor: '#FFFFFF', borderRadius: rs(18), padding: rs(16) }]}>
            <QRCode
              value={qrValue}
              size={qrSize}
              color={theme.bg}
              backgroundColor="#FFFFFF"
            />
          </View>
          <Text style={[styles.qrHint, { color: theme.textMuted, fontSize: rf(12) }]}>
            Scannez pour se connecter
          </Text>
        </GlassCard>

        <GlassCard style={{ gap: rs(8) }}>
          <View style={[styles.infoRow, { gap: rs(4) }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted, fontSize: rf(13) }]}>
              Utilisateur
            </Text>
            <Text style={[styles.infoValue, { color: theme.text, fontSize: rf(14) }]}>
              {user?.nom ?? '—'}
            </Text>
          </View>
          <View style={[styles.infoRow, { gap: rs(4) }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted, fontSize: rf(13) }]}>
              Code d&apos;accès
            </Text>
            <Text style={[styles.codeValue, { color: theme.accentLight, fontSize: rf(18), letterSpacing: rs(3) }]}>
              {user?.codeAcces ?? '—'}
            </Text>
          </View>
        </GlassCard>

        <Pressable
          style={[styles.doneButton, { backgroundColor: theme.accent, height: rs(50), borderRadius: rs(16) }]}
          onPress={() => router.replace('/(membre)/dashboard')}>
          <Text style={[styles.doneText, { fontSize: rf(15) }]}>Terminé</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orb: { position: 'absolute', opacity: 0.18 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center' },
  qrTitle: { fontWeight: '700' },
  qrFrame: { alignItems: 'center', justifyContent: 'center' },
  qrHint: { fontWeight: '500', textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontWeight: '500' },
  infoValue: { fontWeight: '600' },
  codeValue: { fontWeight: '700' },
  doneButton: { alignItems: 'center', justifyContent: 'center' },
  doneText: { color: '#FFFFFF', fontWeight: '700' },
});
