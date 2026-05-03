import { DEFAULT_AVATAR_URL, DEFAULT_POST_COVER_IMAGE } from '@/constants/AppConstants';
import { getReadTime } from '@/lib/readTime';
import { sharePost } from '@/lib/sharePost';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRouter } from 'expo-router';
import { Bookmark, Heart, MessageCircle, MoreVertical, Share2, UserPlus } from 'lucide-react-native';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';

export type PostCardProps = {
  item: any;
  index: number;
  showAuthor?: boolean;
  variant?: 'stacked' | 'sideBySide';
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
  variant = 'sideBySide',
  isBookmarked = false,
  onBookmark,
  activeMenuPostId,
  onMenuToggle,
  onFollow,
  isFollowing = false,
}: PostCardProps) {
  const router = useRouter();
  const { colors } = useAppTheme();

  const authorProfile = Array.isArray(item.user)
    ? item.user[0]
    : item.user || (Array.isArray(item.profiles) ? item.profiles[0] : item.profiles);

  const coverImg = item.cover_image || DEFAULT_POST_COVER_IMAGE;
  const catName = item.category || item.categories?.name?.toUpperCase() || 'STORY';
  const dateStr = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const authorAvatar = authorProfile?.avatar_url || DEFAULT_AVATAR_URL;
  const authorName = authorProfile?.full_name || authorProfile?.username || authorProfile?.email || 'Anonymous';

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
                <View className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[1px]">{getReadTime(item)}</Text>
              </View>

              <Text
                className="text-[18px] font-bold text-slate-900 dark:text-slate-100 leading-7 mb-3"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                numberOfLines={3}
              >
                {item.title}
              </Text>

              {item.excerpt ? (
                <Text
                  className="text-[13px] text-slate-500 dark:text-slate-400 leading-5 mb-4"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                  numberOfLines={3}
                >
                  {item.excerpt}
                </Text>
              ) : null}

              {showAuthor && (
                <View className="flex-row items-center gap-x-2">
                  <View className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 overflow-hidden">
                    <Image source={{ uri: authorAvatar }} className="w-full h-full" />
                  </View>
                  <Text className="text-[10px] font-bold text-slate-800 dark:text-slate-200" numberOfLines={1}>
                    {authorName}
                  </Text>
                </View>
              )}

              {!showAuthor && (
                <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[1px]">
                  {dateStr}{dateStr ? '  ·  ' : ''}{getReadTime(item)}
                </Text>
              )}
            </View>

            <View className="w-[110px] h-[110px] rounded-sm overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700">
              <Image source={{ uri: coverImg }} className="w-full h-full" resizeMode="cover" />
            </View>
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center gap-x-4">
            <View className="flex-row items-center gap-x-1.5">
              <Heart size={16} color={colors.iconMuted} />
              <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{item.likes_count ?? item.likes?.[0]?.count ?? 0}</Text>
            </View>
            <View className="flex-row items-center gap-x-1.5">
              <MessageCircle size={16} color={colors.iconMuted} />
              <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{item.comments_count ?? item.comments?.[0]?.count ?? 0}</Text>
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
                color={isBookmarked ? '#047857' : colors.iconMuted}
                fill={isBookmarked ? '#047857' : 'transparent'}
              />
              <Text className={`text-[11px] font-bold ${isBookmarked ? 'text-[#047857]' : 'text-slate-500 dark:text-slate-400'}`}>
                {item.bookmarks_count ?? item.bookmarks?.[0]?.count ?? 0}
              </Text>
            </TouchableOpacity>
            <View className="relative">
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => onMenuToggle ? onMenuToggle(item.id) : null}
              >
                <MoreVertical size={16} color={colors.iconMuted} />
              </TouchableOpacity>

              {activeMenuPostId === item.id && (
                <View className="absolute right-0 bottom-6 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-lg shadow-black/20 border border-slate-100 dark:border-slate-800 py-1 z-50 w-44" style={{ elevation: 5 }}>
                  <TouchableOpacity className="flex-row items-center px-4 py-3 border-b border-slate-50 dark:border-slate-800 gap-x-3" onPress={() => {
                    onMenuToggle?.(item.id);
                    sharePost(item);
                  }}>
                    <Share2 size={16} color={colors.icon} />
                    <Text className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Share</Text>
                  </TouchableOpacity>
                  {onFollow && (
                    <TouchableOpacity className="flex-row items-center px-4 py-3 gap-x-3" onPress={() => {
                      onMenuToggle?.(item.id);
                      onFollow();
                    }}>
                      <UserPlus size={16} color={colors.icon} />
                      <Text className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{isFollowing ? 'Unfollow' : 'Follow'}</Text>
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

  return (
    <View className="mb-5 px-6">
      <TouchableOpacity activeOpacity={0.85} onPress={handleCardPress}>
        <View className="w-full h-52 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 mb-4 shadow-sm">
          <Image source={{ uri: coverImg }} className="w-full h-full" resizeMode="cover" />
        </View>

        {showAuthor && (
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-x-3">
              <View className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 overflow-hidden">
                <Image source={{ uri: authorAvatar }} className="w-full h-full" />
              </View>
              <Text className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{authorName}</Text>
              <View className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[1px]">{getReadTime(item)}</Text>
            </View>
            <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[1px]">{dateStr}</Text>
          </View>
        )}

        <Text className="text-[9px] font-bold text-[#047857] tracking-[2px] uppercase mb-2">{catName}</Text>

        <Text
          className="text-[22px] font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {item.excerpt ? (
          <Text className="text-[14px] font-serif text-slate-500 dark:text-slate-400 leading-relaxed mb-1" numberOfLines={2}>
            {item.excerpt}
          </Text>
        ) : null}
      </TouchableOpacity>

      {!showAuthor && (
        <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-1">
          {dateStr}{dateStr ? '  ·  ' : ''}{getReadTime(item)}
        </Text>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-4">
          <View className="flex-row items-center gap-x-1.5">
            <Heart size={16} color={colors.iconMuted} />
            <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{item.likes_count ?? item.likes?.[0]?.count ?? 0}</Text>
          </View>
          <View className="flex-row items-center gap-x-1.5">
            <MessageCircle size={16} color={colors.iconMuted} />
            <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{item.comments_count ?? item.comments?.[0]?.count ?? 0}</Text>
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
              color={isBookmarked ? '#047857' : colors.iconMuted}
              fill={isBookmarked ? '#047857' : 'transparent'}
            />
            <Text className={`text-[11px] font-bold ${isBookmarked ? 'text-[#047857]' : 'text-slate-500 dark:text-slate-400'}`}>
              {item.bookmarks_count ?? item.bookmarks?.[0]?.count ?? 0}
            </Text>
          </TouchableOpacity>
          <View className="relative">
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => onMenuToggle ? onMenuToggle(item.id) : null}
            >
              <MoreVertical size={16} color={colors.iconMuted} />
            </TouchableOpacity>

            {activeMenuPostId === item.id && (
              <View className="absolute right-0 bottom-6 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-lg shadow-black/20 border border-slate-100 dark:border-slate-800 py-1 z-50 w-44" style={{ elevation: 5 }}>
                <TouchableOpacity className="flex-row items-center px-4 py-3 border-b border-slate-50 dark:border-slate-800 gap-x-3" onPress={() => {
                  onMenuToggle?.(item.id);
                  sharePost(item);
                }}>
                  <Share2 size={16} color={colors.icon} />
                  <Text className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Share</Text>
                </TouchableOpacity>
                {onFollow && (
                  <TouchableOpacity className="flex-row items-center px-4 py-3 gap-x-3" onPress={() => {
                    onMenuToggle?.(item.id);
                    onFollow();
                  }}>
                    <UserPlus size={16} color={colors.icon} />
                    <Text className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{isFollowing ? 'Unfollow' : 'Follow'}</Text>
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
