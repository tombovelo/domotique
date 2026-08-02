import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/hooks/use-theme';
import { useResponsive } from '@/hooks/use-responsive';
import type { User } from '@/types';

type UserRowProps = {
  user: User;
  onPress: () => void;
  onDelete?: () => void;
};

export function UserRow({ user, onPress, onDelete }: UserRowProps) {
  const theme = useTheme();
  const { rs, rf } = useResponsive();
  const isAdmin = user.role === 'ADMIN';
  const permsCount = user.permissions.filter((p) => p.acces).length;

  const handleDelete = () => {
    if (!onDelete) return;
    if (isAdmin) {
      Toast.show({ type: 'error', text1: 'Action impossible', text2: 'Impossible de supprimer l\'administrateur principal' });
      return;
    }
    Alert.alert(
      'Révoquer l\'accès',
      `Supprimer l'accès de ${user.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
          opacity: pressed ? 0.7 : 1,
          padding: rs(12),
          gap: rs(8),
          borderRadius: rs(12),
        },
      ]}>
      <View style={[styles.avatar, { width: rs(40), height: rs(40), borderRadius: rs(14) }]}>
        <Text style={[styles.avatarText, { fontSize: rf(16) }]}>{user.nom.charAt(0)}</Text>
      </View>
      <View style={[styles.info, { gap: rs(2) }]}>
        <View style={[styles.nameRow, { gap: rs(6) }]}>
          <Text style={[styles.nom, { color: theme.text, fontSize: rf(14) }]}>{user.nom}</Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isAdmin
                  ? 'rgba(198,155,255,0.18)'
                  : 'rgba(255,255,255,0.08)',
                paddingHorizontal: rs(8),
                paddingVertical: rs(2),
                borderRadius: rs(6),
              },
            ]}>
            <Text
              style={[
                styles.badgeText,
                { color: isAdmin ? theme.accentLight : theme.textSecondary, fontSize: rf(10) },
              ]}>
              {isAdmin ? 'ADMIN' : 'MEMBRE'}
            </Text>
          </View>
        </View>
        <Text style={[styles.detail, { color: theme.textMuted, fontSize: rf(11) }]}>
          {permsCount} pièce{permsCount > 1 ? 's' : ''}
          {user.dateExpiration
            ? ` · Expire le ${user.dateExpiration.split('T')[0]}`
            : ' · Permanent'}
        </Text>
      </View>
      {onDelete && !isAdmin && (
        <Pressable onPress={handleDelete} style={[styles.deleteHitbox, { width: rs(28), height: rs(28) }]} hitSlop={8}>
          <Text style={[styles.deleteIcon, { color: theme.textMuted, fontSize: rf(14) }]}>🗑️</Text>
        </Pressable>
      )}
      <Text style={[styles.chevron, { color: theme.textMuted, fontSize: rf(18) }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatar: {
    backgroundColor: 'rgba(198,155,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
    color: '#E8D7FF',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nom: {
    fontWeight: '600',
  },
  badge: {},
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detail: {},
  deleteHitbox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {},
  chevron: {
    fontWeight: '300',
  },
});
