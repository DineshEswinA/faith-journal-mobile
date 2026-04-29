import React from 'react';
import { View } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Home, Search, Edit3, Bell, User } from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

const TopTabs = createMaterialTopTabNavigator().Navigator;
const SwipeableTabs = withLayoutContext(TopTabs);

export default function TabLayout() {
  const { isDark } = useAppTheme();

  return (
    <SwipeableTabs
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: '#047857',
        tabBarInactiveTintColor: isDark ? '#4B5563' : '#9ca3af',
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarIndicatorStyle: { height: 0 },
        tabBarPressColor: 'transparent',
        tabBarStyle: {
          backgroundColor: isDark ? '#111111' : '#ffffff',
          borderTopColor: isDark ? '#1F2937' : '#f1f5f9',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: 4,
          textTransform: 'none',
        },
        tabBarIconStyle: {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }
      }}>
      <SwipeableTabs.Screen
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
      <SwipeableTabs.Screen
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
      <SwipeableTabs.Screen
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
      <SwipeableTabs.Screen
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
      <SwipeableTabs.Screen
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
    </SwipeableTabs>
  );
}
