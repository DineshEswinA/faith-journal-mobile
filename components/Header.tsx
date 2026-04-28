import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Menu, ChevronLeft, Settings, Share2 } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSideDrawer } from '@/components/SideDrawerProvider';
import { useAuthStore } from '@/store/authStore';
import { DEFAULT_AVATAR_URL } from '@/constants/AppConstants';

export type HeaderProps = {
  title?: string;
  titleStyle?: 'serif' | 'sans';
  leftAction?: 'menu' | 'back' | 'none';
  rightAction?: 'avatar' | 'settings' | 'share' | 'none';
  onLeftPress?: () => void;
  onRightPress?: () => void;
  hideBorder?: boolean;
  safeArea?: boolean;
};

export default function Header({
  title = 'FaithJournal',
  titleStyle = 'serif',
  leftAction = 'back',
  rightAction = 'none',
  onLeftPress,
  onRightPress,
  hideBorder = false,
  safeArea = false,
}: HeaderProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { openDrawer } = useSideDrawer();
  const { user } = useAuthStore();

  const handleLeftPress = () => {
    if (onLeftPress) return onLeftPress();
    if (leftAction === 'menu') {
      openDrawer();
    } else if (leftAction === 'back') {
      router.back();
    }
  };

  const handleRightPress = () => {
    if (onRightPress) return onRightPress();
    if (rightAction === 'avatar') {
      router.push('/(tabs)/profile');
    } else if (rightAction === 'settings') {
      router.push('/settings');
    }
  };

  const Container = safeArea ? SafeAreaView : View;
  const containerProps = safeArea ? { edges: ['top'] as any } : {};

  return (
    <Container
      {...containerProps}
      className={`bg-[#FAFAFA] dark:bg-[#111111] flex-row justify-between items-center px-6 py-4 ${
        hideBorder ? '' : 'border-b border-slate-100 dark:border-slate-800'
      }`}
    >
      <View className="w-8 justify-center items-start">
        {leftAction !== 'none' && (
          <TouchableOpacity onPress={handleLeftPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {leftAction === 'menu' && <Menu color={colors.icon} size={24} />}
            {leftAction === 'back' && <ChevronLeft color={colors.icon} size={28} />}
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 items-center justify-center mx-4">
        <Text
          className={`text-2xl font-bold text-slate-900 dark:text-slate-100 text-center ${title === 'Profile' ? 'text-xl' : ''}`}
          numberOfLines={1}
          adjustsFontSizeToFit
          style={
            titleStyle === 'serif'
              ? { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' }
              : undefined
          }
        >
          {title}
        </Text>
      </View>

      <View className="w-8 justify-center items-end">
        {rightAction !== 'none' && (
          <TouchableOpacity 
            onPress={handleRightPress} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className={rightAction === 'avatar' ? 'w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700' : ''}
          >
            {rightAction === 'avatar' && (
              <Image
                source={{ uri: user?.user_metadata?.avatar_url || DEFAULT_AVATAR_URL }}
                className="w-full h-full"
              />
            )}
            {rightAction === 'settings' && <Settings color={colors.icon} size={24} />}
            {rightAction === 'share' && <Share2 size={22} color={colors.icon} />}
          </TouchableOpacity>
        )}
      </View>
    </Container>
  );
}
