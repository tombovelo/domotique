import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoomCard } from '@/components/room-card';
import { roomsService } from '@/services/rooms';
import { useAuth } from '@/hooks/use-auth';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';
import { getSocket } from '@/services/socket';
import type { Room } from '@/types';

export default function MembreDashboardScreen() {
  const theme = useTheme();
  const user = useAuth((s) => s.user);
  const insets = useSafeAreaInsets();
  const { rs, rf, width, pagePadding, contentMaxWidth } = useResponsive();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roomsService.getAccessible().then(setRooms).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handler = (data: { roomId: number; etat: boolean }) => {
      setRooms((prev) => prev.map((r) => (r.id === data.roomId ? { ...r, etat: data.etat } : r)));
    };
    socket.on('room:stateChanged', handler);
    return () => { socket.off('room:stateChanged', handler); };
  }, []);

  const onToggle = useCallback(async (id: number) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, etat: !r.etat } : r)));
    try {
      const room = rooms.find((r) => r.id === id);
      if (room) await roomsService.toggle(id, !room.etat);
    } catch {
      setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, etat: !r.etat } : r)));
    }
  }, [rooms]);

  const totalOn = rooms.filter((r) => r.etat).length;
  const twoColItemWidth = Math.floor((contentMaxWidth - pagePadding * 2 - rs(12)) / 2) - 2;
  const bottomPadding = insets.bottom + rs(128);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: theme.accentLight,
            top: -rs(70),
            right: -rs(50),
            width: rs(190),
            height: rs(190),
            borderRadius: rs(95),
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: theme.neonGreen,
            top: rs(180),
            left: -rs(70),
            width: rs(170),
            height: rs(170),
            borderRadius: rs(85),
          },
        ]}
      />

      <View
        style={{
          paddingTop: insets.top + rs(12),
          paddingHorizontal: pagePadding,
          paddingBottom: rs(8),
          maxWidth: contentMaxWidth,
          alignSelf: 'center',
          width: '100%',
        }}>
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              borderRadius: rs(28),
              padding: rs(18),
              gap: rs(14),
            },
          ]}>
          <View style={styles.header}>
            <View style={{ flex: 1, gap: rs(4) }}>
              <Text style={[styles.greeting, { color: theme.textSecondary, fontSize: rf(13) }]}>
                Hi {user?.nom ?? 'Membre'}
              </Text>
              <Text style={[styles.summarySub, { color: theme.textSecondary, fontSize: rf(13) }]}>
                Pièces accessibles
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: theme.cardOn,
                  borderColor: theme.cardOnBorder,
                  paddingHorizontal: rs(12),
                  paddingVertical: rs(8),
                  borderRadius: rs(16),
                },
              ]}>
              <Text style={[styles.badgeText, { color: theme.text, fontSize: rf(14) }]}>
                {totalOn}/{rooms.length}
              </Text>
              <Text style={[styles.badgeLabel, { color: theme.accentLight, fontSize: rf(8) }]}>
                allumées
              </Text>
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accentLight} style={{ flex: 1 }} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom: bottomPadding,
              paddingHorizontal: pagePadding,
              maxWidth: contentMaxWidth,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.grid, { columnGap: rs(8), rowGap: rs(8) }]}>
            {rooms.map((room) => (
              <View key={room.id} style={{ width: twoColItemWidth }}>
                <RoomCard room={room} onToggle={onToggle} />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    opacity: 0.18,
  },
  scroll: {},
  headerCard: {
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  greeting: {
    fontWeight: '600',
  },
  badge: {
    borderWidth: 1,
    alignItems: 'center',
  },
  badgeText: {
    fontWeight: '700',
  },
  badgeLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  summarySub: {},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
});
