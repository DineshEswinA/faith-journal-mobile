import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface PostProps {
  post: {
    id: string;
    title?: string;
    excerpt?: string;
    content: string | { body: string };
    likes_count: number;
    user: {
      email?: string;
      username?: string;
      full_name?: string;
    };
    created_at: string;
    isLiked?: boolean;
  };
  onLikePress?: () => void;
}

export default function PostCard({ post, onLikePress }: PostProps) {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      className="bg-white mb-6 pb-6 border-b border-slate-100"
      onPress={() => router.push(`/post/${post.id}`)}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
          <Text className="text-indigo-700 font-bold">
            {(post.user?.full_name || post.user?.username || post.user?.email) ? (post.user.full_name || post.user.username || post.user.email!).substring(0, 2).toUpperCase() : '?'}
          </Text>
        </View>
        <View>
          <Text className="font-bold text-slate-800">{post.user?.full_name || post.user?.username || post.user?.email || 'Unknown User'}</Text>
          <Text className="text-xs text-slate-400">
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      {post.title && (
        <Text className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight tracking-tight">
          {post.title}
        </Text>
      )}
      <Text className="text-slate-600 text-[17px] mb-5 leading-relaxed" numberOfLines={3}>
        {post.excerpt || (typeof post.content === 'object' ? (post.content as any)?.body : post.content)}
      </Text>
      
      <View className="flex-row items-center border-t border-slate-50 pt-3">
        <TouchableOpacity 
          className="flex-row items-center mr-6"
          onPress={onLikePress}
        >
          <Heart size={20} color={post.isLiked ? "#ef4444" : "#94a3b8"} fill={post.isLiked ? "#ef4444" : "transparent"} />
          <Text className={`ml-2 font-medium ${post.isLiked ? 'text-red-500' : 'text-slate-500'}`}>
            {post.likes_count || 0}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center">
          <MessageCircle size={20} color="#94a3b8" />
          <Text className="ml-2 font-medium text-slate-500">Reply</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
