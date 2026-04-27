import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import PostCard from '@/components/PostCard';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    
    const loadUserMode = async () => {
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();
        
      const { data: postsData } = await supabase
        .from('posts')
        .select('*, likes(count), comments(count), bookmarks(count), categories(name), profiles(full_name, username, avatar_url)')
        .eq('author_id', id)
        .order('created_at', { ascending: false });

      if (user) {
        const { data: followData } = await supabase
          .from('followers')
          .select('*')
          .match({ follower_id: user.id, following_id: id })
          .single();
        setIsFollowing(!!followData);
      }

      setProfile(userData || { user_id: id, email: 'User' });
      setPosts(postsData || []);
      setLoading(false);
    };

    loadUserMode();
  }, [id, user]);

  const handleFollowToggle = async () => {
    if (!user || !profile) return;
    setIsFollowing(!isFollowing);

    if (isFollowing) {
      await supabase.from('followers').delete().match({ follower_id: user.id, following_id: profile.user_id });
    } else {
      await supabase.from('followers').insert({ follower_id: user.id, following_id: profile.user_id });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-4 py-2 border-b border-slate-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={28} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6 items-center">
          <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center mb-4">
            <Text className="text-indigo-700 font-bold text-4xl">
              {profile?.email ? profile.email.substring(0, 1).toUpperCase() : '?'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-slate-800 mb-6">{profile?.email}</Text>
          
          {user?.id !== profile.user_id && (
            <TouchableOpacity 
              className={`px-8 py-3 rounded-full ${isFollowing ? 'bg-slate-100' : 'bg-indigo-600'}`}
              onPress={handleFollowToggle}
            >
              <Text className={`font-bold ${isFollowing ? 'text-slate-600' : 'text-white'}`}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-xl font-bold text-slate-800 mb-4 px-2">Entries</Text>
        
        {posts.length === 0 ? (
          <Text className="text-center text-slate-400 mt-10">No posts from this user.</Text>
        ) : (
          posts.map((post, index) => (
            <PostCard key={post.id} item={{ ...post, user: post.profiles || profile }} index={index} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
