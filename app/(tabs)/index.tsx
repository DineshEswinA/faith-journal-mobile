import PostCard from '@/components/PostCard';
import { getReadTime } from '@/lib/readTime';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { Menu } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          excerpt,
          content,
          created_at,
          likes(count),
          comments(count),
          bookmarks(count),
          author_id,
          profiles(username, full_name),
          categories(name)
        `)
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      let userLikes = new Set();
      let bkSet = new Set<string>();
      if (user && data && data.length > 0) {
        const postIds = data.map(p => p.id);
        const [{ data: likesData }, { data: bkData }] = await Promise.all([
          supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
          supabase.from('bookmarks').select('post_id').eq('user_id', user.id).in('post_id', postIds)
        ]);
        userLikes = new Set(likesData?.map(l => l.post_id) || []);
        bkSet = new Set(bkData?.map(b => b.post_id) || []);
      }
      setBookmarkedIds(bkSet);

      setPosts((data || []).map((post: any) => ({
        ...post,
        isLiked: userLikes.has(post.id),
        likes_count: post.likes?.[0]?.count || 0,
        comments_count: post.comments?.[0]?.count || 0,
        bookmarks_count: post.bookmarks?.[0]?.count || 0,
        user_id: post.author_id,
        user: post.profiles || {},
        category: post.categories?.name || 'Uncategorized',
      })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [user?.id, selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories();
    fetchPosts();
  }, [user?.id, selectedCategory]);

  // Helper fallbacks for aesthetics if actual image urls don't exist
  const getFeaturedImage = () => 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=3264&auto=format&fit=crop';
  const getStandardImage = (id: string) => `https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80&sig=${id}`;

  const handleBookmark = async (postId: string) => {
    if (!user) return;
    if (bookmarkedIds.has(postId)) {
      await supabase.from('bookmarks').delete().match({ user_id: user.id, post_id: postId });
      setBookmarkedIds(prev => { const next = new Set(prev); next.delete(postId); return next; });
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId });
      setBookmarkedIds(prev => new Set(prev).add(postId));
    }
  };

  const renderHeader = () => {
    const featured = posts[0];
    const editorsChoice = posts.slice(1, 4);

    return (
      <View className="bg-[#FAFAFA]">
        {/* Custom Header Area inside SafeAreaContext */}
        <SafeAreaView edges={['top']} className="bg-[#FAFAFA] flex-row justify-between items-center px-6 py-4">
          <TouchableOpacity className="w-8 justify-center">
            <Menu color="#333" size={24} />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center">
            <Text className="text-2xl font-bold text-slate-900 text-center" numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' }}>
              Faith Journal
            </Text>
          </View>
          <TouchableOpacity className="w-8 h-8 rounded-full overflow-hidden bg-slate-200" onPress={() => router.push('/(tabs)/profile')}>
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=1' }} className="w-full h-full" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Top Nav (Categories) */}
        <View className="border-b border-slate-100">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 24, alignItems: 'center' }}
            className="pb-6 pt-4"
          >
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Text className={`text-[9px] font-bold tracking-[2px] uppercase ${!selectedCategory ? 'text-[#047857]' : 'text-slate-400'}`}>FOR YOU</Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(cat.id)}>
                <Text className={`text-[9px] font-bold tracking-[2px] uppercase ${selectedCategory === cat.id ? 'text-[#047857]' : 'text-slate-400'}`}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-6 py-8">
          {/* Featured Post */}
          {featured && (
            <TouchableOpacity className="mb-12" activeOpacity={0.8} onPress={() => router.push(`/post/${featured.id}`)}>
              <View className="w-full h-56 rounded bg-slate-200 overflow-hidden mb-6">
                <Image source={{ uri: getFeaturedImage() }} className="w-full h-full" resizeMode="cover" />
              </View>
              <View className="flex-row items-center gap-x-2 mb-4">
                <Text className="text-[9px] font-bold text-[#047857] tracking-[2px] uppercase">{featured.category}</Text>
                <View className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                <Text className="text-[9px] font-bold text-slate-400 tracking-[2px] uppercase">{getReadTime(featured)}</Text>
              </View>
              <Text className="text-4xl font-bold text-slate-900 mb-4 leading-[42px]" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {featured.title}
              </Text>
              <Text className="text-base text-slate-600 leading-relaxed font-serif" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {featured.excerpt || "In an era of rapid expansion, some architects are choosing the path of stillness. Explore how negative space is becoming the most luxury amenity in new urban developments."}
              </Text>
            </TouchableOpacity>
          )}

          {/* Editors Choice */}
          {editorsChoice.length > 0 && (
            <View className="bg-[#ECF1ED] rounded-[24px] p-8 mb-12">
              <Text className="text-[9px] font-bold text-[#047857] tracking-[2px] uppercase mb-8">EDITOR'S CHOICE</Text>
              {editorsChoice.map((p, i) => (
                <TouchableOpacity key={p.id} className={`mb-6 ${i !== editorsChoice.length - 1 ? 'border-b border-slate-200/50 pb-6' : ''}`} activeOpacity={0.7} onPress={() => router.push(`/post/${p.id}`)}>
                  <Text className="text-lg font-bold text-slate-900 mb-3 leading-snug" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                    {p.title}
                  </Text>
                  <Text className="text-[9px] font-bold text-slate-500 tracking-[1.5px] uppercase">
                    BY {p.user?.full_name || p.user?.username || 'ANONYMOUS'} • {getReadTime(p)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Dispatches Title */}
          {posts.length > 4 && (
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[10px] font-bold text-slate-400 tracking-[3px] uppercase">LATEST DISPATCHES</Text>
              <Text className="text-[10px] font-bold text-[#047857] tracking-[3px] uppercase">VIEW ALL</Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  const remainingPosts = posts.slice(4);

  return (
    <TouchableWithoutFeedback onPress={() => { if (activeMenuPostId) setActiveMenuPostId(null); }}>
      <View className="flex-1 bg-[#FAFAFA]">
        <FlatList
          data={remainingPosts}
          keyExtractor={(item) => item.id}
          onScrollBeginDrag={() => { if (activeMenuPostId) setActiveMenuPostId(null); }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#047857" />
          }
          ListHeaderComponent={renderHeader}
          ItemSeparatorComponent={() => <View className="h-[1px] bg-slate-200 mx-6 mb-10 mt-2" />}
          renderItem={({ item, index }) => (
            <PostCard
              item={item}
              index={index}
              variant="sideBySide"
              isBookmarked={bookmarkedIds.has(item.id)}
              onBookmark={handleBookmark}
              activeMenuPostId={activeMenuPostId}
              onMenuToggle={(id) => setActiveMenuPostId(activeMenuPostId === id ? null : id)}
              showAuthor={true}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <View className="py-20 items-center">
                <Text className="text-slate-400 font-serif">A quiet space awaits its first entry.</Text>
              </View>
            ) : (
              <View className="py-20 items-center">
                <ActivityIndicator size="large" color="#047857" />
              </View>
            )
          }
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
