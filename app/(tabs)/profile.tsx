import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { getReadTime } from '@/lib/readTime';
import { Menu, Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '@/components/PostCard';

type Tab = 'published' | 'drafts' | 'saved';

export default function ProfileScreen() {
  const { signOut, user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('published');
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const loadProfileData = async () => {
      // Load user profile extra info
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfileData(dbProfile);

      // Load user's posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*, likes(count), comments(count), bookmarks(count), profiles(username, full_name), categories(name)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      // Load bookmarked posts
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('post_id, posts(*, likes(count), comments(count), bookmarks(count), categories(name), profiles(username, full_name))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const bookmarks = (bookmarksData || []).map((b: any) => b.posts).filter(Boolean);
      setBookmarkedPosts(bookmarks);

      // Load counts
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
      <View className="flex-1 items-center justify-center bg-[#FAFAFA]">
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  const displayAvatar = profileData?.avatar_url || user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/100?img=11';
  const displayName = profileData?.full_name || profileData?.username || user?.email?.split('@')[0] || 'Unknown User';
  const displayBio = profileData?.bio || "Spiritual seeker, storyteller, and lover of the Word. Sharing reflections on life and faith.";

  const feedList = activeTab === 'saved' 
    ? bookmarkedPosts 
    : posts.filter(p => activeTab === 'published' ? p.status === 'published' : p.status === 'draft');

  const renderHeader = () => (
    <View className="px-6 items-center pt-8 mb-8">
      <View className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 mb-6 shadow-sm">
        <Image source={{ uri: displayAvatar }} className="w-full h-full" resizeMode="cover" />
      </View>

      <Text className="text-3xl font-bold text-slate-900 mb-4 text-center tracking-tight">
        {displayName}
      </Text>

      <Text className="text-[15px] font-serif text-slate-500 text-center leading-relaxed px-4 mb-8">
        {displayBio}
      </Text>

      {/* Stats Bar */}
      <View className="w-full bg-[#F3F4F6] rounded-2xl py-5 px-6 flex-row justify-between items-center mb-8">
        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-slate-900">{stats.posts}</Text>
          <Text className="text-[9px] font-bold text-slate-400 tracking-[1.5px] uppercase mt-1">POSTS</Text>
        </View>
        <View className="w-[1px] h-8 bg-slate-200" />
        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-slate-900">{stats.followers > 999 ? (stats.followers / 1000).toFixed(1) + 'k' : stats.followers}</Text>
          <Text className="text-[9px] font-bold text-slate-400 tracking-[1.5px] uppercase mt-1">FOLLOWERS</Text>
        </View>
        <View className="w-[1px] h-8 bg-slate-200" />
        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-slate-900">{stats.following}</Text>
          <Text className="text-[9px] font-bold text-slate-400 tracking-[1.5px] uppercase mt-1">FOLLOWING</Text>
        </View>
      </View>

      {/* Buttons Row */}
      <View className="w-full flex-row gap-x-4 mb-8">
        <TouchableOpacity className="flex-1 bg-[#047857] rounded-xl py-4 items-center justify-center shadow-sm" onPress={() => router.push('/edit-profile')}>
          <Text className="text-white font-bold text-sm tracking-wide">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-white border border-slate-200 rounded-xl py-4 items-center justify-center shadow-sm" onPress={() => router.push('/settings')}>
          <Text className="text-slate-800 font-bold text-sm tracking-wide">Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Tabs */}
      <View className="flex-row items-center border-b border-slate-100 w-full gap-x-8 mb-6">
        {(['published', 'drafts', 'saved'] as Tab[]).map((tab) => {
          const label = tab === 'published' ? 'PUBLISHED' : tab === 'drafts' ? 'DRAFTS' : 'SAVED';
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className={`pb-3 px-1 ${isActive ? 'border-b-2 border-[#047857]' : ''}`}>
              <Text className={`font-bold text-[10px] tracking-[1.5px] uppercase ${isActive ? 'text-[#047857]' : 'text-slate-400'}`}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={() => { if(activeMenuPostId) setActiveMenuPostId(null); }}>
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
        {/* Header Navigation */}
        <View className="bg-[#FAFAFA] flex-row justify-between items-center px-6 py-4 border-b border-slate-100">
          <TouchableOpacity className="w-8 justify-center">
            <Menu color="#333" size={24} />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center">
            <Text className="text-xl font-bold text-slate-900 text-center" numberOfLines={1}>
              Profile
            </Text>
          </View>
          <TouchableOpacity className="w-8 items-end justify-center" onPress={() => router.push('/settings')}>
            <Settings color="#333" size={24} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={feedList}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ItemSeparatorComponent={() => <View className="h-[1px] bg-slate-200 mx-6 mb-10 mt-2" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          onScrollBeginDrag={() => { if (activeMenuPostId) setActiveMenuPostId(null); }}
          renderItem={({ item, index }) => (
            <PostCard
              item={item}
              index={index}
              showAuthor={activeTab === 'saved'}
              activeMenuPostId={activeMenuPostId}
              onMenuToggle={(id) => setActiveMenuPostId(activeMenuPostId === id ? null : id)}
            />
          )}
          ListEmptyComponent={
            <Text className="text-center font-serif text-slate-400 mt-10 italic">
              {activeTab === 'saved' ? 'No bookmarked posts yet.' : 'This journal is currently empty.'}
            </Text>
          }
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
