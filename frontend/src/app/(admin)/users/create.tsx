import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { roomsService } from '@/services/rooms';
import { usersService } from '@/services/users';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';
import type { Room } from '@/types';

function generateCode(nom: string): string {
  const prefix = nom.slice(0, 4).toUpperCase();
  const suffix = Math.floor(10 + Math.random() * 89).toString();
  return `${prefix}${suffix}`;
}

export default function CreateUserScreen() {
  const theme = useTheme();
  const { rs, rf, pagePadding, contentMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [nom, setNom] = useState('');
  const [code, setCode] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<{ roomId: number; acces: boolean }[]>([]);

  useEffect(() => {
    roomsService.getAll().then((rooms) => {
      setAllRooms(rooms);
      setPermissions(rooms.filter((r) => r.type === 'COMMUNE').map((r) => ({ roomId: r.id, acces: true })));
    }).finally(() => setLoading(false));
  }, []);

  const togglePermission = (roomId: number) => {
    setPermissions((prev) => {
      const existing = prev.find((p) => p.roomId === roomId);
      if (existing) {
        return prev.map((p) => (p.roomId === roomId ? { ...p, acces: !p.acces } : p));
      }
      return [...prev, { roomId, acces: true }];
    });
  };

  const handleGenerateCode = () => {
    if (nom.trim()) {
      setCode(generateCode(nom.trim()));
    }
  };

  const handleSave = async () => {
    if (!nom.trim()) return;
    const finalCode = code || generateCode(nom.trim());
    try {
      await usersService.create({
        nom: nom.trim(),
        codeAcces: finalCode,
        role: isAdmin ? 'ADMIN' : 'MEMBRE',
        permissions: isAdmin ? [] : permissions.filter((p) => p.acces),
      });
      router.push(`/(admin)/users/share?code=${finalCode}&nom=${encodeURIComponent(nom.trim())}`);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e.message || 'Création impossible' });
    }
  };

  const twoColPermWidth = Math.floor((contentMaxWidth - pagePadding * 2 - rs(16) - rs(8)) / 2);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.decorTop} pointerEvents="none">
        <View
          style={[
            styles.orb,
            {
              backgroundColor: theme.accentLight,
              width: rs(120),
              height: rs(120),
              borderRadius: rs(60),
            },
          ]}
        />
      </View>

      <View style={[styles.topBar, { paddingTop: insets.top + rs(8), paddingHorizontal: pagePadding, paddingBottom: rs(8) }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { width: rs(40), height: rs(40) }]}>
          <Text style={[styles.backText, { color: theme.text, fontSize: rf(32) }]}>‹</Text>
        </Pressable>
        <Text style={[styles.topTitle, { color: theme.text, fontSize: rf(17) }]}>
          Nouvel Utilisateur
        </Text>
        <View style={[styles.backBtn, { width: rs(40) }]} />
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.surfaceBorder,
            padding: rs(16),
            gap: rs(10),
            borderRadius: rs(22),
            marginHorizontal: pagePadding,
            maxWidth: contentMaxWidth,
            alignSelf: 'center',
            width: '100%' as any,
          },
        ]}>
        <Text style={[styles.label, { color: theme.textSecondary, fontSize: rf(13) }]}>Nom</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bg, borderColor: theme.surfaceBorder, color: theme.text, height: rs(48), borderRadius: rs(14), paddingHorizontal: rs(14), fontSize: rf(16) }]}
          placeholder="..."
          placeholderTextColor={theme.textMuted}
          value={nom}
          onChangeText={setNom}
        />

        <Text style={[styles.label, { color: theme.textSecondary, fontSize: rf(13) }]}>
          Code d&apos;accès
        </Text>
        <View style={[styles.codeRow, { gap: rs(8) }]}>
          <TextInput
            style={[styles.input, styles.codeInput, { backgroundColor: theme.bg, borderColor: theme.surfaceBorder, color: theme.text, height: rs(44), borderRadius: rs(12), paddingHorizontal: rs(12), fontSize: rf(15) }]}
            placeholder="..."
            placeholderTextColor={theme.textMuted}
            value={code}
            onChangeText={setCode}
            maxLength={8}
            autoCapitalize="characters"
          />
          <Pressable
            style={[styles.genButton, { backgroundColor: theme.accent, paddingHorizontal: rs(14), borderRadius: rs(12) }]}
            onPress={handleGenerateCode}>
            <Text style={[styles.genText, { fontSize: rf(12) }]}>Générer</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: theme.textSecondary, fontSize: rf(13) }]}>
          Rôle
        </Text>
        <View style={[styles.roleRow, { gap: rs(8) }]}>
          <Pressable
            style={[styles.roleOption, { backgroundColor: !isAdmin ? theme.accent : theme.surface, borderColor: theme.surfaceBorder, height: rs(40), borderRadius: rs(12) }]}
            onPress={() => setIsAdmin(false)}>
            <Text style={[styles.roleText, { color: !isAdmin ? '#FFFFFF' : theme.textSecondary, fontSize: rf(13) }]}>Membre</Text>
          </Pressable>
          <Pressable
            style={[styles.roleOption, { backgroundColor: isAdmin ? theme.accent : theme.surface, borderColor: theme.surfaceBorder, height: rs(40), borderRadius: rs(12) }]}
            onPress={() => setIsAdmin(true)}>
            <Text style={[styles.roleText, { color: isAdmin ? '#FFFFFF' : theme.textSecondary, fontSize: rf(13) }]}>Administrateur</Text>
          </Pressable>
        </View>
      </View>

      {!isAdmin && !loading && (
        <View
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, padding: rs(16), gap: rs(10), borderRadius: rs(22), marginHorizontal: pagePadding, marginTop: rs(12), maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' as any, flex: 1 }]}>
          <Text style={[styles.label, { color: theme.textSecondary, fontSize: rf(13) }]}>
            Pièces autorisées
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.permsGrid, { gap: rs(8), paddingBottom: rs(8) }]}>
            {allRooms.map((room) => {
              const perm = permissions.find((p) => p.roomId === room.id);
              const active = perm?.acces ?? false;
              return (
                <Pressable
                  key={room.id}
                  style={[styles.permCell, { backgroundColor: active ? theme.cardOn : theme.bg, borderColor: active ? theme.cardOnBorder : theme.surfaceBorder, borderRadius: rs(14), padding: rs(10), gap: rs(4), width: twoColPermWidth }]}
                  onPress={() => togglePermission(room.id)}>
                  <Text style={[styles.permIcon, { fontSize: rf(22) }]}>{room.icone}</Text>
                  <Text style={[styles.permNom, { color: active ? theme.accentLight : theme.textMuted, fontSize: rf(11) }]} numberOfLines={1}>{room.nom}</Text>
                  <Text style={[styles.permCheck, { color: active ? theme.accentLight : 'transparent', fontSize: rf(14) }]}>✓</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={{ paddingHorizontal: pagePadding, paddingBottom: insets.bottom + rs(90), paddingTop: rs(12), maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' as any }}>
        <Pressable
          style={[styles.saveButton, { backgroundColor: theme.accent, height: rs(50), borderRadius: rs(16) }]}
          onPress={handleSave}>
          <Text style={[styles.saveText, { fontSize: rf(16) }]}>Créer l'utilisateur</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  decorTop: { position: 'absolute', top: 0, right: 0 },
  orb: { opacity: 0.18 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { alignItems: 'center', justifyContent: 'center' },
  backText: { fontWeight: '300', lineHeight: 34 },
  topTitle: { fontWeight: '600' },
  card: { borderWidth: 1 },
  label: { fontWeight: '600', letterSpacing: 0.3 },
  input: { borderWidth: 1, fontWeight: '500' },
  codeRow: { flexDirection: 'row' },
  codeInput: { flex: 1, letterSpacing: 3, fontWeight: '700' },
  genButton: { alignItems: 'center', justifyContent: 'center' },
  genText: { color: '#FFFFFF', fontWeight: '600' },
  roleRow: { flexDirection: 'row' },
  roleOption: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  roleText: { fontWeight: '600' },
  permsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  permCell: { borderWidth: 1, alignItems: 'center' },
  permIcon: {},
  permNom: { fontWeight: '600', textAlign: 'center' },
  permCheck: { fontWeight: '700', position: 'absolute', top: 6, right: 8 },
  saveButton: { alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveText: { color: '#FFFFFF', fontWeight: '700' },
});
