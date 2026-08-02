import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { useResponsive } from '@/hooks/use-responsive';

export default function ScanScreen() {
  const theme = useTheme();
  const { rs, rf, pagePadding } = useResponsive();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleScan = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const parsed = JSON.parse(data);
      router.replace({ pathname: '/', params: { scannedCode: parsed.code, scannedIp: parsed.ip } });
    } catch {
      router.replace({ pathname: '/', params: { scannedCode: data } });
    }
  };

  if (!permission || !permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center', gap: rs(16) }]}>
        <Text style={{ color: theme.text, fontSize: rf(16), textAlign: 'center', paddingHorizontal: pagePadding }}>
          Autorisez l&apos;accès à la caméra pour scanner le QR Code
        </Text>
        <Pressable
          style={[styles.permButton, { backgroundColor: theme.accent, height: rs(48), borderRadius: rs(14), paddingHorizontal: rs(24) }]}
          onPress={requestPermission}>
          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: rf(15) }}>Autoriser</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: theme.accentLight, fontSize: rf(14) }}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />
      <View style={[styles.overlay, { paddingTop: insets.top + rs(16), paddingBottom: insets.bottom + rs(16) }]}>
        <View style={[styles.topRow, { paddingHorizontal: pagePadding }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { width: rs(44), height: rs(44), borderRadius: rs(14), backgroundColor: theme.accent }]}>
            <Text style={[styles.backText, { color: '#FFF', fontSize: rf(24) }]}>‹</Text>
          </Pressable>
          <Text style={[styles.scanTitle, { color: '#FFF', fontSize: rf(17) }]}>Scanner le QR Code</Text>
          <View style={{ width: rs(44) }} />
        </View>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <Text style={[styles.hint, { color: 'rgba(255,255,255,0.7)', fontSize: rf(13) }]}>
          Placez le QR Code dans le cadre
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { alignItems: 'center', justifyContent: 'center' },
  backText: { fontWeight: '300', lineHeight: 28 },
  scanTitle: { fontWeight: '600' },
  scanFrame: { width: 260, height: 260, position: 'relative' },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: '#FFF', borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  hint: { fontWeight: '500' },
  permButton: { alignItems: 'center', justifyContent: 'center' },
});
