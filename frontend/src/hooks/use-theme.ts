import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/hooks/use-theme-store';

export function useTheme() {
  const scheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);
  const resolved = mode === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : mode;
  return Colors[resolved];
}
