import { View, Text, TouchableOpacity, ScrollView, Image, Switch, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { DEFAULT_AVATAR_URL } from '@/constants/AppConstants';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Lock, Bell, MailCheck, ShieldAlert, Moon, HelpCircle, FileText, Shield, LogOut, ChevronRight } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const { isDark, setColorScheme, colors } = useAppTheme();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailNewsEnabled, setEmailNewsEnabled] = useState(false);
  const [privateGarden, setPrivateGarden] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setProfile(data);
    };
    loadProfile();
  }, [user]);

  const handleLogOut = () => {
    signOut();
    router.replace('/(auth)/sign-in');
  };

  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || DEFAULT_AVATAR_URL;

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]" edges={['top']}>

      {/* Header */}
      <View className="bg-[#FAFAFA] dark:bg-[#111111] flex-row justify-between items-center px-6 py-4 z-10">
        <TouchableOpacity className="w-10 justify-center" onPress={() => router.back()}>
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight" numberOfLines={1}>
            Settings
          </Text>
        </View>
        <View className="w-10 items-end justify-center">
          <View className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
             <Image source={{ uri: displayAvatar }} className="w-full h-full" />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* Intro */}
        <View className="px-6 pt-4 pb-8">
          <Text className="text-[10px] font-bold text-[#047857] tracking-[1.5px] uppercase mb-2">PREFERENCES</Text>
          <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            Your Sanctuary
          </Text>
          <Text className="text-[15px] font-serif text-slate-500 dark:text-slate-400 leading-relaxed pr-4">
            Customize your reading and reflection experience to best suit your spiritual journey.
          </Text>
        </View>

        {/* ACCOUNT SETTINGS */}
        <View className="px-6 mb-8">
          <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-4 ml-2">ACCOUNT SETTINGS</Text>
          <View className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-2 shadow-sm drop-shadow-sm border border-slate-100 dark:border-slate-800">

            <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50 dark:border-slate-800" onPress={() => router.push('/edit-profile')}>
              <View className="bg-[#E8F3EE] dark:bg-[#0D2318] w-10 h-10 rounded-xl items-center justify-center mr-4">
                <User size={20} color="#047857" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Edit Profile</Text>
                <Text className="text-[12px] font-serif italic text-slate-500 dark:text-slate-400 mt-0.5">Manage your public identity</Text>
              </View>
              <ChevronRight size={16} color={colors.iconChevron} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50 dark:border-slate-800">
              <View className="bg-[#E8F3EE] dark:bg-[#0D2318] w-10 h-10 rounded-xl items-center justify-center mr-4">
                <Mail size={20} color="#047857" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Change Email</Text>
                <Text className="text-[12px] font-serif italic text-slate-500 dark:text-slate-400 mt-0.5">Update your contact address</Text>
              </View>
              <ChevronRight size={16} color={colors.iconChevron} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4" onPress={() => router.push('/change-password')}>
              <View className="bg-[#E8F3EE] dark:bg-[#0D2318] w-10 h-10 rounded-xl items-center justify-center mr-4">
                <Lock size={20} color="#047857" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Change Password</Text>
                <Text className="text-[12px] font-serif italic text-slate-500 dark:text-slate-400 mt-0.5">Secure your sanctuary access</Text>
              </View>
              <ChevronRight size={16} color={colors.iconChevron} />
            </TouchableOpacity>

          </View>
        </View>

        {/* NOTIFICATIONS */}
        <View className="px-6 mb-8">
          <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-4 ml-2">NOTIFICATIONS</Text>

          <View className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-5 mb-3 shadow-sm drop-shadow-sm border border-slate-100 dark:border-slate-800 flex-row items-center">
            <View className="flex-1">
               <Bell size={20} color="#047857" fill="#047857" className="mb-3" />
               <Text className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Push Notifications</Text>
               <Text className="text-[12px] font-serif italic text-slate-500 dark:text-slate-400 mt-0.5">Daily reminders & alerts</Text>
            </View>
            <Switch
               value={pushEnabled}
               onValueChange={setPushEnabled}
               trackColor={{ false: colors.switchOff, true: '#047857' }}
               thumbColor="#ffffff"
            />
          </View>

          <View className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-5 shadow-sm drop-shadow-sm border border-slate-100 dark:border-slate-800 flex-row items-center">
             <View className="flex-1">
               <MailCheck size={20} color="#047857" className="mb-3" />
               <Text className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Email Newsletter</Text>
               <Text className="text-[12px] font-serif italic text-slate-500 dark:text-slate-400 mt-0.5">Weekly spiritual insights</Text>
             </View>
             <Switch
               value={emailNewsEnabled}
               onValueChange={setEmailNewsEnabled}
               trackColor={{ false: colors.switchOff, true: '#047857' }}
               thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* PRIVACY & SECURITY */}
        <View className="px-6 mb-8">
          <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-4 ml-2">PRIVACY & SECURITY</Text>

          <View className="bg-[#047857] rounded-3xl p-6 mb-3 shadow-sm drop-shadow-md">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[17px] font-bold text-white tracking-tight">Private Garden Mode</Text>
              <Switch
                value={privateGarden}
                onValueChange={setPrivateGarden}
                trackColor={{ false: '#065f46', true: '#064e3b' }}
                thumbColor="#ffffff"
              />
            </View>
            <Text className="text-[13px] font-serif italic text-[#A7F3D0] leading-relaxed pr-6 mt-1">
              Only you can view your journal entries and scripture reflections.
            </Text>
          </View>

          <TouchableOpacity className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-5 shadow-sm drop-shadow-sm border border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <ShieldAlert size={18} color={colors.iconMid} className="mr-3" />
              <Text className="text-[14px] font-bold text-slate-800 dark:text-slate-200">Blocked Users</Text>
            </View>
            <ChevronRight size={16} color={colors.iconChevron} />
          </TouchableOpacity>
        </View>

        {/* APP PREFERENCES */}
        <View className="px-6 mb-10">
          <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-4 ml-2">APP PREFERENCES</Text>
          <View className="bg-[#F3F4F6] dark:bg-[#222222] rounded-3xl p-6">

            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row items-center">
                <Moon size={18} color={colors.icon} className="mr-3" fill={colors.icon} />
                <Text className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={(value) => setColorScheme(value ? 'dark' : 'light')}
                trackColor={{ false: colors.switchOffAlt, true: '#047857' }}
                thumbColor="#ffffff"
              />
            </View>

            <View>
              <View className="flex-row justify-between items-end mb-4">
                <Text className="text-[14px] font-bold text-slate-900 dark:text-slate-100">Font Size</Text>
                <Text className="text-[11px] font-bold text-[#047857]">Medium (16px)</Text>
              </View>
              <View className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-full justify-center relative my-2">
                 <View className="absolute left-1/2 w-4 h-4 bg-[#047857] rounded-full -ml-2" />
              </View>
              <View className="flex-row justify-between justify-items-center mt-3">
                 <Text className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[1px] w-[33%]">COMPACT</Text>
                 <Text className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[1px] w-[33%] text-center">READABLE</Text>
                 <Text className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[1px] w-[33%] text-right">GRAND</Text>
              </View>
            </View>

          </View>
        </View>

        {/* SUPPORT & ABOUT */}
        <View className="px-6 mb-10">
           <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-4 ml-2">SUPPORT & ABOUT</Text>

           <TouchableOpacity className="flex-row items-center py-4 px-2">
              <HelpCircle size={18} color={colors.iconMid} fill={colors.iconMid} className="mr-5 text-white" />
              <Text className="text-[15px] font-bold text-slate-800 dark:text-slate-200">Help Center</Text>
           </TouchableOpacity>

           <TouchableOpacity className="flex-row items-center py-4 px-2">
              <FileText size={18} color={colors.iconMid} fill={colors.iconMid} className="mr-5 text-white" />
              <Text className="text-[15px] text-slate-800 dark:text-slate-200" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>Terms <Text className="font-bold">of</Text> Service</Text>
           </TouchableOpacity>

           <TouchableOpacity className="flex-row items-center py-4 px-2 mb-4">
              <Shield size={18} color={colors.iconMid} fill={colors.iconMid} className="mr-5 text-white" />
              <Text className="text-[15px] text-slate-800 dark:text-slate-200 font-bold">Privacy Policy</Text>
           </TouchableOpacity>

           <TouchableOpacity className="bg-[#F8FAFC] dark:bg-[#1A1A1A] py-4 rounded-xl flex-row items-center justify-center" onPress={handleLogOut}>
              <LogOut size={16} color="#DC2626" className="mr-2" />
              <Text className="text-[#DC2626] font-bold text-[13px]">Log Out</Text>
           </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
