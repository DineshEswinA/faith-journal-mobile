import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/Header';
import GuestPrompt from '@/components/GuestPrompt';

export default function ActivityScreen() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]" edges={['top']}>
        <Header title="Activity" titleStyle="sans" leftAction="menu" rightAction="none" />
        <GuestPrompt
          title="Sanctuary Activity"
          description="Create an account to keep track of followers, likes, comments, and engagement on your stories."
          iconType="activity"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#111111]" edges={['top']}>
      <Header title="Activity" titleStyle="sans" leftAction="menu" rightAction="none" />
      <View className="flex-1 bg-[#FAFAFA] dark:bg-[#111111] items-center justify-center">
        <Text className="text-slate-400 dark:text-slate-500 font-serif">Activity feed coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}
