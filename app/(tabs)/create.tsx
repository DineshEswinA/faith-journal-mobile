import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

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
    
    // Convert content literal to JSON format matching the schema
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
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-100">
          <Text className="text-xl font-bold text-slate-800">New Entry</Text>
          <TouchableOpacity 
            className="bg-indigo-600 px-6 py-2 rounded-full opacity-90 disabled:opacity-50"
            onPress={handlePost}
            disabled={loading || !content.trim() || !title.trim()}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-bold">Publish</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          {categories.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    className={`mr-3 px-5 py-2 rounded-full border ${categoryId === cat.id ? 'bg-indigo-600 border-indigo-600' : 'bg-transparent border-slate-200'}`}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text className={`font-semibold ${categoryId === cat.id ? 'text-white' : 'text-slate-600'}`}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <TextInput
            className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight"
            placeholder="Title"
            placeholderTextColor="#cbd5e1"
            value={title}
            onChangeText={setTitle}
            multiline
          />
          
          <TextInput
            className="text-xl text-slate-800 leading-relaxed"
            style={{ minHeight: 400 }}
            multiline
            placeholder="Share what is on your heart today..."
            placeholderTextColor="#94a3b8"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
