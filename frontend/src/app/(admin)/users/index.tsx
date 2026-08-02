import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { UserRow } from '@/components/user-row';
import { usersService } from '@/services/users';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';
import type { User } from '@/types';

export default function UsersListScreen() {
  const theme = useTheme();
  const { rs, rf, pagePadding, contentMaxWidth } = useResponsive();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    usersService.getAll().then(setUsers).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await usersService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
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
          <Text style={[styles.title, { color: theme.text, fontSize: rf(28) }]}>Utilisateurs</Text>
          <Pressable
            style={[styles.addButton, { backgroundColor: theme.accent, width: rs(44), height: rs(44), borderRadius: rs(14) }]}
            onPress={() => router.push('/(admin)/users/create')}>
            <Text style={[styles.addText, { color: '#fff', fontSize: rf(24) }]}>+</Text>
          </Pressable>
        </View>
        <Text style={[styles.count, { color: theme.textSecondary, fontSize: rf(13) }]}>
          {users.length} utilisateur{users.length > 1 ? 's' : ''}
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
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onPress={() => router.push(`/(admin)/users/${user.id}`)}
                onDelete={user.id !== 1 ? () => handleDelete(user.id) : undefined}
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
