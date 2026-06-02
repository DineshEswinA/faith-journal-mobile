import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Edit3, User, Bell, Lock } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type GuestPromptProps = {
  title: string;
  description: string;
  iconType: 'write' | 'profile' | 'activity' | 'lock';
};

export default function GuestPrompt({ title, description, iconType }: GuestPromptProps) {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const renderIcon = () => {
    const iconSize = 32;
    const iconColor = '#047857';
    switch (iconType) {
      case 'write':
        return <Edit3 size={iconSize} color={iconColor} strokeWidth={1.5} />;
      case 'profile':
        return <User size={iconSize} color={iconColor} strokeWidth={1.5} />;
      case 'activity':
        return <Bell size={iconSize} color={iconColor} strokeWidth={1.5} />;
      default:
        return <Lock size={iconSize} color={iconColor} strokeWidth={1.5} />;
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-8 bg-[#FAFAFA] dark:bg-[#111111] pb-12">
      {/* Icon Circle */}
      <View className="w-20 h-20 rounded-full bg-[#ECF1ED] dark:bg-[#0D2318] items-center justify-center mb-6 shadow-sm">
        {renderIcon()}
      </View>

      {/* Title */}
      <Text
        className="text-[28px] font-bold text-slate-900 dark:text-slate-100 text-center leading-tight mb-4"
        style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
      >
        {title}
      </Text>

      {/* Divider */}
      <View className="w-12 h-[1px] bg-slate-200 dark:bg-slate-800 mb-5" />

      {/* Description */}
      <Text
        className="text-[15px] font-serif text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-8 px-4"
        style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
      >
        {description}
      </Text>

      {/* Sign In CTA */}
      <TouchableOpacity
        className="w-full bg-[#047857] rounded-xl py-4 items-center justify-center shadow-md active:opacity-90"
        onPress={() => router.push('/(auth)/sign-in')}
        activeOpacity={0.8}
      >
        <Text className="text-white font-bold text-[15px] tracking-wide">
          Sign In or Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}
