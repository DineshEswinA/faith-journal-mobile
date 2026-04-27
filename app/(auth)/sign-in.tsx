import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useAppTheme();

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

  async function signInWithProvider(provider: string) {
    Alert.alert('Coming Soon', `${provider} OAuth integration depends on Expo dev client setup.`);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]" edges={['top', 'bottom']}>
      {/* Top Green Accent Line */}
      <View className="h-1.5 bg-[#047857] w-full absolute top-0 z-10" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="px-6 pt-12 pb-4 flex-1 justify-between">
            <View>
              <Text className="text-[#047857] font-bold uppercase tracking-[3px] text-xs mb-12">
                Faith Journal
              </Text>

              <View className="mb-12">
                <Text
                  className="text-5xl text-slate-900 dark:text-slate-100 mb-3"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' }}
                >
                  Welcome back
                </Text>
                <Text className="text-slate-600 dark:text-slate-400 text-base">
                  Enter your credentials to access your library.
                </Text>
              </View>

              <View className="gap-y-6">
                {/* Email Input */}
                <View>
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider mb-2">EMAIL ADDRESS</Text>
                  <TextInput
                    className="w-full bg-[#f1f5f9] dark:bg-[#1E1E1E] p-4 rounded-xl text-base text-slate-800 dark:text-slate-200"
                    placeholder="name@sanctuary.com"
                    placeholderTextColor={colors.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                {/* Password Input */}
                <View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider">PASSWORD</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Password reset function')}>
                      <Text className="text-[#047857] text-xs font-medium">Forgot password?</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    className="w-full bg-[#f1f5f9] dark:bg-[#1E1E1E] p-4 rounded-xl text-base text-slate-800 dark:text-slate-200"
                    placeholder="••••••••"
                    placeholderTextColor={colors.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  className="bg-[#047857] w-full p-4 rounded-full items-center mt-2 shadow-sm"
                  onPress={signInWithEmail}
                  disabled={loading}
                >
                  <Text className="text-white font-bold text-lg">{loading ? 'Signing In...' : 'Sign In'}</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View className="flex-row items-center my-8">
                <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <Text className="mx-4 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-[2px] uppercase">Or continue with</Text>
                <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </View>

              {/* Social Logins */}
              <View className="flex-row gap-x-4 mb-10">
                <TouchableOpacity
                  className="flex-1 bg-white dark:bg-[#1A1A1A] p-4 rounded-full flex-row justify-center items-center gap-x-3 shadow-sm border border-slate-100 dark:border-slate-800"
                  onPress={() => signInWithProvider('Google')}
                >
                  <FontAwesome5 name="google" size={16} color={colors.icon} />
                  <Text className="text-slate-800 dark:text-slate-200 font-bold">Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-white dark:bg-[#1A1A1A] p-4 rounded-full flex-row justify-center items-center gap-x-3 shadow-sm border border-slate-100 dark:border-slate-800"
                  onPress={() => signInWithProvider('Github')}
                >
                  <FontAwesome5 name="github" size={16} color={colors.icon} />
                  <Text className="text-slate-800 dark:text-slate-200 font-bold">Github</Text>
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View className="flex-row justify-center items-center">
                <Text className="text-slate-600 dark:text-slate-400 text-base">Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                  <Text className="text-[#047857] font-bold text-base">Create an entry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bottom Footer */}
          <View className="px-6 pb-6 pt-4 flex-row justify-between items-center bg-[#FAFAFA] dark:bg-[#111111]">
            <View className="flex-row gap-x-6">
              <TouchableOpacity>
                <Text className="text-xs font-bold tracking-[1px] text-slate-500 dark:text-slate-400">PRIVACY</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-xs font-bold tracking-[1px] text-slate-500 dark:text-slate-400">TERMS</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="bg-slate-500 dark:bg-slate-600 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-[10px] font-bold">?</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
