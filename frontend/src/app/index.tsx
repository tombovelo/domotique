import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';

import { GlassCard } from '@/components/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';
import { loadIp, saveIp } from '@/services/api';

export default function LoginScreen() {
  const theme = useTheme();
  const { rs, rf, isSmall, height, contentMaxWidth, pagePadding } = useResponsive();
  const login = useAuth((s) => s.login);
  const { scannedCode, scannedIp } = useLocalSearchParams<{ scannedCode?: string; scannedIp?: string }>();
  const [ip, setIp] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const autoLoginDone = useRef(false);
  const isCompact = isSmall || height < 700;

  useEffect(() => {
    loadIp().then((saved) => {
      if (saved && saved !== '127.0.0.1' && !scannedIp) setIp(saved);
    });
  }, [scannedIp]);

  useEffect(() => {
    if (scannedCode) setCode(scannedCode);
    if (scannedIp) setIp(scannedIp);
  }, [scannedCode, scannedIp]);

  const handleLogin = async () => {
    if (!ip.trim()) {
      setError("Entrez l'adresse IP du serveur");
      return;
    }
    if (!code.trim()) {
      setError("Entrez votre code d'accès");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await saveIp(ip.trim());
      const ok = await login(code.trim());
      if (ok) {
        const { user } = useAuth.getState();
        if (user?.role === 'ADMIN') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(membre)/dashboard');
        }
      } else {
        setError('Code invalide ou serveur injoignable');
      }
    } catch (e: any) {
      setError(e?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!scannedCode || autoLoginDone.current || loading) return;
    if (!ip.trim() || !code.trim()) return;

    autoLoginDone.current = true;
    void handleLogin();
  }, [scannedCode, code, ip, loading]);

  const QrScanIcon = () => (
    <View style={styles.scanBadge}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="2" width="7" height="7" rx="1.6" fill="#BFBFBF" />
        <Rect x="3.8" y="3.8" width="3.4" height="3.4" rx="0.8" fill="#2D2B31" />
        <Rect x="15" y="2" width="7" height="7" rx="1.6" fill="#BFBFBF" />
        <Rect x="16.8" y="3.8" width="3.4" height="3.4" rx="0.8" fill="#2D2B31" />
        <Rect x="2" y="15" width="7" height="7" rx="1.6" fill="#BFBFBF" />
        <Rect x="3.8" y="16.8" width="3.4" height="3.4" rx="0.8" fill="#2D2B31" />
        <Rect x="11" y="2" width="2" height="2" rx="0.4" fill="#BFBFBF" />
        <Rect x="12.5" y="5" width="2" height="2" rx="0.4" fill="#BFBFBF" />
        <Rect x="11" y="8" width="2" height="2" rx="0.4" fill="#BFBFBF" />
        <Rect x="13.5" y="10.5" width="2" height="2" rx="0.4" fill="#BFBFBF" />
        <Rect x="11" y="13" width="2" height="2" rx="0.4" fill="#BFBFBF" />
        <Rect x="13.5" y="15.5" width="2" height="2" rx="0.4" fill="#BFBFBF" />
        <Rect x="10.5" y="18" width="2" height="2" rx="0.4" fill="#BFBFBF" />
        <Rect x="18" y="12" width="2" height="2" rx="0.4" fill="#BFBFBF" />
        <Rect x="15.5" y="18" width="2" height="2" rx="0.4" fill="#BFBFBF" />
      </Svg>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: theme.accentLight,
            top: -rs(isCompact ? 26 : 44),
            left: -rs(isCompact ? 34 : 54),
            width: rs(isCompact ? 110 : 190),
            height: rs(isCompact ? 110 : 190),
            borderRadius: rs(isCompact ? 55 : 95),
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: theme.accent,
            top: rs(isCompact ? 58 : 74),
            right: -rs(isCompact ? 42 : 72),
            width: rs(isCompact ? 140 : 240),
            height: rs(isCompact ? 140 : 240),
            borderRadius: rs(isCompact ? 70 : 120),
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: theme.neonGreen,
            bottom: -rs(isCompact ? 44 : 72),
            left: '18%',
            width: rs(isCompact ? 130 : 220),
            height: rs(isCompact ? 130 : 220),
            borderRadius: rs(isCompact ? 65 : 110),
          },
        ]}
      />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: pagePadding,
                paddingVertical: rs(isCompact ? 10 : 18),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={[styles.inner, { width: '100%', maxWidth: contentMaxWidth }]}>
              <Animated.View entering={FadeInDown.duration(700).delay(120).springify()}>
                <GlassCard
                  intensity="strong"
                  style={[
                    styles.formCard,
                    {
                      borderRadius: rs(isCompact ? 24 : 30),
                      padding: rs(isCompact ? 14 : 18),
                      gap: rs(isCompact ? 10 : 14),
                    },
                  ]}>
                  <View style={styles.formHead}>
                    <View style={{ flex: 1, gap: rs(4) }}>
                      <Text style={[styles.formTitle, { color: theme.text, fontSize: rf(16) }]}>
                        Accès au serveur
                      </Text>
                      <Text style={[styles.formHint, { color: theme.textMuted, fontSize: rf(12) }]}>
                        Appuyer sur le bouton en bas pour scanner le QR code et remplir les champs.
                      </Text>
                    </View>
                  </View>

                  <View style={{ gap: rs(8) }}>
                    <Text style={[styles.codeLabel, { color: theme.textSecondary, fontSize: rf(13) }]}>
                      Adresse IP du serveur
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.bg,
                          borderColor: theme.surfaceBorder,
                          color: theme.text,
                          height: rs(isCompact ? 44 : 50),
                          borderRadius: rs(16),
                          paddingHorizontal: rs(16),
                          fontSize: rf(isCompact ? 14 : 16),
                        },
                      ]}
                      placeholder="127.0.0.1"
                      placeholderTextColor={theme.textMuted}
                      value={ip}
                      onChangeText={setIp}
                      autoCapitalize="none"
                      keyboardType="default"
                    />
                  </View>

                  <View style={{ gap: rs(8) }}>
                    <Text style={[styles.codeLabel, { color: theme.textSecondary, fontSize: rf(13) }]}>
                      Code d&apos;accès
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.bg,
                          borderColor: theme.surfaceBorder,
                          color: theme.text,
                          height: rs(isCompact ? 44 : 50),
                          borderRadius: rs(16),
                          paddingHorizontal: rs(16),
                          fontSize: rf(isCompact ? 15 : 18),
                        },
                      ]}
                      placeholder="..."
                      placeholderTextColor={theme.textMuted}
                      value={code}
                      onChangeText={(t) => {
                        setCode(t.toUpperCase());
                        setError('');
                      }}
                      autoCapitalize="characters"
                      maxLength={10}
                    />
                  </View>

                  {error ? <Text style={[styles.error, { fontSize: rf(12) }]}>{error}</Text> : null}

                  <View style={[styles.codeRow, { gap: rs(10) }]}>
                    <Pressable
                      style={[
                        styles.loginButton,
                        {
                          flex: 1,
                          backgroundColor: theme.accent,
                          height: rs(isCompact ? 44 : 50),
                          borderRadius: rs(16),
                          opacity: loading ? 0.7 : 1,
                        },
                      ]}
                      onPress={handleLogin}
                      disabled={loading}>
                      <Text style={[styles.loginButtonText, { fontSize: rf(15) }]}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Scanner le QR Code"
                      onPress={() => router.push('/scan')}
                      style={[
                        styles.scanButton,
                        {
                          backgroundColor: '#2D2B31',
                          width: rs(isCompact ? 56 : 60),
                          height: rs(isCompact ? 44 : 50),
                          borderRadius: rs(16),
                        },
                      ]}>
                      <QrScanIcon />
                    </Pressable>
                  </View>
                </GlassCard>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    opacity: 0.28,
  },
  safe: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    alignSelf: 'center',
    gap: 14,
  },
  heroCard: {
    flexShrink: 1,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroBadgeText: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    lineHeight: 20,
  },
  formCard: {
    flexShrink: 1,
  },
  formHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formTitle: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  formHint: {
    lineHeight: 18,
  },
  formMiniBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  codeSection: {},
  codeLabel: {
    fontWeight: '500',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scanButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBadge: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D2B31',
  },
  input: {
    borderWidth: 1,
    fontWeight: '700',
    letterSpacing: 4,
  },
  error: {
    color: '#FF5252',
    textAlign: 'center',
  },
  loginButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
