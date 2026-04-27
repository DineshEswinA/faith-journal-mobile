import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, Link as LinkIcon, Lock } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function EditProfileScreen() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const { colors } = useAppTheme();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      if (data) {
        setFullName(data.full_name || '');
        setUsername(data.username || '');
        setBio(data.bio || '');
        setWebsite(data.website || '');
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user?.id,
      full_name: fullName.trim(),
      username: username.trim(),
      bio: bio.trim(),
      website: website.trim(),
      updated_at: new Date()
    });
    setSaving(false);
    if (!error) {
      router.back();
    }
  };

  const handleLogOut = () => {
    signOut();
    router.replace('/(auth)/sign-in');
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAFAFA] dark:bg-[#111111]">
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/100?img=11';

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">

        {/* Header */}
        <View className="bg-[#FAFAFA] dark:bg-[#111111] flex-row justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 shadow-sm z-10">
          <TouchableOpacity className="w-10 justify-center" onPress={() => router.back()}>
            <X color={colors.icon} size={24} />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight" numberOfLines={1}>
              Edit Profile
            </Text>
          </View>
          <TouchableOpacity className="w-10 items-end justify-center" onPress={handleSave} disabled={saving}>
             {saving ? <ActivityIndicator size="small" color="#047857" /> : <Text className="font-bold text-[#047857] text-[15px]">Save</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

          {/* Avatar Section */}
          <View className="items-center py-8">
            <View className="relative">
              <View className="w-[104px] h-[104px] rounded-2xl overflow-hidden bg-slate-900 dark:bg-slate-800 shadow-sm">
                <Image source={{ uri: displayAvatar }} className="w-full h-full opacity-80" resizeMode="cover" />
              </View>
              <TouchableOpacity className="absolute -bottom-2 -right-2 bg-[#047857] w-8 h-8 rounded-lg items-center justify-center border-2 border-[#FAFAFA] dark:border-[#111111]">
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity className="mt-4">
              <Text className="text-[10px] font-bold text-[#047857] tracking-[1px] uppercase">CHANGE PHOTO</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="px-8 mt-2">

            {/* FULL NAME */}
            <View className="mb-8">
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-2">FULL NAME</Text>
              <TextInput
                className="text-[22px] text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-300 dark:border-slate-600"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your Name"
                placeholderTextColor={colors.placeholderLight}
              />
            </View>

            {/* USERNAME */}
            <View className="mb-8">
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-2">USERNAME</Text>
              <View className="flex-row items-center border-b border-slate-300 dark:border-slate-600 pb-2">
                <Text className="text-xl text-slate-400 dark:text-slate-500 italic mr-2" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>@</Text>
                <TextInput
                  className="flex-1 text-[22px] text-slate-900 dark:text-slate-100"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="username"
                  placeholderTextColor={colors.placeholderLight}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* BIO */}
            <View className="mb-8">
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-2">BIO</Text>
              <View className="bg-[#F3F4F6] dark:bg-[#222222] p-4 border-b-[2px] border-slate-300 dark:border-slate-600">
                <TextInput
                  className="text-[17px] text-slate-800 dark:text-slate-200 leading-relaxed"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', minHeight: 80 }}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Write a little about yourself..."
                  placeholderTextColor={colors.placeholder}
                  multiline
                  maxLength={250}
                  textAlignVertical="top"
                />
              </View>
              <Text className="text-right text-[10px] italic font-serif text-slate-400 dark:text-slate-500 mt-2">
                {bio.length} / 250 characters
              </Text>
            </View>

            {/* WEBSITE */}
            <View className="mb-12">
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-3">WEBSITE</Text>
              <View className="flex-row items-center border-b border-slate-300 dark:border-slate-600 pb-3">
                <LinkIcon size={18} color={colors.iconMid} className="mr-3" />
                <TextInput
                  className="flex-1 text-[17px] text-slate-800 dark:text-slate-200"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="https://"
                  placeholderTextColor={colors.placeholderLight}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            </View>

            {/* Divider */}
            <View className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 mb-10" />

            {/* Private Information Block */}
            <View className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6 drop-shadow-md" style={{ elevation: 2 }}>
              <View className="flex-row items-center mb-6">
                <Lock size={14} color="#047857" fill="#047857" />
                <Text className="text-sm font-bold text-slate-900 dark:text-slate-100 ml-2">Private Information</Text>
              </View>

              <View className="mb-5">
                <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-1">EMAIL</Text>
                <Text className="text-[17px] text-slate-800 dark:text-slate-200" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                  {user?.email || 'N/A'}
                </Text>
              </View>

              <View>
                <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-1">PHONE</Text>
                <Text className="text-[17px] text-slate-800 dark:text-slate-200" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                  {user?.phone || '+1 (555) 000-0000'}
                </Text>
              </View>
            </View>

            {/* Disclaimer */}
            <Text className="text-[12px] font-serif italic text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-12">
              Your private information is never shared with other members of the community and is only used for account security.
            </Text>

            {/* Log Out */}
            <TouchableOpacity
              className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 py-3.5 rounded-full items-center justify-center mb-16 mx-16 shadow-sm"
              onPress={handleLogOut}
            >
              <Text className="text-[#DC2626] text-xs font-bold tracking-wider">Log Out</Text>
            </TouchableOpacity>

            {/* Footer Text */}
            <Text className="text-center text-[9px] font-bold text-slate-300 dark:text-slate-600 tracking-[2.5px] uppercase mb-8">
              FAITH JOURNAL EDITORIAL SANCTUARY
            </Text>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
