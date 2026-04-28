import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEME_STORAGE_KEY = '@faith_journal_theme';

const colors = {
  light: {
    icon: '#333333',
    iconMuted: '#94a3b8',
    iconMid: '#64748b',
    iconChevron: '#cbd5e1',
    placeholder: '#94a3b8',
    placeholderAlt: '#9ca3af',
    placeholderLight: '#cbd5e1',
    switchOff: '#e2e8f0',
    switchOffAlt: '#cbd5e1',
  },
  dark: {
    icon: '#CBD5E1',
    iconMuted: '#4B5563',
    iconMid: '#94a3b8',
    iconChevron: '#374151',
    placeholder: '#6B7280',
    placeholderAlt: '#6B7280',
    placeholderLight: '#4B5563',
    switchOff: '#374151',
    switchOffAlt: '#374151',
  },
};

export function useAppTheme() {
  const { colorScheme, setColorScheme: setNativeWindColorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const setColorScheme = async (scheme: 'light' | 'dark' | 'system') => {
    setNativeWindColorScheme(scheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
    } catch (e) {
      console.log('Error saving theme', e);
    }
  };

  return {
    isDark,
    colorScheme,
    setColorScheme,
    toggleColorScheme,
    colors: isDark ? colors.dark : colors.light,
  };
}
