import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { ChevronLeft, Heart, MessageCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    
    const loadPost = async () => {
      const { data } = await supabase
        .from('posts')
        .select(`*, user_id`)
        .eq('id', id)
        .single();
        
      setPost(data);
      setLoading(false);
    };

    loadPost();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text>Post not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-2 border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={28} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Entry</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mr-4"
            onPress={() => router.push(`/user/${post.user_id}`)}
          >
            <Text className="text-indigo-700 font-bold text-lg">U</Text>
          </TouchableOpacity>
          <View>
            <Text className="font-bold text-slate-800 text-lg">User UUID: {post.user_id?.substring(0,8)}</Text>
            <Text className="text-slate-400">
              {new Date(post.created_at).toLocaleString()}
            </Text>
          </View>
        </View>
        
        <Text className="text-slate-800 text-lg mb-8 leading-relaxed">
          {post.content}
        </Text>
        
        <View className="flex-row items-center border-t border-slate-100 pt-6">
          <TouchableOpacity className="flex-row items-center mr-8">
            <Heart size={24} color="#94a3b8" />
            <Text className="ml-2 font-medium text-slate-500 text-lg">{post.likes_count || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center">
            <MessageCircle size={24} color="#94a3b8" />
            <Text className="ml-2 font-medium text-slate-500 text-lg">Reply</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
