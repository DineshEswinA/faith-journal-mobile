import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogIn } from 'lucide-react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert('Sign In Error', error.message);
    else router.replace('/(tabs)');
    
    setLoading(false);
  }

  async function signInWithGoogle() {
    // Add logic for native Google OAuth using Expo AuthSession or specific native packages
    Alert.alert('Coming Soon', 'Google OAuth integration depends on Expo dev client setup.');
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</Text>
        <Text className="text-slate-500 mb-8">Sign in to continue your spiritual journey.</Text>
        
        <View className="gap-y-4">
          <TextInput
            className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            className="bg-indigo-600 w-full p-4 rounded-xl items-center mt-2"
            onPress={signInWithEmail}
            disabled={loading}
          >
            <Text className="text-white font-bold text-lg">{loading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-slate-200" />
          <Text className="mx-4 text-slate-400">or</Text>
          <View className="flex-1 h-px bg-slate-200" />
        </View>

        <TouchableOpacity 
          className="bg-red-50 w-full p-4 rounded-xl flex-row justify-center items-center gap-x-2 border border-red-100"
          onPress={signInWithGoogle}
        >
          <LogIn color="#dc2626" size={20} />
          <Text className="text-red-600 font-semibold text-lg">Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
