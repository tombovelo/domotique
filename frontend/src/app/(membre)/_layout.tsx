import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

function TabIcon({
  symbolName,
  focused,
  activeColor,
  inactiveColor,
  activeBg,
}: {
  symbolName: React.ComponentProps<typeof SymbolView>['name'];
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  activeBg: string;
}) {
  return (
    <View style={[styles.tabIcon, focused && { backgroundColor: activeBg }]}>
      <SymbolView
        name={symbolName}
        size={24}
        tintColor={focused ? activeColor : inactiveColor}
      />
    </View>
  );
}

export default function MembreTabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.bg === '#F5F3FF' ? '#FFFFFF' : '#22103A',
          borderWidth: 1,
          borderColor: theme.surfaceBorder,
          height: 72 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 10,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.22,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: theme.accentLight,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.3,
          marginTop: 3,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              symbolName={{ ios: 'house.fill', android: 'home', web: 'home' }}
              focused={focused}
              activeColor={theme.accentLight}
              inactiveColor={theme.textMuted}
              activeBg={theme.cardOn}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: 'Partager',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              symbolName={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }}
              focused={focused}
              activeColor={theme.accentLight}
              inactiveColor={theme.textMuted}
              activeBg={theme.cardOn}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              symbolName={{ ios: 'person.fill', android: 'person', web: 'person' }}
              focused={focused}
              activeColor={theme.accentLight}
              inactiveColor={theme.textMuted}
              activeBg={theme.cardOn}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
