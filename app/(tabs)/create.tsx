import Header from '@/components/Header';
import { DEFAULT_AVATAR_URL } from '@/constants/AppConstants';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { Bold, Clock, Globe, Image as ImageIcon, Italic, Link, Lock, Menu, Plus, Quote, Settings, Tag } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSideDrawer } from '@/components/SideDrawerProvider';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { openDrawer } = useSideDrawer();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('id, name');
      setCategories(data || []);
      if (data && data.length > 0) {
        setCategoryId(data[0].id);
      }
    };
    fetchCategories();
  }, []);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Incomplete Entry', 'Please provide a title and content for your entry.');
      return;
    }
    if (!user) {
      Alert.alert('Sign In Required', 'You must be signed in to post.');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('posts')
      .insert({
        title: title.trim(),
        content: { body: content.trim() },
        author_id: user.id,
        category_id: categoryId || null,
        status: 'published'
      });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setTitle('');
      setContent('');
      router.push('/(tabs)');
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Custom Header */}
        <Header leftAction="menu" rightAction="avatar" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

          {/* Action Header */}
          <View className="px-6 py-6 flex-row justify-between items-center">
            <View>
              <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[2px] uppercase mb-1.5">New Entry</Text>
              <View className="flex-row items-center">
                <Clock size={10} color={colors.iconMuted} />
                <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1.5">Draft saved 2 mins ago</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity className="mr-5">
                <Text className="text-xs font-bold text-slate-600 dark:text-slate-400">Save Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#047857] px-6 py-2.5 rounded-full"
                onPress={handlePost}
                disabled={loading || !content.trim() || !title.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-xs font-bold tracking-wider">Publish</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Content */}
          <View className="px-6 mt-4">
            <TextInput
              className="text-[42px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-2"
              placeholder="Title of your"
              placeholderTextColor={colors.placeholderLight}
              value={title}
              onChangeText={setTitle}
              multiline
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            />

            <View className="w-16 h-[1px] bg-slate-200 dark:bg-slate-700 mt-4 mb-8" />

            <TextInput
              className="text-[22px] text-slate-800 dark:text-slate-200 leading-relaxed"
              style={{ minHeight: 200, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
              multiline
              placeholder="Start your narrative here. Let the words breathe..."
              placeholderTextColor={colors.placeholderLight}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
          </View>

          {/* Floating Text Tools Wrapper */}
          <View className="items-center w-full mt-4 mb-16 z-10">
            <View className="bg-white dark:bg-[#1A1A1A] px-6 py-4 rounded-full flex-row items-center gap-x-6 drop-shadow-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800">
              <TouchableOpacity><Bold size={18} color={colors.icon} strokeWidth={3} /></TouchableOpacity>
              <TouchableOpacity><Italic size={18} color={colors.icon} strokeWidth={3} /></TouchableOpacity>
              <View className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700" />
              <TouchableOpacity><Quote size={18} fill={colors.icon} color={colors.icon} /></TouchableOpacity>
              <TouchableOpacity><ImageIcon size={18} color={colors.icon} /></TouchableOpacity>
              <TouchableOpacity><Link size={18} color={colors.icon} /></TouchableOpacity>
            </View>
          </View>

          {/* Categorize Block */}
          <View className="px-6 pb-8 border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center mb-6">
              <Tag size={16} color={colors.iconMid} fill={colors.iconMuted} />
              <Text className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-[1.5px] ml-2 uppercase">Categorize Your Story</Text>
            </View>

            <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-4">Suggested For You</Text>

            <View className="flex-row flex-wrap gap-3 mb-6">
              {categories.map((cat) => {
                const isActive = categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    className={`px-4 py-2 bg-transparent rounded-full border flex-row items-center ${isActive ? 'bg-[#E8F3EE] dark:bg-[#0D2318] border-[#047857]/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A1A1A]'}`}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text className={`text-xs ${isActive ? 'text-[#047857] font-bold' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
                      {cat.name}
                    </Text>
                    {isActive && <Text className="text-[#047857] font-bold text-xs ml-1.5 pt-[1px]">×</Text>}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 border-dashed flex-row items-center bg-white dark:bg-[#1A1A1A]">
                <Text className="text-xs font-medium text-slate-400 dark:text-slate-500 mr-2">Add a tag...</Text>
                <Plus size={14} color={colors.iconMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Publishing Settings */}
          <View className="px-6 mb-12">
            <View className="bg-[#F3F4F6] dark:bg-[#222222] rounded-[24px] p-6 relative">
              <View className="absolute top-6 right-6">
                <Settings size={20} color={colors.iconMuted} />
              </View>
              <Text className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Publishing Settings</Text>
              <Text className="text-xs font-serif text-slate-500 dark:text-slate-400 mb-6 pr-8 leading-relaxed">Control who sees your words in The Sanctuary.</Text>

              <TouchableOpacity className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 flex-row items-center justify-between mb-3 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
                <View className="flex-row items-center">
                  <Globe size={18} color="#047857" />
                  <Text className="text-[13px] font-bold text-slate-800 dark:text-slate-200 ml-3">Public Stream</Text>
                </View>
                <View className="w-[18px] h-[18px] rounded-full border-[5px] border-[#047857] bg-white dark:bg-[#1A1A1A] items-center justify-center p-0.5" />
              </TouchableOpacity>

              <TouchableOpacity className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 flex-row items-center justify-between shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
                <View className="flex-row items-center">
                  <Lock size={18} color={colors.icon} />
                  <Text className="text-[13px] font-bold text-slate-800 dark:text-slate-200 ml-3">Private Garden</Text>
                </View>
                <View className="w-[18px] h-[18px] rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1A1A1A]" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
