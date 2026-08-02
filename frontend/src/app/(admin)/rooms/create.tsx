import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { roomsService } from '@/services/rooms';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';
import type { RoomType } from '@/types';

export default function CreateRoomScreen() {
  const theme = useTheme();
  const { rs, rf, pagePadding, contentMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();

  const [nom, setNom] = useState('');
  const [type, setType] = useState<RoomType>('COMMUNE');
  const [pinRelais, setPinRelais] = useState('');
  const [pinInterrupteur, setPinInterrupteur] = useState('');
  const [icone, setIcone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedNom = nom.trim();
    const relais = Number.parseInt(pinRelais, 10);
    const interrupteur = Number.parseInt(pinInterrupteur, 10);

    if (!trimmedNom) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Le nom est obligatoire' });
      return;
    }

    if (Number.isNaN(relais) || Number.isNaN(interrupteur)) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Les pins doivent etre des nombres' });
      return;
    }

    setSaving(true);
    try {
      await roomsService.create({
        nom: trimmedNom,
        type,
        pinRelais: relais,
        pinInterrupteur: interrupteur,
        ...(icone.trim() ? { icone: icone.trim() } : {}),
      });
      Toast.show({ type: 'success', text1: 'Maison ajoutee', text2: `${trimmedNom} a ete creee avec succes` });
      router.replace('/(admin)/rooms');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e.message || 'Creation impossible' });
    } finally {
      setSaving(false);
    }
  };

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
        <Text style={[styles.topTitle, { color: theme.text, fontSize: rf(17) }]}>Nouvelle maison</Text>
        <View style={[styles.backBtn, { width: rs(40) }]} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: pagePadding,
            paddingBottom: insets.bottom + rs(90),
            gap: rs(12),
            maxWidth: contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              padding: rs(16),
              gap: rs(10),
              borderRadius: rs(22),
            },
          ]}>
          <Text style={[styles.label, { color: theme.textSecondary, fontSize: rf(13) }]}>Nom</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.bg,
                borderColor: theme.surfaceBorder,
                color: theme.text,
                height: rs(48),
                borderRadius: rs(14),
                paddingHorizontal: rs(14),
                fontSize: rf(16),
              },
            ]}
            placeholder="..."
            placeholderTextColor={theme.textMuted}
            value={nom}
            onChangeText={setNom}
          />

          <Text style={[styles.label, { color: theme.textSecondary, fontSize: rf(13) }]}>Type</Text>
          <View style={[styles.row, { gap: rs(8) }]}>
            <Pressable
              onPress={() => setType('COMMUNE')}
              style={[
                styles.typeBtn,
                {
                  flex: 1,
                  backgroundColor: type === 'COMMUNE' ? theme.accent : theme.bg,
                  borderColor: type === 'COMMUNE' ? theme.accentLight : theme.surfaceBorder,
                  height: rs(42),
                  borderRadius: rs(12),
                },
              ]}>
              <Text style={[styles.typeText, { color: type === 'COMMUNE' ? '#FFFFFF' : theme.textSecondary, fontSize: rf(13) }]}>Commune</Text>
            </Pressable>
            <Pressable
              onPress={() => setType('PRIVEE')}
              style={[
                styles.typeBtn,
                {
                  flex: 1,
                  backgroundColor: type === 'PRIVEE' ? theme.accent : theme.bg,
                  borderColor: type === 'PRIVEE' ? theme.accentLight : theme.surfaceBorder,
                  height: rs(42),
                  borderRadius: rs(12),
                },
              ]}>
              <Text style={[styles.typeText, { color: type === 'PRIVEE' ? '#FFFFFF' : theme.textSecondary, fontSize: rf(13) }]}>Privee</Text>
            </Pressable>
          </View>

          <View style={[styles.row, { gap: rs(8) }]}>
            <View style={{ flex: 1, gap: rs(6) }}>
              <Text style={[styles.label, { color: theme.textSecondary, fontSize: rf(13) }]}>Pin relais</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.bg,
                    borderColor: theme.surfaceBorder,
                    color: theme.text,
                    height: rs(48),
                    borderRadius: rs(14),
                    paddingHorizontal: rs(14),
                    fontSize: rf(16),
                  },
                ]}
                placeholder="ex: 12"
                placeholderTextColor={theme.textMuted}
                value={pinRelais}
                onChangeText={setPinRelais}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <View style={{ flex: 1, gap: rs(6) }}>
              <Text style={[styles.label, { color: theme.textSecondary, fontSize: rf(13) }]}>Pin interrupteur</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.bg,
                    borderColor: theme.surfaceBorder,
                    color: theme.text,
                    height: rs(48),
                    borderRadius: rs(14),
                    paddingHorizontal: rs(14),
                    fontSize: rf(16),
                  },
                ]}
                placeholder="ex: 13"
                placeholderTextColor={theme.textMuted}
                value={pinInterrupteur}
                onChangeText={setPinInterrupteur}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>

          {/* <Text style={[styles.label, { color: theme.textSecondary, fontSize: rf(13) }]}>Icone</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.bg,
                borderColor: theme.surfaceBorder,
                color: theme.text,
                height: rs(48),
                borderRadius: rs(14),
                paddingHorizontal: rs(14),
                fontSize: rf(16),
              },
            ]}
            placeholder="Optionnel"
            placeholderTextColor={theme.textMuted}
            value={icone}
            onChangeText={setIcone}
          /> */}
        </View>

        <Pressable
          disabled={saving}
          onPress={handleSave}
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.accent,
              height: rs(50),
              borderRadius: rs(16),
              opacity: saving ? 0.7 : 1,
            },
          ]}>
          <Text style={[styles.saveText, { fontSize: rf(16) }]}>{saving ? 'Creation...' : 'Ajouter la maison'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorTop: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  orb: {
    opacity: 0.18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontWeight: '300',
    lineHeight: 34,
  },
  topTitle: {
    fontWeight: '600',
  },
  scroll: {},
  card: {
    borderWidth: 1,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
  },
  typeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  typeText: {
    fontWeight: '600',
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
