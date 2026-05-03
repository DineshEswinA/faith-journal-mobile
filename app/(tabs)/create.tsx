import Header from '@/components/Header';
import RichContentRenderer from '@/components/RichContentRenderer';
import { useAppTheme } from '@/hooks/useAppTheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  Bold,
  Clock,
  Globe,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link,
  List,
  Lock,
  Plus,
  Settings,
  Tag,
  Underline,
  Video,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type EditorAsset = {
  type: 'image' | 'link' | 'youtube';
  url: string;
  label?: string;
};

type LinkModalState = {
  visible: boolean;
  mode: 'link' | 'youtube';
  url: string;
  label: string;
};

const emptyLinkModal: LinkModalState = {
  visible: false,
  mode: 'link',
  url: '',
  label: '',
};

const stripEditorSyntax = (value: string) =>
  value
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/@\[youtube\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/<u>(.*?)<\/u>/g, '$1')
    .replace(/==(.+?)==/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .trim();

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [assets, setAssets] = useState<EditorAsset[]>([]);
  const [linkModal, setLinkModal] = useState<LinkModalState>(emptyLinkModal);
  const { user } = useAuthStore();
  const router = useRouter();
  const { colors } = useAppTheme();

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

  const excerpt = useMemo(() => stripEditorSyntax(content).slice(0, 180), [content]);

  const insertText = (text: string) => {
    const next = `${content.slice(0, selection.start)}${text}${content.slice(selection.end)}`;
    const cursor = selection.start + text.length;
    setContent(next);
    setSelection({ start: cursor, end: cursor });
  };

  const wrapSelection = (prefix: string, suffix: string, fallback: string) => {
    const selected = content.slice(selection.start, selection.end) || fallback;
    const nextText = `${prefix}${selected}${suffix}`;
    const next = `${content.slice(0, selection.start)}${nextText}${content.slice(selection.end)}`;
    setContent(next);
    setSelection({ start: selection.start + prefix.length, end: selection.start + prefix.length + selected.length });
  };

  const addBullet = () => {
    const before = content.slice(0, selection.start);
    const needsLineBreak = before.length > 0 && !before.endsWith('\n');
    insertText(`${needsLineBreak ? '\n' : ''}- `);
  };

  const openLinkModal = (mode: 'link' | 'youtube') => {
    const selected = content.slice(selection.start, selection.end);
    setLinkModal({
      visible: true,
      mode,
      url: '',
      label: mode === 'link' ? selected : '',
    });
  };

  const insertLinkFromModal = () => {
    const url = linkModal.url.trim();
    if (!url) return;

    if (linkModal.mode === 'youtube') {
      insertText(`\n\n@[youtube](${url})\n\n`);
      setAssets((prev) => [...prev, { type: 'youtube', url }]);
    } else {
      const label = linkModal.label.trim() || url;
      insertText(`[${label}](${url})`);
      setAssets((prev) => [...prev, { type: 'link', url, label }]);
    }

    setLinkModal(emptyLinkModal);
  };

  const attachImage = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'You must be signed in to attach images.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });

      if (result.canceled || !result.assets[0].base64) {
        return;
      }

      setUploadingImage(true);
      const asset = result.assets[0];
      const imageBase64 = asset.base64;
      if (!imageBase64) return;
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = fileExt === 'jpg' ? 'image/jpeg' : `image/${fileExt}`;
      const filePath = `${user.id}/posts/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('faith-journal')
        .upload(filePath, decode(imageBase64), {
          contentType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('faith-journal').getPublicUrl(filePath);

      if (!coverImage) {
        setCoverImage(publicUrl);
      }
      setAssets((prev) => [...prev, { type: 'image', url: publicUrl, label: 'Attached image' }]);
      insertText(`\n\n![Attached image](${publicUrl})\n\n`);
    } catch (error: any) {
      Alert.alert('Upload Failed', error?.message || 'Could not attach the image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !stripEditorSyntax(content)) {
      Alert.alert('Incomplete Entry', 'Please provide a title and content for your entry.');
      return;
    }
    if (!user) {
      Alert.alert('Sign In Required', 'You must be signed in to post.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('posts').insert({
      title: title.trim(),
      excerpt,
      content: {
        body: content.trim(),
        format: 'faith-rich-markdown',
        assets,
      },
      cover_image: coverImage,
      author_id: user.id,
      category_id: categoryId || null,
      status: 'published',
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setTitle('');
      setContent('');
      setCoverImage(null);
      setAssets([]);
      router.push('/(tabs)');
    }
  };

  const canPublish = !!title.trim() && !!stripEditorSyntax(content) && !loading;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <Header leftAction="menu" rightAction="avatar" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <View className="px-6 py-6 flex-row justify-between items-center">
            <View className="flex-1 pr-4">
              <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[2px] uppercase mb-1.5">New Entry</Text>
              <View className="flex-row items-center">
                <Clock size={10} color={colors.iconMuted} />
                <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1.5">Rich editor</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity className="mr-5">
                <Text className="text-xs font-bold text-slate-600 dark:text-slate-400">Save Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-6 py-2.5 rounded-full ${canPublish ? 'bg-[#047857]' : 'bg-slate-300 dark:bg-slate-700'}`}
                onPress={handlePost}
                disabled={!canPublish}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-xs font-bold tracking-wider">Publish</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-6 mt-4">
            <TextInput
              className="text-[42px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-2"
              placeholder="Title of your story"
              placeholderTextColor={colors.placeholderLight}
              value={title}
              onChangeText={setTitle}
              multiline
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            />

            <View className="w-16 h-[1px] bg-slate-200 dark:bg-slate-700 mt-4 mb-6" />

            <View className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 12, columnGap: 14, alignItems: 'center' }}
                keyboardShouldPersistTaps="handled"
              >
                <TouchableOpacity className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#222222] items-center justify-center" onPress={() => wrapSelection('**', '**', 'bold text')}>
                  <Bold size={17} color={colors.icon} strokeWidth={3} />
                </TouchableOpacity>
                <TouchableOpacity className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#222222] items-center justify-center" onPress={() => wrapSelection('_', '_', 'italic text')}>
                  <Italic size={17} color={colors.icon} strokeWidth={3} />
                </TouchableOpacity>
                <TouchableOpacity className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#222222] items-center justify-center" onPress={() => wrapSelection('<u>', '</u>', 'underlined text')}>
                  <Underline size={17} color={colors.icon} strokeWidth={3} />
                </TouchableOpacity>
                <TouchableOpacity className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#222222] items-center justify-center" onPress={() => wrapSelection('==', '==', 'highlighted text')}>
                  <Highlighter size={17} color={colors.icon} strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#222222] items-center justify-center" onPress={addBullet}>
                  <List size={18} color={colors.icon} strokeWidth={2.5} />
                </TouchableOpacity>
                <View className="w-[1px] h-7 bg-slate-200 dark:bg-slate-700" />
                <TouchableOpacity className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#222222] items-center justify-center" onPress={attachImage} disabled={uploadingImage}>
                  {uploadingImage ? <ActivityIndicator size="small" color="#047857" /> : <ImageIcon size={17} color={colors.icon} />}
                </TouchableOpacity>
                <TouchableOpacity className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#222222] items-center justify-center" onPress={() => openLinkModal('link')}>
                  <Link size={17} color={colors.icon} />
                </TouchableOpacity>
                <TouchableOpacity className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#222222] items-center justify-center" onPress={() => openLinkModal('youtube')}>
                  <Video size={18} color={colors.icon} />
                </TouchableOpacity>
              </ScrollView>

              <TextInput
                className="text-[19px] text-slate-800 dark:text-slate-200 leading-relaxed px-5 pb-5"
                style={{ minHeight: 240, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                multiline
                placeholder="Start your narrative here. Select text, then use the editor tools."
                placeholderTextColor={colors.placeholderLight}
                value={content}
                onChangeText={setContent}
                onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
                textAlignVertical="top"
              />
            </View>

            {assets.length > 0 ? (
              <View className="mt-4">
                <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[1.5px] mb-3">Attachments</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ columnGap: 12 }}>
                  {assets.map((asset, index) => (
                    <View key={`${asset.type}-${asset.url}-${index}`} className="w-28">
                      {asset.type === 'image' ? (
                        <View className="w-28 h-20 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                          <Image source={{ uri: asset.url }} className="w-full h-full" resizeMode="cover" />
                        </View>
                      ) : (
                        <View className="w-28 h-20 rounded-lg bg-slate-100 dark:bg-[#222222] border border-slate-200 dark:border-slate-700 items-center justify-center">
                          {asset.type === 'youtube' ? <Video size={22} color="#047857" /> : <Link size={20} color="#047857" />}
                        </View>
                      )}
                      <Text className="text-[10px] text-slate-500 dark:text-slate-400 mt-2" numberOfLines={2}>
                        {asset.label || asset.url}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {content.trim() ? (
              <View className="mt-8">
                <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[1.5px] mb-4">Preview</Text>
                <RichContentRenderer content={content} />
              </View>
            ) : null}
          </View>

          <View className="px-6 pb-8 pt-8 border-slate-100 dark:border-slate-800">
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
                    className={`px-4 py-2 bg-transparent rounded-full border flex-row items-center ${
                      isActive ? 'bg-[#E8F3EE] dark:bg-[#0D2318] border-[#047857]/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A1A1A]'
                    }`}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text className={`text-xs ${isActive ? 'text-[#047857] font-bold' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>{cat.name}</Text>
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

      <Modal animationType="fade" transparent visible={linkModal.visible} onRequestClose={() => setLinkModal(emptyLinkModal)}>
        <View className="flex-1 bg-black/40 px-6 justify-center">
          <View className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              {linkModal.mode === 'youtube' ? 'Add YouTube Video' : 'Insert Link'}
            </Text>
            {linkModal.mode === 'link' ? (
              <TextInput
                className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#222222] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 mb-3"
                placeholder="Link text"
                placeholderTextColor={colors.placeholder}
                value={linkModal.label}
                onChangeText={(label) => setLinkModal((prev) => ({ ...prev, label }))}
              />
            ) : null}
            <TextInput
              className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#222222] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              placeholder={linkModal.mode === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://example.com'}
              placeholderTextColor={colors.placeholder}
              value={linkModal.url}
              autoCapitalize="none"
              keyboardType="url"
              onChangeText={(url) => setLinkModal((prev) => ({ ...prev, url }))}
            />
            <View className="flex-row justify-end items-center gap-x-4 mt-5">
              <TouchableOpacity onPress={() => setLinkModal(emptyLinkModal)}>
                <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-[#047857] px-5 py-3 rounded-full" onPress={insertLinkFromModal}>
                <Text className="text-xs font-bold text-white uppercase tracking-wider">Insert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
