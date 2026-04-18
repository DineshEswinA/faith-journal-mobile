import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert('Sign Up Error', error.message);
    else {
      Alert.alert('Success', 'Check your email to verify your account!');
      router.push('/(auth)/sign-in');
    }
    
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-slate-800 mb-2">Create Account</Text>
        <Text className="text-slate-500 mb-8">Start your faith journaling journey today.</Text>
        
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
            onPress={signUpWithEmail}
            disabled={loading}
          >
            <Text className="text-white font-bold text-lg">{loading ? 'Creating...' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
