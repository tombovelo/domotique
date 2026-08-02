import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { RoomRow } from '@/components/room-row';
import { roomsService } from '@/services/rooms';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';
import type { Room } from '@/types';

export default function RoomsListScreen() {
  const theme = useTheme();
  const { rs, rf, pagePadding, contentMaxWidth } = useResponsive();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    roomsService.getAll().then(setRooms).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await roomsService.delete(id);
      setRooms((prev) => prev.filter((room) => room.id !== id));
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e.message || 'Suppression impossible' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        style={{
          paddingTop: insets.top + rs(12),
          paddingHorizontal: pagePadding,
          paddingBottom: rs(8),
          maxWidth: contentMaxWidth,
          alignSelf: 'center',
          width: '100%',
          gap: rs(4),
        }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text, fontSize: rf(28) }]}>Maison</Text>
          <Pressable
            style={[styles.addButton, { backgroundColor: theme.accent, width: rs(44), height: rs(44), borderRadius: rs(14) }]}
            onPress={() => router.push('/(admin)/rooms/create')}>
            <Text style={[styles.addText, { color: '#fff', fontSize: rf(24) }]}>+</Text>
          </Pressable>
        </View>
        <Text style={[styles.count, { color: theme.textSecondary, fontSize: rf(13) }]}>
          {rooms.length} maison{rooms.length > 1 ? 's' : ''}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accentLight} style={{ flex: 1 }} />
      ) : (
        <ScrollView
          style={{ flex: 1, marginBottom: insets.bottom + rs(74) }}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom: rs(12),
              paddingHorizontal: pagePadding,
              paddingTop: rs(4),
              maxWidth: contentMaxWidth,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.list, { gap: rs(8) }]}>
            {rooms.map((room) => (
              <RoomRow
                key={room.id}
                room={room}
                onPress={() => router.push({ pathname: '/(admin)/rooms/[id]', params: { id: room.id } })}
                onDelete={() => handleDelete(room.id)}
              />
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
  scroll: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontWeight: '600',
    marginTop: -2,
  },
  count: {
    fontWeight: '500',
    marginTop: -8,
  },
  list: {},
});
