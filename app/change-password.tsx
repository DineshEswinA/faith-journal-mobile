import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (trimmedPassword.length < 8) {
      Alert.alert('Password Too Short', 'Use at least 8 characters for your new password.');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      Alert.alert('Passwords Do Not Match', 'Enter the same password in both fields.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: trimmedPassword });
    setSaving(false);

    if (error) {
      Alert.alert('Password Update Failed', error.message);
      return;
    }

    Alert.alert('Password Updated', 'Your password has been changed successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]" edges={['top']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <View className="bg-[#FAFAFA] dark:bg-[#111111] flex-row justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <TouchableOpacity className="w-10 justify-center" onPress={() => router.back()}>
              <ArrowLeft color="#047857" size={24} />
            </TouchableOpacity>
            <View className="flex-1 items-center justify-center">
              <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight" numberOfLines={1}>
                Change Password
              </Text>
            </View>
            <TouchableOpacity className="w-10 items-end justify-center" onPress={handleSave} disabled={saving}>
              <Text className="font-bold text-[#047857] text-[15px]">{saving ? '...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <View className="px-6 pt-8 flex-1">
            <Text className="text-[10px] font-bold text-[#047857] tracking-[1.5px] uppercase mb-2">Security</Text>
            <Text
              className="text-3xl text-slate-900 dark:text-slate-100 mb-3"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            >
              Protect your account
            </Text>
            <Text className="text-[15px] font-serif text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
              Choose a strong new password you do not use anywhere else.
            </Text>

            <View className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 gap-y-6">
              <View>
                <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-3">
                  New Password
                </Text>
                <View className="flex-row items-center bg-[#F3F4F6] dark:bg-[#222222] rounded-2xl px-4 py-4">
                  <Lock size={18} color={colors.iconMid} />
                  <TextInput
                    className="flex-1 text-[16px] text-slate-800 dark:text-slate-200 ml-3"
                    placeholder="At least 8 characters"
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[1.5px] uppercase mb-3">
                  Confirm Password
                </Text>
                <View className="flex-row items-center bg-[#F3F4F6] dark:bg-[#222222] rounded-2xl px-4 py-4">
                  <Lock size={18} color={colors.iconMid} />
                  <TextInput
                    className="flex-1 text-[16px] text-slate-800 dark:text-slate-200 ml-3"
                    placeholder="Re-enter your password"
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry
                    autoCapitalize="none"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </View>
            </View>

            <Text className="text-[12px] font-serif italic text-slate-500 dark:text-slate-400 leading-relaxed mt-6 px-1">
              After saving, your current session stays active and future sign-ins will use the new password.
            </Text>

            <TouchableOpacity
              className="bg-[#047857] rounded-full py-4 items-center justify-center mt-10 shadow-sm"
              onPress={handleSave}
              disabled={saving}
            >
              <Text className="text-white font-bold text-[16px]">{saving ? 'Updating...' : 'Update Password'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
