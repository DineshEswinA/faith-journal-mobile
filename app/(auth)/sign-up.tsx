import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useAppTheme();

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) Alert.alert('Sign Up Error', error.message);
    else {
      Alert.alert('Success', 'Check your email to verify your account!');
      router.push('/(auth)/sign-in');
    }

    setLoading(false);
  }

  async function signUpWithProvider(provider: string) {
    Alert.alert('Coming Soon', `${provider} OAuth integration depends on Expo dev client setup.`);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]" edges={['top', 'bottom']}>
      {/* Top Green Accent Line */}
      <View className="h-1.5 bg-[#047857] w-[35%] absolute top-0 left-0 z-10" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 pt-12 flex-1 justify-between">
              <View>
                <Text className="text-black dark:text-white font-bold uppercase tracking-[2px] text-xs mb-10">
                  Faith Journal
                </Text>

                <View className="mb-8">
                  <Text className="text-[44px] leading-[48px] font-bold text-[#4B5563] dark:text-slate-300 mb-3 tracking-tighter">
                    Begin your{'\n'}journey
                  </Text>
                  <Text
                    className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed"
                    style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                  >
                    Create an account to save your{'\n'}reflections and join our community.
                  </Text>
                </View>

                <View className="gap-y-5">
                  {/* Full Name Input */}
                  <View>
                    <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-[1px] uppercase mb-2">FULL NAME</Text>
                    <TextInput
                      className="w-full h-14 bg-[#F8F9FA] dark:bg-[#1A1A1A] px-4 text-base text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      placeholder="Aiden Thorne"
                      placeholderTextColor={colors.placeholderAlt}
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Email Input */}
                  <View>
                    <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-[1px] uppercase mb-2">EMAIL ADDRESS</Text>
                    <TextInput
                      className="w-full h-14 bg-[#F8F9FA] dark:bg-[#1A1A1A] px-4 text-base text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      placeholder="name@sanctuary.com"
                      placeholderTextColor={colors.placeholderAlt}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  {/* Password Input */}
                  <View>
                    <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-[1px] uppercase mb-2">PASSWORD</Text>
                    <TextInput
                      className="w-full h-14 bg-[#F8F9FA] dark:bg-[#1A1A1A] px-4 text-base text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      placeholder="••••••••"
                      placeholderTextColor={colors.placeholderAlt}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>

                  {/* Create Account Button */}
                  <TouchableOpacity
                    className="bg-[#047857] w-full h-14 rounded-lg items-center justify-center mt-2"
                    onPress={signUpWithEmail}
                    disabled={loading}
                  >
                    <Text className="text-white font-bold text-sm tracking-[1px]">
                      {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View className="flex-row items-center my-8">
                  <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <Text className="mx-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[2px] uppercase">Or continue with</Text>
                  <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </View>

                {/* Social Signups */}
                <View className="flex-row gap-x-4 mb-10">
                  <TouchableOpacity
                    className="flex-1 h-14 bg-white dark:bg-[#1A1A1A] rounded-xl flex-row justify-center items-center gap-x-3 border border-slate-100 dark:border-slate-800"
                    onPress={() => signUpWithProvider('Google')}
                  >
                    <FontAwesome5 name="google" size={16} color={colors.icon} />
                    <Text className="text-black dark:text-white font-bold tracking-[0.5px] text-xs">GOOGLE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 h-14 bg-white dark:bg-[#1A1A1A] rounded-xl flex-row justify-center items-center gap-x-3 border border-slate-100 dark:border-slate-800"
                    onPress={() => signUpWithProvider('Github')}
                  >
                    <FontAwesome5 name="github" size={16} color={colors.icon} />
                    <Text className="text-black dark:text-white font-bold tracking-[0.5px] text-xs">GITHUB</Text>
                  </TouchableOpacity>
                </View>

                {/* Log In Link */}
                <View className="flex-row justify-center items-center pb-10">
                  <Text
                    className="text-slate-600 dark:text-slate-400 text-base"
                    style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' }}
                  >
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                    <Text className="text-[#047857] font-bold text-sm tracking-[1px]">SIGN IN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Bottom Footer block - edge to edge */}
            <View className="bg-[#EFEFEF] dark:bg-[#1A1A1A] pt-8 pb-10 w-full px-4 items-center mt-auto">
              <View className="flex-row gap-x-6 mb-4">
                <Text className="text-[10px] font-bold text-[#888888] dark:text-slate-500 tracking-[1px]">PRIVACY POLICY</Text>
                <Text className="text-[10px] font-bold text-[#888888] dark:text-slate-500 tracking-[1px]">TERMS OF SERVICE</Text>
                <Text className="text-[10px] font-bold text-[#888888] dark:text-slate-500 tracking-[1px]">SUPPORT</Text>
              </View>
              <Text className="text-[9px] text-[#A3A3A3] dark:text-slate-500 font-bold tracking-[1px] uppercase">
                © 2024 Faith Journal. All rights reserved.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
