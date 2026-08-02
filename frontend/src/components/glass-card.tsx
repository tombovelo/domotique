import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type GlassCardProps = ViewProps & {
  intensity?: 'subtle' | 'medium' | 'strong';
  glow?: boolean;
  glowColor?: string;
};

export function GlassCard({
  style,
  intensity = 'medium',
  glow,
  glowColor,
  children,
  ...props
}: GlassCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
        },
        glow && {
          borderColor: glowColor ?? theme.neonGreen,
          shadowColor: glowColor ?? theme.neonGreen,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 12,
          elevation: 8,
        },
        intensity === 'subtle' && styles.subtle,
        intensity === 'strong' && styles.strong,
        style,
      ]}
      {...props}>
      <View pointerEvents="none" style={[styles.highlight, { backgroundColor: theme.accentLight }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  highlight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.1,
  },
  subtle: {
    opacity: 0.98,
  },
  strong: {
    shadowOpacity: 0.24,
    elevation: 8,
  },
});
