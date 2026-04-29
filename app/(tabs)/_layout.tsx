import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Search, Edit3, Bell, User } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function TabLayout() {
  const { isDark } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#047857',
        tabBarInactiveTintColor: isDark ? '#4B5563' : '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#111111' : '#ffffff',
          borderTopColor: isDark ? '#1F2937' : '#f1f5f9',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center rounded-xl w-10 h-10 ${focused ? (isDark ? 'bg-[#0D2318]' : 'bg-[#ECF1ED]') : 'bg-transparent'}`}>
               <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center rounded-xl w-10 h-10 ${focused ? (isDark ? 'bg-[#0D2318]' : 'bg-[#ECF1ED]') : 'bg-transparent'}`}>
               <Search size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Write',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center rounded-xl w-10 h-10 ${focused ? (isDark ? 'bg-[#0D2318]' : 'bg-[#ECF1ED]') : 'bg-transparent'}`}>
               <Edit3 size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center rounded-xl w-10 h-10 ${focused ? (isDark ? 'bg-[#0D2318]' : 'bg-[#ECF1ED]') : 'bg-transparent'}`}>
               <Bell size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center rounded-xl w-10 h-10 ${focused ? (isDark ? 'bg-[#0D2318]' : 'bg-[#ECF1ED]') : 'bg-transparent'}`}>
               <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
