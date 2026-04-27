import { usePathname, useRouter } from 'expo-router';
import { BookOpen, CircleHelp, Compass, LogOut, PenSquare, Settings, Shield, User, X } from 'lucide-react-native';
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

type SideDrawerContextValue = {
  closeDrawer: () => void;
  isOpen: boolean;
  openDrawer: () => void;
  toggleDrawer: () => void;
};

const SideDrawerContext = createContext<SideDrawerContextValue | null>(null);

const drawerItems = [
  { icon: BookOpen, href: '/', label: 'Home', match: '/' },
  { icon: Compass, href: '/explore', label: 'Search', match: '/explore' },
  { icon: PenSquare, href: '/create', label: 'Write', match: '/create' },
  { icon: User, href: '/profile', label: 'Profile', match: '/profile' },
  { icon: Settings, href: '/settings', label: 'Settings', match: '/settings' },
];

const secondaryItems = [
  { icon: Shield, href: '/privacy', label: 'Privacy Policy' },
  { icon: CircleHelp, href: '/about', label: 'About' },
];

export function SideDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const translateX = useRef(new Animated.Value(-320)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const pathname = usePathname();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { signOut, user } = useAuthStore();

  const animateDrawer = (open: boolean) => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: open ? 0 : -320,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: open ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !open) {
        setIsOpen(false);
      }
    });
  };

  const openDrawer = () => {
    if (!isOpen) {
      setIsOpen(true);
      requestAnimationFrame(() => animateDrawer(true));
      return;
    }
    animateDrawer(true);
  };

  const closeDrawer = () => {
    if (!isOpen) return;
    animateDrawer(false);
  };

  const toggleDrawer = () => {
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  useEffect(() => {
    closeDrawer();
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      setProfileData(null);
      return;
    }

    const loadProfileData = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfileData(data);
    };

    loadProfileData();
  }, [pathname, user?.id]);

  const value = useMemo(
    () => ({ closeDrawer, isOpen, openDrawer, toggleDrawer }),
    [isOpen]
  );

  const handleNavigate = (href: string) => {
    router.push(href as any);
  };

  const handleSignOut = async () => {
    closeDrawer();
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  const displayAvatar = profileData?.avatar_url || user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/100?img=11';
  const displayName = profileData?.full_name || profileData?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Faith Journal Member';

  return (
    <SideDrawerContext.Provider value={value}>
      <View className="flex-1">
        {children}
        {isOpen ? (
          <View className="absolute inset-0 z-50">
            <Animated.View
              pointerEvents="none"
              style={{ opacity: overlayOpacity }}
              className="absolute inset-0 bg-black/35"
            />
            <Pressable className="absolute inset-0" onPress={closeDrawer} />
            <Animated.View
              style={{ transform: [{ translateX }] }}
              className="absolute left-0 top-0 bottom-0 w-[84%] max-w-[320px] bg-white dark:bg-[#111111] shadow-2xl"
            >
              <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                <View className="px-6 pt-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <View className="flex-row items-start justify-between mb-6">
                    <View className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <Image source={{ uri: displayAvatar }} className="w-full h-full" />
                    </View>
                    <TouchableOpacity
                      className="w-10 h-10 rounded-full items-center justify-center bg-slate-100 dark:bg-[#1A1A1A]"
                      onPress={closeDrawer}
                    >
                      <X size={18} color={colors.icon} />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-[10px] font-bold text-[#047857] tracking-[1.5px] uppercase mb-2">Sanctuary Menu</Text>
                  <Text
                    className="text-2xl text-slate-900 dark:text-slate-100"
                    style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                  >
                    {displayName}
                  </Text>
                  <Text className="text-[13px] text-slate-500 dark:text-slate-400 mt-2">
                    {user?.email || 'Signed in'}
                  </Text>
                </View>

                <View className="px-4 py-5">
                  {drawerItems.map((item) => {
                    const isActive = pathname === item.match;
                    const Icon = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.label}
                        className={`flex-row items-center px-4 py-4 rounded-2xl mb-2 ${isActive ? 'bg-[#ECF1ED] dark:bg-[#0D2318]' : 'bg-transparent'
                          }`}
                        onPress={() => handleNavigate(item.href)}
                      >
                        <Icon size={18} color={isActive ? '#047857' : colors.iconMid} />
                        <Text className={`ml-4 text-[15px] ${isActive ? 'text-[#047857] font-bold' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View className="mx-6 h-px bg-slate-100 dark:bg-slate-800" />

                <View className="px-4 py-5">
                  {secondaryItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.label}
                        className="flex-row items-center px-4 py-4 rounded-2xl mb-2"
                        onPress={() => handleNavigate(item.href)}
                      >
                        <Icon size={18} color={colors.iconMid} />
                        <Text className="ml-4 text-[15px] text-slate-700 dark:text-slate-300 font-medium">
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View className="mt-auto px-6 pb-4">
                  <TouchableOpacity
                    className="bg-[#F8FAFC] dark:bg-[#1A1A1A] py-4 rounded-2xl flex-row items-center justify-center"
                    onPress={handleSignOut}
                  >
                    <LogOut size={16} color="#DC2626" />
                    <Text className="ml-2 text-[#DC2626] font-bold text-[13px]">Log Out</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Animated.View>
          </View>
        ) : null}
      </View>
    </SideDrawerContext.Provider>
  );
}

export function useSideDrawer() {
  const context = useContext(SideDrawerContext);

  if (!context) {
    throw new Error('useSideDrawer must be used within SideDrawerProvider');
  }

  return context;
}
