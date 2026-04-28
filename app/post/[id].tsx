import { DEFAULT_AVATAR_URL } from '@/constants/AppConstants';
import { getReadTime } from '@/lib/readTime';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, ChevronLeft, Heart, MessageCircle, Send, Share2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '@/components/PostCard';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [suggestedPosts, setSuggestedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const commentSectionY = useRef(0);
  const { colors } = useAppTheme();

  const loadPost = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, likes(count), profiles(username, full_name, bio, avatar_url), comments(*, profiles(username, full_name, avatar_url)), categories(name)')
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
      user: data.profiles,
      category: data.categories?.name || 'UNCATEGORIZED',
    } : null);

    const { data: suggestions } = await supabase
      .from('posts')
      .select('*, likes(count), comments(count), bookmarks(count), categories(name), profiles(username, full_name, avatar_url)')
      .neq('id', id)
      .limit(3);
    setSuggestedPosts(suggestions || []);

    setLoading(false);
  };

  const loadBookmarkStatus = async () => {
    if (!user || !id) return;
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .single();
    setIsBookmarked(!!data);
  };

  useEffect(() => {
    if (!id) return;
    loadPost();
    loadBookmarkStatus();
  }, [id, user?.id]);

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'You must be signed in to like a post.');
      return;
    }
    if (isLiking) return;

    const isCurrentlyLiked = post.isLiked;
    const previousCount = post.likes_count;

    setIsLiking(true);
    setPost((prev: any) => ({
      ...prev,
      isLiked: !isCurrentlyLiked,
      likes_count: prev.likes_count + (isCurrentlyLiked ? -1 : 1),
    }));

    const { error } = isCurrentlyLiked
      ? await supabase.from('likes').delete().match({ post_id: id, user_id: user.id })
      : await supabase.from('likes').insert({ post_id: id, user_id: user.id });

    if (error) {
      setPost((prev: any) => ({
        ...prev,
        isLiked: isCurrentlyLiked,
        likes_count: previousCount,
      }));
      Alert.alert('Error', 'Could not update like. Please try again.');
    }

    setIsLiking(false);
  };

  const handleBookmark = async () => {
    if (!user || !id) return;
    if (isBookmarked) {
      await supabase.from('bookmarks').delete().match({ user_id: user.id, post_id: id });
      setIsBookmarked(false);
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: id });
      setIsBookmarked(true);
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
      loadPost();
    }
    setSubmittingComment(false);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#FAFAFA] dark:bg-[#111111] items-center justify-center">
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 bg-[#FAFAFA] dark:bg-[#111111] items-center justify-center">
        <Text className="font-serif text-slate-500 dark:text-slate-400">The requested entry could not be found.</Text>
        <TouchableOpacity className="mt-4 px-6 py-2 bg-[#047857] rounded-full" onPress={() => router.back()}>
          <Text className="text-white font-bold tracking-wider">GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const postContent = typeof post.content === 'object' ? post.content?.body : post.content;
  const cleanContent = postContent || "No content available.";
  const displayImage = post.cover_image || `https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=3264&auto=format&fit=crop`;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >

        {/* Custom Header */}
        <View className="bg-[#FAFAFA] dark:bg-[#111111] flex-row justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <TouchableOpacity className="w-8 justify-center" onPress={() => router.back()}>
            <ChevronLeft color={colors.icon} size={28} />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center">
            <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center" numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' }}>
              FaithJournal
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ paddingBottom: 60 }}
        >

          <View className="px-6 pt-10 pb-6 items-center">
            <Text className="text-[10px] font-bold text-[#047857] tracking-[2px] uppercase mb-4">{post.category}</Text>
            <Text className="text-[32px] font-bold text-slate-900 dark:text-slate-100 text-center leading-tight mb-6" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              {post.title}
            </Text>

            <View className="flex-row items-center justify-center gap-x-3 mb-6">
              <View className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                <Image source={{ uri: post.user?.avatar_url || DEFAULT_AVATAR_URL }} className="w-full h-full" />
              </View>
              <TouchableOpacity onPress={() => router.push(`/author/${post.author_id}` as any)}>
                <Text className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-[1px]">{post.user?.full_name || post.user?.username || 'Unknown Author'}</Text>
              </TouchableOpacity>
              <View className="w-0.5 h-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[1px]">
                {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : ''}
              </Text>
              <View className="w-0.5 h-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[1px]">{getReadTime(post)}</Text>
            </View>
          </View>

          <View className="px-6 mb-8">
            <View className="w-full h-[220px] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
              <Image source={{ uri: displayImage }} className="w-full h-full" resizeMode="cover" />
            </View>
            <Text className="text-center font-serif italic text-xs text-slate-400 dark:text-slate-500 mt-3">Photography by Art Unsplash</Text>
          </View>

          <View className="px-6 mb-12">
            <Text className="text-[17px] text-slate-800 dark:text-slate-200 leading-[32px]" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              {cleanContent}
            </Text>
          </View>

          {/* Action / Reaction Bar */}
          <View className="px-6 flex-row items-center justify-between py-6 border-t border-slate-200 dark:border-slate-800 mb-10">
            <View className="flex-row gap-x-6 items-center">
              <TouchableOpacity className="flex-row items-center gap-x-2" onPress={handleLike} disabled={isLiking}>
                <Heart size={20} color={post.isLiked ? "#047857" : colors.iconMid} fill={post.isLiked ? "#047857" : "transparent"} />
                {post.likes_count > 0 && <Text className="font-bold text-slate-500 dark:text-slate-400 text-xs">{post.likes_count}</Text>}
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center gap-x-2" onPress={() => {
                const next = !showComments;
                setShowComments(next);
                if (next) {
                  setTimeout(() => {
                    scrollRef.current?.scrollTo({ y: commentSectionY.current, animated: true });
                  }, 100);
                }
              }}>
                <MessageCircle size={20} color={colors.iconMid} />
                {post.comments?.length > 0 && <Text className="font-bold text-slate-500 dark:text-slate-400 text-xs">{post.comments.length}</Text>}
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-x-6 items-center">
              <TouchableOpacity onPress={handleBookmark}>
                <Bookmark size={20} color={isBookmarked ? '#047857' : colors.iconMid} fill={isBookmarked ? '#047857' : 'transparent'} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Share2 size={20} color={colors.iconMid} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Author Block */}
          <View className="px-6 mb-12">
            <View className="bg-[#F3F4F6] dark:bg-[#222222] rounded-[24px] p-6">
              <TouchableOpacity onPress={() => router.push(`/author/${post.author_id}` as any)} className="flex-row items-center gap-x-4 mb-4">
                <View className="w-14 h-14 rounded-xl overflow-hidden bg-slate-300 dark:bg-slate-600">
                  <Image source={{ uri: post.user?.avatar_url || DEFAULT_AVATAR_URL }} className="w-full h-full" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                    {post.user?.full_name || post.user?.username || 'Unknown Author'}
                  </Text>
                  <Text className="text-[9px] font-bold text-[#047857] tracking-[2px] uppercase">AUTHOR & CREATOR</Text>
                </View>
              </TouchableOpacity>
              <Text className="font-serif text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {post.user?.bio || "A passionate writer dedicating space to thoughtful narratives and exploring the intersection between daily life and eternal truths."}
              </Text>
              <TouchableOpacity onPress={() => router.push(`/author/${post.author_id}` as any)}>
                <Text className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider">View all articles -{'>'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lazy Comments Section (Toggleable) */}
          {showComments && (
            <View
              className="px-6 py-8 bg-white dark:bg-[#1A1A1A] border-t border-slate-100 dark:border-slate-800"
              onLayout={(e) => { commentSectionY.current = e.nativeEvent.layout.y; }}
            >
              <Text className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 font-serif">Comments</Text>

              <View className="flex-row items-center mb-6">
                <TextInput
                  className="flex-1 bg-slate-50 dark:bg-[#222222] pt-3 pb-3 px-5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 mr-3 h-12"
                  placeholder="Share your thoughts..."
                  placeholderTextColor={colors.placeholder}
                  value={newComment}
                  onChangeText={setNewComment}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollTo({ y: commentSectionY.current, animated: true });
                    }, 300);
                  }}
                />
                <TouchableOpacity
                  className={`w-12 h-12 rounded-full items-center justify-center ${newComment.trim() ? 'bg-[#047857]' : 'bg-slate-200 dark:bg-slate-700'}`}
                  onPress={submitComment}
                  disabled={!newComment.trim() || submittingComment}
                >
                  {submittingComment ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Send size={18} color={newComment.trim() ? "#fff" : colors.iconMuted} />
                  )}
                </TouchableOpacity>
              </View>

              {!post.comments || post.comments.length === 0 ? (
                <Text className="text-slate-500 dark:text-slate-400 font-serif italic text-center">No thoughts shared yet.</Text>
              ) : (
                post.comments?.map((comment: any) => (
                  <View key={comment.id} className="mb-4 bg-slate-50 dark:bg-[#222222] p-5 rounded-2xl">
                    <View className="flex-row items-center mb-3">
                      <View className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full items-center justify-center mr-3 overflow-hidden">
                        <Image source={{ uri: comment.profiles?.avatar_url || DEFAULT_AVATAR_URL }} className="w-full h-full" />
                      </View>
                      <Text className="font-bold text-slate-800 dark:text-slate-200 mr-2 text-sm">
                        {comment.profiles?.full_name || comment.profiles?.username || 'Unknown'}
                      </Text>
                      <Text className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text className="text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-sm">{comment.content}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Continue Your Journey (Similar Posts) */}
          <View className="bg-[#FAFAFA] dark:bg-[#111111] pt-8 px-6 border-t border-slate-100 dark:border-slate-800">
            <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              Continue Your Journey
            </Text>

            {suggestedPosts.slice(0, 2).map((sPost: any, index: number) => (
              <View key={sPost.id} className="mx-[-24px]">
                <PostCard
                  item={sPost}
                  index={index}
                  showAuthor={true}
                />
                {index < suggestedPosts.slice(0, 2).length - 1 && (
                  <View className="h-[1px] bg-slate-200 dark:bg-slate-800 mx-6 mb-10 mt-2" />
                )}
              </View>
            ))}

            {/* Green Promo Item inline */}
            <View className="bg-[#047857] rounded-xl p-6 mb-8 mt-2">
              <Text className="text-3xl font-bold text-white mb-2" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                Start your own story
              </Text>
              <Text className="text-white/80 font-serif text-sm leading-relaxed mb-6">
                Join our community of intentional creators and publish your thoughts.
              </Text>
              <TouchableOpacity className="bg-white rounded-full py-3 px-6 self-start" onPress={() => router.push('/(tabs)/create')}>
                <Text className="text-[#047857] font-bold text-xs tracking-widest uppercase">WRITE TO WRITE</Text>
              </TouchableOpacity>
            </View>

            {suggestedPosts[2] && (
              <TouchableOpacity className="mb-8" onPress={() => router.push(`/post/${suggestedPosts[2].id}`)} activeOpacity={0.8}>
                <View className="w-full h-48 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 mb-4">
                  <Image source={{ uri: `https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80&sig=4` }} className="w-full h-full" />
                </View>
                <Text className="text-[9px] font-bold text-[#047857] tracking-[2px] uppercase mb-2">
                  {suggestedPosts[2].categories?.name || 'UNCATEGORIZED'}
                </Text>
                <Text className="text-[22px] font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                  {suggestedPosts[2].title}
                </Text>
                <Text className="text-sm font-serif text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {suggestedPosts[2].excerpt || "A quiet exploration of the things that matter most."}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
