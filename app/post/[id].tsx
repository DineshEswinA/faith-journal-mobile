import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert, Keyboard } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { ChevronLeft, Heart, MessageCircle, Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const loadPost = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, likes(count), profiles(username, full_name), comments(*, profiles(username, full_name))')
      .eq('id', id)
      .single();
      
    if (data?.comments) {
      data.comments.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    let isLiked = false;
    if (user && data) {
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .match({ post_id: id, user_id: user.id })
        .single();
      isLiked = !!likeData;
    }

    setPost(data ? { 
      ...data, 
      isLiked,
      likes_count: data.likes?.[0]?.count || 0, 
      user_id: data.author_id,
      user: data.profiles 
    } : null);
    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    loadPost();
  }, [id, user?.id]);

  const handleLike = async () => {
    if (!user) return;
    const isCurrentlyLiked = post.isLiked;
    
    setPost({ 
      ...post, 
      isLiked: !isCurrentlyLiked, 
      likes_count: post.likes_count + (isCurrentlyLiked ? -1 : 1) 
    });

    if (isCurrentlyLiked) {
      await supabase.from('likes').delete().match({ post_id: id, user_id: user.id });
    } else {
      await supabase.from('likes').insert({ post_id: id, user_id: user.id });
    }
  };

  const submitComment = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'You must be signed in to add a comment.');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    const { error } = await supabase.from('comments').insert({
      post_id: id,
      user_id: user.id,
      content: newComment.trim()
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setNewComment('');
      Keyboard.dismiss();
      loadPost(); // Reload to fetch new comments
    }
    setSubmittingComment(false);
  };

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
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
              <Text className="text-indigo-700 font-bold text-lg">
                {(post.user?.full_name || post.user?.username) ? (post.user.full_name || post.user.username).substring(0, 1).toUpperCase() : 'U'}
              </Text>
            </TouchableOpacity>
            <View>
              <Text className="font-bold text-slate-800 text-lg">{post.user?.full_name || post.user?.username || 'Unknown Author'}</Text>
              <Text className="text-slate-400">
                {new Date(post.created_at).toLocaleString()}
              </Text>
            </View>
          </View>
          
          <Text className="text-2xl font-bold text-slate-900 mb-2">{post.title}</Text>
          <Text className="text-slate-800 text-lg mb-8 leading-relaxed">
            {typeof post.content === 'object' ? post.content?.body : post.content}
          </Text>
          
          <View className="flex-row items-center border-t border-b border-slate-100 py-4 mb-6">
          <TouchableOpacity className="flex-row items-center mr-8" onPress={handleLike}>
            <Heart size={24} color={post.isLiked ? "#ef4444" : "#94a3b8"} fill={post.isLiked ? "#ef4444" : "transparent"} />
            <Text className={`ml-2 font-medium text-lg ${post.isLiked ? 'text-red-500' : 'text-slate-500'}`}>{post.likes_count || 0}</Text>
          </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center">
              <MessageCircle size={24} color="#94a3b8" />
              <Text className="ml-2 font-medium text-slate-500 text-lg">Reply</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-xl font-bold text-slate-800 mb-4">Comments</Text>
            {!post.comments || post.comments.length === 0 ? (
              <Text className="text-slate-500">No comments yet. Be the first to reply!</Text>
            ) : (
              post.comments?.map((comment: any) => (
                <View key={comment.id} className="mb-4 bg-slate-50 p-4 rounded-xl">
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center mr-2">
                      <Text className="text-indigo-700 font-bold text-xs">
                        {(comment.profiles?.full_name || comment.profiles?.username) ? (comment.profiles.full_name || comment.profiles.username).substring(0, 1).toUpperCase() : '?'}
                      </Text>
                    </View>
                    <Text className="font-bold text-slate-800 mr-2">
                      {comment.profiles?.full_name || comment.profiles?.username || 'Unknown'}
                    </Text>
                    <Text className="text-xs text-slate-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-slate-700 leading-relaxed">{comment.content}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
        
        <View className="p-4 bg-white flex-row items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] elevation-10">
          <TextInput
            className="flex-1 bg-slate-50 pt-3 pb-3 px-4 rounded-full border border-slate-200 text-slate-800 mr-2 max-h-32"
            placeholder="Write a response..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            className={`w-12 h-12 rounded-full items-center justify-center ${newComment.trim() ? 'bg-indigo-600' : 'bg-slate-200'}`}
            onPress={submitComment}
            disabled={!newComment.trim() || submittingComment}
          >
            {submittingComment ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Send size={20} color={newComment.trim() ? "#fff" : "#94a3b8"} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
