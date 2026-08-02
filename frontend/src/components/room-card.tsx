import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';
import type { Room } from '@/types';

type RoomCardProps = {
  room: Room;
  onToggle: (id: number) => void;
};

export function RoomCard({ room, onToggle }: RoomCardProps) {
  const theme = useTheme();
  const { rs, rf } = useResponsive();

  return (
    <Pressable
      onPress={() => onToggle(room.id)}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: room.etat
              ? theme.cardOn
              : theme.surface,
            borderColor: room.etat
              ? theme.cardOnBorder
              : theme.surfaceBorder,
            paddingVertical: rs(10),
            paddingHorizontal: rs(12),
            borderRadius: rs(16),
            gap: rs(6),
          },
        ]}>
        <View
          style={[
            styles.iconBubble,
            {
              backgroundColor: room.etat ? 'rgba(253, 224, 71, 0.25)' : 'rgba(255,255,255,0.06)',
              width: rs(36),
              height: rs(36),
              borderRadius: rs(12),
            },
          ]}>
          <Text style={[styles.icone, { fontSize: rf(18) }]}>{room.icone}</Text>
        </View>
        <Text
          style={[
            styles.nom,
            { color: room.etat ? theme.accentLight : theme.textSecondary, fontSize: rf(13) },
          ]}
          numberOfLines={1}>
          {room.nom.replace('Chambre ', 'CH').replace('Salon', 'SAL').replace('Cuisine', 'CU').replace('Couloir', 'COU').replace('Douche / WC', 'WC').replace('Exterieur', 'EXT').replace('Debarras', 'DEB')}
        </Text>
        <View style={[styles.indicatorRow, { gap: rs(6) }]}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: room.etat ? theme.accentLight : theme.textMuted,
                width: rs(8),
                height: rs(8),
                borderRadius: rs(4),
              },
            ]}
          />
          <Text
            style={[
              styles.statut,
              { color: room.etat ? theme.accentLight : theme.textMuted, fontSize: rf(10) },
            ]}>
            {room.etat ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  card: {
    width: '100%',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icone: {},
  nom: {
    fontWeight: '600',
    flex: 1,
    marginHorizontal: 10,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  dot: {},
  statut: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
