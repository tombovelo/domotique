import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { roomsService } from '@/services/rooms';
import { usersService } from '@/services/users';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';
import type { Room, User } from '@/types';

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { rs, rf, pagePadding, contentMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersService.getById(Number(id)),
      roomsService.getAll(),
    ]).then(([u, r]) => { setUser(u); setAllRooms(r); }).finally(() => setLoading(false));
  }, [id]);

  const permissions = user?.permissions ?? [];
  const isAdmin = user?.role === 'ADMIN';

  const togglePermission = (roomId: number) => {
    if (!user) return;
    const existing = permissions.find((p) => p.room.id === roomId);
    const next = existing
      ? permissions.map((p) => (p.room.id === roomId ? { ...p, acces: !p.acces } : p))
      : [...permissions, { id: 0, userId: user.id, acces: true, createdAt: '', room: allRooms.find((r) => r.id === roomId)! }];
    setUser({ ...user, permissions: next });
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await usersService.update(user.id, {
        permissions: permissions.map((p) => ({ roomId: p.room.id, acces: p.acces })),
      });
      Toast.show({ type: 'success', text1: 'Enregistré', text2: 'Permissions mises à jour' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e.message || 'Sauvegarde impossible' });
    }
  };

  const handleDelete = () => {
    if (!user) return;
    Alert.alert('Révoquer l\'accès', `Supprimer ${user.nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await usersService.delete(user.id);
          router.back();
        },
      },
    ]);
  };

  const twoColPermWidth = Math.floor((contentMaxWidth - pagePadding * 2 - rs(16) - rs(8)) / 2);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accentLight} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text, textAlign: 'center', marginTop: 100 }}>
          Utilisateur introuvable
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + rs(8), paddingHorizontal: pagePadding, paddingBottom: rs(8) }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { width: rs(40), height: rs(40) }]}>
          <Text style={[styles.backText, { color: theme.text, fontSize: rf(32) }]}>‹</Text>
        </Pressable>
        <Text style={[styles.topTitle, { color: theme.text, fontSize: rf(17) }]}>{user.nom}</Text>
        {!isAdmin ? (
          <Pressable onPress={handleDelete} style={[styles.backBtn, { width: rs(40), height: rs(40) }]}>
            <Text style={{ fontSize: rf(18) }}>🗑️</Text>
          </Pressable>
        ) : (
          <View style={{ width: rs(40) }} />
        )}
      </View>

      <View
        style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, padding: rs(16), gap: rs(10), borderRadius: rs(22), marginHorizontal: pagePadding, maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' as any }]}>
        <View style={[styles.avatar, { backgroundColor: isAdmin ? 'rgba(198,155,255,0.18)' : 'rgba(255,255,255,0.05)', width: rs(56), height: rs(56), borderRadius: rs(18) }]}>
          <Text style={[styles.avatarText, { color: isAdmin ? theme.accentLight : theme.textSecondary, fontSize: rf(24) }]}>{user.nom.charAt(0)}</Text>
        </View>
        <View style={[styles.profileInfo, { gap: rs(4) }]}>
          <View style={[styles.badge, { backgroundColor: isAdmin ? 'rgba(198,155,255,0.18)' : 'rgba(255,255,255,0.08)', paddingHorizontal: rs(10), paddingVertical: rs(3), borderRadius: rs(999) }]}>
            <Text style={[styles.badgeText, { color: isAdmin ? theme.accentLight : theme.textSecondary, fontSize: rf(10) }]}>
              {isAdmin ? 'ADMIN' : 'MEMBRE'}
            </Text>
          </View>
        </View>
        <Text style={[styles.code, { color: theme.textMuted, fontSize: rf(12) }]}>
          Code: {user.codeAcces}
        </Text>
      </View>

      {!isAdmin && (
        <View
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, padding: rs(16), gap: rs(10), borderRadius: rs(22), marginHorizontal: pagePadding, marginTop: rs(12), maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' as any, flex: 1 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontSize: rf(15) }]}>
            Pièces autorisées
          </Text>
          <Text style={[styles.sectionSub, { color: theme.textMuted, fontSize: rf(11) }]}>
            Activez ou désactivez l\'accès aux pièces
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.permsGrid, { gap: rs(8), paddingBottom: rs(8) }]}>
            {allRooms.map((room) => {
              const perm = permissions.find((p) => p.room.id === room.id);
              const active = perm?.acces ?? false;
              return (
                <Pressable
                  key={room.id}
                  style={[styles.permCell, { backgroundColor: active ? theme.cardOn : theme.bg, borderColor: active ? theme.cardOnBorder : theme.surfaceBorder, borderRadius: rs(14), padding: rs(10), gap: rs(4), width: twoColPermWidth }]}
                  onPress={() => togglePermission(room.id)}>
                  <Text style={[styles.permIcon, { fontSize: rf(20) }]}>{room.icone}</Text>
                  <Text style={[styles.permNom, { color: active ? theme.accentLight : theme.textMuted, fontSize: rf(11) }]} numberOfLines={1}>{room.nom}</Text>
                  <Text style={[styles.permCheck, { color: active ? theme.accentLight : 'transparent', fontSize: rf(14) }]}>✓</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={{ paddingHorizontal: pagePadding, paddingBottom: insets.bottom + rs(90), paddingTop: rs(12), gap: rs(10), maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' as any }}>
        {!isAdmin && (
          <Pressable
            style={[styles.saveButton, { backgroundColor: theme.accent, height: rs(50), borderRadius: rs(16) }]}
            onPress={handleSave}>
            <Text style={[styles.saveText, { fontSize: rf(15) }]}>Enregistrer les modifications</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.shareButton, { borderColor: theme.surfaceBorder, height: rs(50), borderRadius: rs(16) }]}
          onPress={() => router.push(`/(admin)/users/share?code=${user.codeAcces}&nom=${encodeURIComponent(user.nom)}`)}>
          <Text style={[styles.shareText, { color: theme.accentLight, fontSize: rf(14) }]}>
            📱 Afficher le QR Code
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { alignItems: 'center', justifyContent: 'center' },
  backText: { fontWeight: '300', lineHeight: 34 },
  topTitle: { fontWeight: '600' },
  profileCard: { borderWidth: 1, alignItems: 'center' },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700' },
  profileInfo: { alignItems: 'center' },
  badge: {},
  badgeText: { fontWeight: '700', letterSpacing: 0.5 },
  code: { fontWeight: '500' },
  card: { borderWidth: 1 },
  sectionTitle: { fontWeight: '700' },
  sectionSub: { lineHeight: 16 },
  permsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  permCell: { borderWidth: 1, alignItems: 'center' },
  permIcon: {},
  permNom: { fontWeight: '600', textAlign: 'center' },
  permCheck: { fontWeight: '700', position: 'absolute', top: 6, right: 8 },
  saveButton: { alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#FFFFFF', fontWeight: '700' },
  shareButton: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  shareText: { fontWeight: '600' },
});
