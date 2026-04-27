import { useColorScheme } from 'nativewind';

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
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return {
    isDark,
    colorScheme,
    setColorScheme,
    toggleColorScheme,
    colors: isDark ? colors.dark : colors.light,
  };
}
