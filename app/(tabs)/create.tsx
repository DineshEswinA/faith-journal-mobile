import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateScreen() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const handlePost = async () => {
    if (!content.trim()) return;
    if (!user) return;

    setLoading(true);
    
    const { error } = await supabase
      .from('posts')
      .insert({
        content: content.trim(),
        user_id: user.id,
      });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
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
        <View className="flex-1 p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-slate-800">Write an Entry</Text>
            <TouchableOpacity 
              className="bg-indigo-600 px-6 py-2 rounded-full opacity-90 disabled:opacity-50"
              onPress={handlePost}
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold">Post</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <TextInput
            className="flex-1 text-lg text-slate-800"
            multiline
            placeholder="What's on your heart today? Share a testimony, scripture, or prayer..."
            placeholderTextColor="#94a3b8"
            value={content}
            onChangeText={setContent}
            autoFocus
            textAlignVertical="top"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
