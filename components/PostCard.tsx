import { getReadTime } from '@/lib/readTime';
import { useRouter } from 'expo-router';
import { Bookmark, Heart, MessageCircle, MoreVertical, Share2, UserPlus } from 'lucide-react-native';
import { Alert, Image, Platform, Text, TouchableOpacity, View } from 'react-native';

export type PostCardProps = {
  item: any;
  index: number;
  showAuthor?: boolean;
  variant?: 'default' | 'sideBySide';
  isBookmarked?: boolean;
  onBookmark?: (postId: string) => void;
  activeMenuPostId?: string | null;
  onMenuToggle?: (postId: string) => void;
  onFollow?: () => void;
  isFollowing?: boolean;
};

export default function PostCard({
  item,
  index,
  showAuthor = true,
  variant = 'default',
  isBookmarked = false,
  onBookmark,
  activeMenuPostId,
  onMenuToggle,
  onFollow,
  isFollowing = false,
}: PostCardProps) {
  const router = useRouter();

  // Fallback images if actual ones don't exist
  const coverImg = item.cover_image || `https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80&sig=${item.id || index}`;
  const catName = item.category || item.categories?.name?.toUpperCase() || 'STORY';
  const dateStr = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const authorAvatar = item.user?.avatar_url || `https://i.pravatar.cc/100?img=${index + 10}`;
  const authorName = item.user?.full_name || item.user?.username || 'Anonymous';

  const handleCardPress = () => {
    if (activeMenuPostId) {
      onMenuToggle?.(item.id);
    } else {
      router.push(`/post/${item.id}` as any);
    }
  };

  if (variant === 'sideBySide') {
    return (
      <View className="mb-5 px-6">
        <TouchableOpacity activeOpacity={0.85} onPress={handleCardPress}>
          <View className="flex-row items-start gap-x-4">
            <View className="flex-1 pr-1">
              <View className="flex-row items-center gap-x-2 mb-3">
                <Text className="text-[9px] font-bold text-[#047857] tracking-[1.5px] uppercase">{catName}</Text>
                <View className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-[1px]">{getReadTime(item)}</Text>
              </View>

              <Text
                className="text-[18px] font-bold text-slate-900 leading-7 mb-3"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                numberOfLines={3}
              >
                {item.title}
              </Text>

              {item.excerpt ? (
                <Text
                  className="text-[13px] text-slate-500 leading-5 mb-4"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                  numberOfLines={3}
                >
                  {item.excerpt}
                </Text>
              ) : null}

              {showAuthor && (
                <View className="flex-row items-center gap-x-2">
                  <View className="w-5 h-5 rounded-full bg-slate-300 overflow-hidden">
                    <Image source={{ uri: authorAvatar }} className="w-full h-full" />
                  </View>
                  <Text className="text-[10px] font-bold text-slate-800" numberOfLines={1}>
                    {authorName}
                  </Text>
                </View>
              )}
            </View>

            <View className="w-[110px] h-[110px] rounded-sm overflow-hidden bg-slate-200 border border-slate-200">
              <Image source={{ uri: coverImg }} className="w-full h-full" resizeMode="cover" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="mb-5 px-6">
      <TouchableOpacity activeOpacity={0.85} onPress={handleCardPress}>
        <View className="w-full h-52 rounded-2xl overflow-hidden bg-slate-200 mb-4 shadow-sm">
          <Image source={{ uri: coverImg }} className="w-full h-full" resizeMode="cover" />
        </View>

        {showAuthor && (
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-x-3">
              <View className="w-6 h-6 rounded-full bg-slate-300 overflow-hidden">
                <Image source={{ uri: authorAvatar }} className="w-full h-full" />
              </View>
              <Text className="text-[10px] font-bold text-slate-800">{authorName}</Text>
              <View className="w-0.5 h-0.5 rounded-full bg-slate-300" />
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-[1px]">{getReadTime(item)}</Text>
            </View>
            <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-[1px]">{dateStr}</Text>
          </View>
        )}

        <Text className="text-[9px] font-bold text-[#047857] tracking-[2px] uppercase mb-2">{catName}</Text>

        <Text
          className="text-[22px] font-bold text-slate-900 leading-snug mb-2"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {item.excerpt ? (
          <Text className="text-[14px] font-serif text-slate-500 leading-relaxed mb-1" numberOfLines={2}>
            {item.excerpt}
          </Text>
        ) : null}
      </TouchableOpacity>

      {!showAuthor && (
        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-1">
          {dateStr}{dateStr ? '  ·  ' : ''}{getReadTime(item)}
        </Text>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-4">
          <View className="flex-row items-center gap-x-1.5">
            <Heart size={16} color="#94a3b8" />
            <Text className="text-[11px] font-bold text-slate-500">{item.likes_count ?? item.likes?.[0]?.count ?? 0}</Text>
          </View>
          <View className="flex-row items-center gap-x-1.5">
            <MessageCircle size={16} color="#94a3b8" />
            <Text className="text-[11px] font-bold text-slate-500">{item.comments_count ?? item.comments?.[0]?.count ?? 0}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-x-5">
          <TouchableOpacity
            className="flex-row items-center gap-x-1.5"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => onBookmark ? onBookmark(item.id) : null}
          >
            <Bookmark
              size={16}
              color={isBookmarked ? '#047857' : '#94a3b8'}
              fill={isBookmarked ? '#047857' : 'transparent'}
            />
            <Text className={`text-[11px] font-bold ${isBookmarked ? 'text-[#047857]' : 'text-slate-500'}`}>
              {item.bookmarks_count ?? item.bookmarks?.[0]?.count ?? 0}
            </Text>
          </TouchableOpacity>
          <View className="relative">
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => onMenuToggle ? onMenuToggle(item.id) : null}
            >
              <MoreVertical size={16} color="#94a3b8" />
            </TouchableOpacity>

            {activeMenuPostId === item.id && (
              <View className="absolute right-0 bottom-6 bg-white rounded-xl shadow-lg shadow-black/20 border border-slate-100 py-1 z-50 w-44" style={{ elevation: 5 }}>
                <TouchableOpacity className="flex-row items-center px-4 py-3 border-b border-slate-50 gap-x-3" onPress={() => {
                  onMenuToggle?.(item.id);
                  Alert.alert('Share', 'Sharing options...');
                }}>
                  <Share2 size={16} color="#333" />
                  <Text className="text-[13px] font-medium text-slate-700">Share</Text>
                </TouchableOpacity>
                {onFollow && (
                  <TouchableOpacity className="flex-row items-center px-4 py-3 gap-x-3" onPress={() => {
                    onMenuToggle?.(item.id);
                    onFollow();
                  }}>
                    <UserPlus size={16} color="#333" />
                    <Text className="text-[13px] font-medium text-slate-700">{isFollowing ? 'Unfollow' : 'Follow'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
