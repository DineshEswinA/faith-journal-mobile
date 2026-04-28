import Header from '@/components/Header';
import { DEFAULT_AVATAR_URL } from '@/constants/AppConstants';
import { getReadTime } from '@/lib/readTime';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bookmark, MoreVertical, Share2, UserPlus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '@/components/PostCard';
import { useAppTheme } from '@/hooks/useAppTheme';

const PAGE_SIZE = 5;

export default function AuthorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const { colors } = useAppTheme();

  const [author, setAuthor] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadAll();
  }, [id]);

  const loadAll = async () => {
    setLoading(true);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    setAuthor(profileData);

    const { data: postsData } = await supabase
      .from('posts')
      .select('*, likes(count), comments(count), bookmarks(count), categories(name), profiles(username, full_name, avatar_url)')
      .eq('author_id', id)
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1);
    setPosts(postsData || []);
    setHasMore((postsData?.length || 0) === PAGE_SIZE);

    const [{ count: postsCount }, { count: followersCount }, { count: followingCount }] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', id),
      supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', id),
      supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', id),
    ]);
    setStats({ posts: postsCount || 0, followers: followersCount || 0, following: followingCount || 0 });

    if (user) {
      if (id !== user.id) {
        const { data: followData } = await supabase
          .from('followers')
          .select('follower_id')
          .match({ follower_id: user.id, following_id: id })
          .single();
        setIsFollowing(!!followData);
      }

      const { data: bkData } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', user.id);
      if (bkData) {
        setBookmarkedIds(new Set(bkData.map((b: any) => b.post_id)));
      }
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!user || id === user.id) return;
    if (isFollowing) {
      await supabase.from('followers').delete().match({ follower_id: user.id, following_id: id });
      setIsFollowing(false);
      setStats(s => ({ ...s, followers: Math.max(0, s.followers - 1) }));
    } else {
      await supabase.from('followers').insert({ follower_id: user.id, following_id: id });
      setIsFollowing(true);
      setStats(s => ({ ...s, followers: s.followers + 1 }));
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user) return;
    const alreadyBookmarked = bookmarkedIds.has(postId);
    if (alreadyBookmarked) {
      await supabase.from('bookmarks').delete().match({ user_id: user.id, post_id: postId });
      setBookmarkedIds(prev => { const next = new Set(prev); next.delete(postId); return next; });
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId });
      setBookmarkedIds(prev => new Set(prev).add(postId));
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await supabase
      .from('posts')
      .select('*, likes(count), comments(count), bookmarks(count), categories(name), profiles(username, full_name, avatar_url)')
      .eq('author_id', id)
      .order('created_at', { ascending: false })
      .range(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE - 1);
    if (data && data.length > 0) {
      setPosts(prev => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAFAFA] dark:bg-[#111111]">
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  const displayAvatar = author?.avatar_url || DEFAULT_AVATAR_URL;
  const displayName = author?.full_name || author?.username || 'Anonymous';
  const displayBio = author?.bio || 'Spiritual seeker, storyteller, and lover of the Word. Sharing reflections on life and faith.';
  const isOwn = user?.id === id;

  const renderPost = ({ item, index }: { item: any; index: number }) => {
    return (
      <PostCard
        item={item}
        index={index}
        showAuthor={false}
        isBookmarked={bookmarkedIds.has(item.id)}
        onBookmark={handleBookmark}
        activeMenuPostId={activeMenuPostId}
        onMenuToggle={(id) => setActiveMenuPostId(activeMenuPostId === id ? null : id)}
        isFollowing={isFollowing}
        onFollow={handleFollow}
      />
    );
  };

  const ListHeader = () => (
    <View>
      {/* Author info */}
      <View className="items-center px-6 pt-10 pb-6">
        <View className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 mb-5 shadow-sm">
          <Image source={{ uri: displayAvatar }} className="w-full h-full" resizeMode="cover" />
        </View>
        <Text
          className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3 text-center tracking-tight"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
        >
          {displayName}
        </Text>
        <Text className="text-[15px] font-serif text-slate-500 dark:text-slate-400 text-center leading-relaxed px-4 mb-6">
          {displayBio}
        </Text>

        {/* Follow button */}
        {!isOwn && (
          <TouchableOpacity
            className={`w-full rounded-xl py-4 items-center justify-center mb-6 shadow-sm ${isFollowing ? 'bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-slate-700' : 'bg-[#047857]'}`}
            onPress={handleFollow}
          >
            <Text className={`font-bold text-[15px] ${isFollowing ? 'text-slate-700 dark:text-slate-300' : 'text-white'}`}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View className="w-full flex-row justify-between items-center bg-[#F3F4F6] dark:bg-[#222222] rounded-2xl py-5 px-6">
          <View className="items-center flex-1">
            <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.posts}</Text>
            <Text className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mt-1">POSTS</Text>
          </View>
          <View className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />
          <View className="items-center flex-1">
            <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats.followers > 999 ? (stats.followers / 1000).toFixed(1) + 'k' : stats.followers}
            </Text>
            <Text className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mt-1">FOLLOWERS</Text>
          </View>
          <View className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />
          <View className="items-center flex-1">
            <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.following}</Text>
            <Text className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mt-1">FOLLOWING</Text>
          </View>
        </View>
      </View>

      {/* Section header */}
      <View className="px-6 flex-row justify-between items-center mb-6 mt-4 border-t border-slate-100 dark:border-slate-800 pt-6">
        <Text className="text-[13px] font-bold text-slate-900 dark:text-slate-100 tracking-tight"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          Latest Stories
        </Text>
        <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1px] uppercase">{stats.posts} TOTAL</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]" edges={['top']}>
      {/* Header */}
      <Header rightAction="share" />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ItemSeparatorComponent={() => <View className="h-[1px] bg-slate-200 dark:bg-slate-800 mx-6 mb-10 mt-2" />}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        onScrollBeginDrag={() => { if (activeMenuPostId) setActiveMenuPostId(null); }}
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              className="mx-6 mb-10 border border-slate-200 dark:border-slate-700 rounded-xl py-4 items-center"
              onPress={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color="#047857" />
              ) : (
                <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[2px] uppercase">Load More Archive</Text>
              )}
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center py-16 px-6">
            <Text className="font-serif italic text-slate-400 dark:text-slate-500 text-center">No stories published yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
