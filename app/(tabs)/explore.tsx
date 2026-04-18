import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();

  const fetchUsers = async () => {
    setLoading(true);
    // Assuming a 'profiles' or public user views table
    const { data } = await supabase
      .from('users_view') // Placeholder: typically developers expose a public view or table
      .select('id, email, full_name')
      .ilike('email', `%${search}%`)
      .limit(20);
      
    // Because I don't know the exact schema for public user info, 
    // I'm assuming there's some exposed view or table.
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    // Only search if length > 2 or initial load
    if (search.length > 2 || search.length === 0) fetchUsers();
  }, [search]);

  const handleFollowToggle = async (targetId: string, isFollowing: boolean) => {
    if (!user) return;
    
    // Opt-UI
    setUsers(curr => curr.map(u => u.id === targetId ? {...u, isFollowing: !isFollowing} : u));

    try {
      if (isFollowing) {
         await supabase.from('followers')
           .delete()
           .match({ follower_id: user.id, following_id: targetId });
      } else {
         await supabase.from('followers')
           .insert({ follower_id: user.id, following_id: targetId });
      }
    } catch {}
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4" edges={['top']}>
      <Text className="text-2xl font-bold text-slate-800 mb-4">Discover Believers</Text>
      <TextInput
        className="bg-white p-4 rounded-xl border border-slate-200 mb-6 text-lg"
        placeholder="Search users..."
        value={search}
        onChangeText={setSearch}
      />
      
      {loading && users.length === 0 ? (
        <ActivityIndicator color="#4f46e5" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between bg-white p-4 mb-3 rounded-xl shadow-sm border border-slate-100">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-indigo-700 font-bold text-lg">
                    {item.email ? item.email.substring(0, 1).toUpperCase() : '?'}
                  </Text>
                </View>
                <Text className="font-bold text-slate-800 text-lg">{item.email}</Text>
              </View>
              
              {item.id !== user?.id && (
                <TouchableOpacity 
                  className={`px-4 py-2 rounded-full ${item.isFollowing ? 'bg-slate-100' : 'bg-indigo-600'}`}
                  onPress={() => handleFollowToggle(item.id, !!item.isFollowing)}
                >
                  <Text className={`font-bold ${item.isFollowing ? 'text-slate-600' : 'text-white'}`}>
                    {item.isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-center text-slate-400 mt-10">No users found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
