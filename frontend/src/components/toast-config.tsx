import { StyleSheet, Text, View } from 'react-native';
import type { ToastConfig } from 'react-native-toast-message';

import { Colors } from '@/constants/theme';

type ThemeColors = (typeof Colors)[keyof typeof Colors];

const makeConfig = (colors: ThemeColors): ToastConfig => ({
  success: ({ text1, text2 }) => (
    <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.cardOnBorder }]}>
      <View style={[s.dot, { backgroundColor: colors.accentLight }]} />
      <View style={s.text}>
        <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>{text1}</Text>
        {text2 ? <Text style={[s.sub, { color: colors.textMuted }]} numberOfLines={2}>{text2}</Text> : null}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.danger }]}>
      <View style={[s.dot, { backgroundColor: colors.danger }]} />
      <View style={s.text}>
        <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>{text1}</Text>
        {text2 ? <Text style={[s.sub, { color: colors.textMuted }]} numberOfLines={2}>{text2}</Text> : null}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
      <View style={[s.dot, { backgroundColor: colors.accent }]} />
      <View style={s.text}>
        <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>{text1}</Text>
        {text2 ? <Text style={[s.sub, { color: colors.textMuted }]} numberOfLines={2}>{text2}</Text> : null}
      </View>
    </View>
  ),
});

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 12,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  sub: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
});

export function getToastConfig(mode: 'dark' | 'light'): ToastConfig {
  return makeConfig(Colors[mode]);
}
