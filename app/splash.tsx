import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const router = useRouter();
  const { session, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    const timer = setTimeout(() => {
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/sign-in');
      }
    }, 2000); // 2 second delay for splash

    return () => clearTimeout(timer);
  }, [isInitialized, session]);

  return (
    <SafeAreaView className="flex-1 bg-[#F2F6F3] dark:bg-[#111111] relative items-center justify-center pt-20" edges={['top', 'bottom']}>
      {/* Icon Area */}
      <View className="mb-6">
        <BookOpen size={48} color="#047857" strokeWidth={1.5} />
      </View>

      {/* Title */}
      <Text
        className="text-[46px] font-bold text-black dark:text-white mb-6 tracking-tight"
        style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
      >
        Faith Journal
      </Text>

      {/* Divider */}
      <View className="w-16 h-px bg-slate-300 dark:bg-slate-600 mb-8" />

      {/* Subtitle */}
      <Text
        className="text-[19px] text-[#556B5D] dark:text-[#8BA393] text-center px-12 leading-relaxed"
        style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' }}
      >
        A quiet space for reflection,{'\n'}prayer, and the written word.
      </Text>

      {/* Bottom section */}
      <View className="absolute bottom-24 items-center justify-center w-full">
        <View className="w-2.5 h-2.5 rounded-full bg-[#8BA393] mb-5" />
        <Text className="text-[10px] font-bold text-[#8BA393] tracking-[3px] uppercase">
          Entering Sanctuary
        </Text>
      </View>

      {/* Decorative shadow leaves (placeholder visual effect) */}
      <View className="absolute -bottom-10 -right-10 opacity-10">
        <BookOpen size={200} color="#047857" />
      </View>

      {/* Bottom left green accent line */}
      <View className="absolute bottom-0 left-0 w-[40%] h-1.5 bg-[#047857]" />
    </SafeAreaView>
  );
}
