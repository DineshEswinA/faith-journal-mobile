import AsyncStorage from '@react-native-async-storage/async-storage';
import PostCard from '@/components/PostCard';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Clock, Menu, Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RECENT_SEARCHES_STORAGE_KEY = 'explore_recent_searches';
const MAX_RECENT_SEARCHES = 8;

const POST_SELECT = `
  id,
  title,
  excerpt,
  content,
  created_at,
  cover_image,
  category_id,
  author_id,
  likes(count),
  comments(count),
  bookmarks(count),
  categories(name),
  profiles(full_name, username, avatar_url)
`;

type Category = {
  id: string;
  name: string;
  slug: string | null;
};

const buildRecentSearchesKey = (userId?: string) =>
  `${RECENT_SEARCHES_STORAGE_KEY}:${userId ?? 'guest'}`;

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    bootstrapExplore();
  }, [user?.id]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      runSearch(query, selectedCategory?.id ?? null);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, selectedCategory?.id]);

  const bootstrapExplore = async () => {
    setIsBootstrapping(true);
    try {
      await Promise.all([loadTrendingCategories(), loadRecentSearches()]);
      await loadRecommended(selectedCategory?.id ?? null);
    } finally {
      setIsBootstrapping(false);
    }
  };

  const normalizePosts = (data: any[] | null) =>
    (data || []).map((post: any) => ({
      ...post,
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0,
      bookmarks_count: post.bookmarks?.[0]?.count || 0,
      user: post.profiles || {},
      category: post.categories?.name || 'Uncategorized',
    }));

  const loadTrendingCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, slug').order('name');
    setCategories(data || []);
  };

  const loadRecentSearches = async () => {
    const stored = await AsyncStorage.getItem(buildRecentSearchesKey(user?.id));
    setRecentSearches(stored ? JSON.parse(stored) : []);
  };

  const persistRecentSearches = async (next: string[]) => {
    setRecentSearches(next);
    await AsyncStorage.setItem(buildRecentSearchesKey(user?.id), JSON.stringify(next));
  };

  const saveRecentSearch = async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return;

    const next = [
      trimmed,
      ...recentSearches.filter(
        (item) => item.toLocaleLowerCase() !== trimmed.toLocaleLowerCase()
      ),
    ].slice(0, MAX_RECENT_SEARCHES);

    await persistRecentSearches(next);
  };

  const loadRecommended = async (categoryId: string | null = null) => {
    let request = supabase
      .from('posts')
      .select(POST_SELECT)
      .order('created_at', { ascending: false })
      .limit(6);

    if (categoryId) {
      request = request.eq('category_id', categoryId);
    }

    const { data } = await request;
    setRecommended(normalizePosts(data));
  };

  const runSearch = async (value: string, categoryId: string | null = selectedCategory?.id ?? null) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setPosts([]);
      setLoading(false);
      await loadRecommended(categoryId);
      return;
    }

    setLoading(true);

    let request = supabase
      .from('posts')
      .select(POST_SELECT)
      .or(`title.ilike.%${trimmed}%,excerpt.ilike.%${trimmed}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (categoryId) {
      request = request.eq('category_id', categoryId);
    }

    const { data } = await request;
    setPosts(normalizePosts(data));
    setLoading(false);
  };

  const clearSearch = () => {
    setQuery('');
    setPosts([]);
  };

  const removeRecent = async (item: string) => {
    await persistRecentSearches(recentSearches.filter((recent) => recent !== item));
  };

  const clearRecentSearches = async () => {
    await persistRecentSearches([]);
  };

  const handleRecentPress = async (item: string) => {
    await saveRecentSearch(item);
    setQuery(item);
  };

  const handleCategoryPress = async (category: Category) => {
    const nextCategory = selectedCategory?.id === category.id ? null : category;
    setSelectedCategory(nextCategory);

    if (!query.trim()) {
      await loadRecommended(nextCategory?.id ?? null);
      return;
    }

    await runSearch(query, nextCategory?.id ?? null);
  };

  const displayList = query.length >= 2 ? posts : recommended;

  const renderHeader = () => (
    <View>
      {query.length === 0 && (
        <>
          {/* Recent Searches */}
          <View className="px-6 mb-8 mt-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase">RECENT SEARCHES</Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text className="text-[11px] font-bold text-[#047857]">Clear all</Text>
              </TouchableOpacity>
            </View>
            {recentSearches.map((item) => (
              <View key={item} className="flex-row items-center justify-between py-3 border-b border-slate-50">
                <TouchableOpacity className="flex-row items-center gap-x-3 flex-1 pr-4" onPress={() => handleRecentPress(item)}>
                  <Clock size={16} color="#94a3b8" />
                  <Text className="text-[15px] text-slate-700 font-serif">{item}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeRecent(item)}>
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}

      <View className="px-6 mb-8">
        <Text className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase mb-4">TRENDING CATEGORIES</Text>
        <View className="flex-row flex-wrap gap-3">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleCategoryPress(cat)}
              className={`px-4 py-2 rounded-xl shadow-sm border ${
                selectedCategory?.id === cat.id ? 'bg-[#047857] border-[#047857]' : 'bg-white border-slate-200'
              }`}
            >
              <Text className={`text-[13px] font-bold ${selectedCategory?.id === cat.id ? 'text-white' : 'text-slate-700'}`}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List Header Label */}
      <View className="px-6">
        <Text className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase mb-6">
          {query.length >= 2 ? 'SEARCH RESULTS' : 'RECOMMENDED FOR YOU'}
        </Text>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={() => { if(activeMenuPostId) setActiveMenuPostId(null); }}>
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
        {/* Persistent Search Bar Header */}
        <View>
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-100">
            <TouchableOpacity className="w-8 justify-center">
              <Menu color="#333" size={24} />
            </TouchableOpacity>
            <View className="flex-1 items-center justify-center">
              <Text className="text-2xl font-bold text-slate-900 text-center" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' }}>
                Search
              </Text>
            </View>
            <View className="w-8 h-8 rounded-full overflow-hidden bg-slate-200">
              <Image source={{ uri: 'https://i.pravatar.cc/100?img=11' }} className="w-full h-full" />
            </View>
          </View>

          <View className="px-5 py-4">
            <View className="bg-[#F3F4F6] rounded-2xl flex-row items-center px-4 py-3.5">
              <Search size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 text-slate-800 text-[15px] mx-3"
                placeholder="Search for posts, authors, or topics..."
                placeholderTextColor="#94a3b8"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                onSubmitEditing={() => saveRecentSearch(query)}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {loading || isBootstrapping ? (
          <ActivityIndicator color="#047857" className="mt-10" />
        ) : (
          <FlatList
            data={displayList}
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
                activeMenuPostId={activeMenuPostId}
                onMenuToggle={(id) => setActiveMenuPostId(activeMenuPostId === id ? null : id)}
              />
            )}
            ListEmptyComponent={
              query.length >= 2 ? (
                <Text className="text-center font-serif italic text-slate-400 mt-10">No results found for "{query}"</Text>
              ) : (
                <Text className="text-center font-serif italic text-slate-400 mt-10">
                  {selectedCategory ? `No posts found in ${selectedCategory.name}.` : 'No posts available yet.'}
                </Text>
              )
            }
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
