import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A0D2E',
    background: '#F5F3FF',
    backgroundElement: '#EBE6FF',
    backgroundSelected: '#DDD6FF',
    textSecondary: '#4A3F66',
    bg: '#F5F3FF',
    surface: 'rgba(255,255,255,0.95)',
    surfaceBorder: 'rgba(100,60,200,0.12)',
    surfaceHover: 'rgba(100,60,200,0.06)',
    accent: '#5B2ECC',
    accentLight: '#7C3FFF',
    neonGreen: '#6D28D9',
    neonGreenGlow: 'rgba(109,40,217,0.20)',
    textMuted: '#9180B4',
    danger: '#C0394F',
    cardOn: 'rgba(92,50,246,0.10)',
    cardOnBorder: 'rgba(92,50,246,0.28)',
  },
  dark: {
    text: '#F6EEFF',
    background: '#130A22',
    backgroundElement: '#22103A',
    backgroundSelected: '#2D174B',
    textSecondary: '#D7C9F2',
    bg: '#130A22',
    surface: 'rgba(39,18,72,0.82)',
    surfaceBorder: 'rgba(198,166,255,0.18)',
    surfaceHover: 'rgba(198,166,255,0.1)',
    accent: '#C69BFF',
    accentLight: '#E8D7FF',
    neonGreen: '#D5B7FF',
    neonGreenGlow: 'rgba(198,155,255,0.28)',
    textMuted: '#9D8BBE',
    danger: '#FF7A94',
    cardOn: 'rgba(198,155,255,0.16)',
    cardOnBorder: 'rgba(198,155,255,0.38)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
