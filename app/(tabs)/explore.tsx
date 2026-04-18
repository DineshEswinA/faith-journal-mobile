import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { getReadTime } from '@/lib/readTime';
import { Clock, Menu, Search, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '@/components/PostCard';

const TRENDING_CATEGORIES = ['Gospels', 'Stories', 'Mime Ideas', 'Salvations', 'Ministries', 'Daily Bread', 'Musics'];
const RECENT_SEARCHES = ['The Parables of Mercy', 'Modern Ministry in Cities', 'Worship Music 2024'];

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const [loading, setLoading] = useState(false);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadRecommended();
  }, []);

  const loadRecommended = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, categories(name), profiles(full_name, username)')
      .order('created_at', { ascending: false })
      .limit(6);
    setRecommended(data || []);
  };

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setPosts([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*, likes(count), comments(count), bookmarks(count), categories(name), profiles(full_name, username)')
      .ilike('title', `%${q}%`)
      .limit(20);
    setPosts(data || []);
    setLoading(false);
  };

  const clearSearch = () => {
    setQuery('');
    setPosts([]);
  };

  const removeRecent = (item: string) => {
    setRecentSearches(prev => prev.filter(r => r !== item));
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
              <TouchableOpacity onPress={() => setRecentSearches([])}>
                <Text className="text-[11px] font-bold text-[#047857]">Clear all</Text>
              </TouchableOpacity>
            </View>
            {recentSearches.map((item) => (
              <View key={item} className="flex-row items-center justify-between py-3 border-b border-slate-50">
                <View className="flex-row items-center gap-x-3">
                  <Clock size={16} color="#94a3b8" />
                  <Text className="text-[15px] text-slate-700 font-serif">{item}</Text>
                </View>
                <TouchableOpacity onPress={() => removeRecent(item)}>
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Trending Categories */}
          <View className="px-6 mb-8">
            <Text className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase mb-4">TRENDING CATEGORIES</Text>
            <View className="flex-row flex-wrap gap-3">
              {TRENDING_CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat} className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                  <Text className="text-[13px] font-bold text-slate-700">{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

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
                onChangeText={handleSearch}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {loading ? (
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
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
