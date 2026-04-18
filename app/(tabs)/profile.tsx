import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '@/components/PostCard';
import { Settings, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { signOut, user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const loadProfileData = async () => {
      // Load user's posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load counts (Using rough estimates or explicit count queries)
      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      const { count: followingCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      setPosts(postsData || []);
      setStats({
        followers: followersCount || 0,
        following: followingCount || 0,
        posts: postsData?.length || 0
      });
      setLoading(false);
    };

    loadProfileData();
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-slate-800">Profile</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => {/* router.push settings */}}>
              <Settings size={24} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity onPress={signOut}>
              <LogOut size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6 items-center">
          <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center mb-4">
            <Text className="text-indigo-700 font-bold text-4xl">
              {user?.email ? user.email.substring(0, 1).toUpperCase() : '?'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-slate-800">{user?.email}</Text>
          
          <View className="flex-row gap-x-8 mt-6">
            <View className="items-center">
              <Text className="text-lg font-bold text-slate-800">{stats.posts}</Text>
              <Text className="text-slate-500">Posts</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-slate-800">{stats.followers}</Text>
              <Text className="text-slate-500">Followers</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-slate-800">{stats.following}</Text>
              <Text className="text-slate-500">Following</Text>
            </View>
          </View>
        </View>

        <Text className="text-xl font-bold text-slate-800 mb-4 px-2">Your Entries</Text>
        
        {posts.length === 0 ? (
          <Text className="text-center text-slate-400 mt-10">You haven't posted yet.</Text>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={{...post, user: {email: user?.email || ''} }} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
