import Header from '@/components/Header';
import { DEFAULT_AVATAR_URL } from '@/constants/AppConstants';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { getReadTime } from '@/lib/readTime';
import { Menu, Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '@/components/PostCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSideDrawer } from '@/components/SideDrawerProvider';

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
  const { colors } = useAppTheme();
  const { openDrawer } = useSideDrawer();

  useEffect(() => {
    if (!user) return;

    const loadProfileData = async () => {
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfileData(dbProfile);

      const { data: postsData } = await supabase
        .from('posts')
        .select('*, likes(count), comments(count), bookmarks(count), profiles(username, full_name, avatar_url), categories(name)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('post_id, posts(*, likes(count), comments(count), bookmarks(count), categories(name), profiles(username, full_name, avatar_url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const bookmarks = (bookmarksData || []).map((b: any) => b.posts).filter(Boolean);
      setBookmarkedPosts(bookmarks);

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
      <View className="flex-1 items-center justify-center bg-[#FAFAFA] dark:bg-[#111111]">
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  const displayAvatar = profileData?.avatar_url || user?.user_metadata?.avatar_url || DEFAULT_AVATAR_URL;
  const displayName = profileData?.full_name || profileData?.username || user?.email?.split('@')[0] || 'Unknown User';
  const displayBio = profileData?.bio || "Spiritual seeker, storyteller, and lover of the Word. Sharing reflections on life and faith.";

  const feedList = activeTab === 'saved'
    ? bookmarkedPosts
    : posts.filter(p => activeTab === 'published' ? p.status === 'published' : p.status === 'draft');

  const renderHeader = () => (
    <View className="px-6 items-center pt-8 mb-8">
      <View className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 mb-6 shadow-sm">
        <Image source={{ uri: displayAvatar }} className="w-full h-full" resizeMode="cover" />
      </View>

      <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 text-center tracking-tight">
        {displayName}
      </Text>

      <Text className="text-[15px] font-serif text-slate-500 dark:text-slate-400 text-center leading-relaxed px-4 mb-8">
        {displayBio}
      </Text>

      {/* Stats Bar */}
      <View className="w-full bg-[#F3F4F6] dark:bg-[#222222] rounded-2xl py-5 px-6 flex-row justify-between items-center mb-8">
        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.posts}</Text>
          <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mt-1">POSTS</Text>
        </View>
        <View className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />
        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.followers > 999 ? (stats.followers / 1000).toFixed(1) + 'k' : stats.followers}</Text>
          <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mt-1">FOLLOWERS</Text>
        </View>
        <View className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />
        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.following}</Text>
          <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mt-1">FOLLOWING</Text>
        </View>
      </View>

      {/* Buttons Row */}
      <View className="w-full flex-row gap-x-4 mb-8">
        <TouchableOpacity className="flex-1 bg-[#047857] rounded-xl py-4 items-center justify-center shadow-sm" onPress={() => router.push('/edit-profile')}>
          <Text className="text-white font-bold text-sm tracking-wide">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-slate-700 rounded-xl py-4 items-center justify-center shadow-sm" onPress={() => router.push('/settings')}>
          <Text className="text-slate-800 dark:text-slate-200 font-bold text-sm tracking-wide">Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Tabs */}
      <View className="flex-row items-center border-b border-slate-100 dark:border-slate-800 w-full gap-x-8 mb-6">
        {(['published', 'drafts', 'saved'] as Tab[]).map((tab) => {
          const label = tab === 'published' ? 'PUBLISHED' : tab === 'drafts' ? 'DRAFTS' : 'SAVED';
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className={`pb-3 px-1 ${isActive ? 'border-b-2 border-[#047857]' : ''}`}>
              <Text className={`font-bold text-[10px] tracking-[1.5px] uppercase ${isActive ? 'text-[#047857]' : 'text-slate-400 dark:text-slate-500'}`}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]" edges={['top']}>
      {/* Header Navigation */}
      <Header title="Profile" titleStyle="sans" leftAction="menu" rightAction="settings" />

      <FlatList
        data={feedList}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader()}
        ItemSeparatorComponent={() => <View className="h-[1px] bg-slate-200 dark:bg-slate-800 mx-4 mb-6" />}
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
          <Text className="text-center font-serif text-slate-400 dark:text-slate-500 mt-10 italic">
            {activeTab === 'saved' ? 'No bookmarked posts yet.' : 'This journal is currently empty.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}
