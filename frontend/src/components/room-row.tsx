import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';
import type { Room } from '@/types';

type RoomRowProps = {
  room: Room;
  onPress: () => void;
  onDelete?: () => void;
};

export function RoomRow({ room, onPress, onDelete }: RoomRowProps) {
  const theme = useTheme();
  const { rs, rf } = useResponsive();

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert('Supprimer la maison', `Supprimer ${room.nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: onDelete },
    ]);
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
        <Text style={[styles.avatarText, { fontSize: rf(18) }]}>{room.icone || 'H'}</Text>
      </View>
      <View style={[styles.info, { gap: rs(2) }]}>
        <View style={[styles.nameRow, { gap: rs(6) }]}>
          <Text style={[styles.nom, { color: theme.text, fontSize: rf(14) }]}>{room.nom}</Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: room.type === 'COMMUNE' ? 'rgba(198,155,255,0.18)' : 'rgba(255,255,255,0.08)',
                paddingHorizontal: rs(8),
                paddingVertical: rs(2),
                borderRadius: rs(6),
              },
            ]}>
            <Text
              style={[
                styles.badgeText,
                { color: room.type === 'COMMUNE' ? theme.accentLight : theme.textSecondary, fontSize: rf(10) },
              ]}>
              {room.type === 'COMMUNE' ? 'COMMUNE' : 'PRIVEE'}
            </Text>
          </View>
        </View>
        <Text style={[styles.detail, { color: theme.textMuted, fontSize: rf(11) }]}>
          Pin relais {room.pinRelais} / Pin interrupteur {room.pinInterrupteur}
        </Text>
        <Text style={[styles.detail, { color: room.etat ? theme.accentLight : theme.textMuted, fontSize: rf(11) }]}>
          {room.etat ? 'Allumee' : 'Eteinte'}
        </Text>
      </View>
      {onDelete && (
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
