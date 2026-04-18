import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white p-6 justify-center">
      <View className="flex-1 justify-center items-center">
        <Text className="text-4xl font-extrabold text-indigo-900 mb-4 tracking-tight">Faith Journal</Text>
        <Text className="text-lg text-slate-500 mb-12 text-center leading-relaxed">
          Your personal space to grow your faith, reflect, and share your journey with believers.
        </Text>
        
        <View className="w-full gap-y-4">
          <TouchableOpacity 
            className="bg-indigo-600 w-full py-4 rounded-xl shadow-sm"
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text className="text-white text-center font-bold text-lg">Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-full py-4 rounded-xl border-2 border-indigo-100 bg-indigo-50"
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text className="text-indigo-700 text-center font-bold text-lg">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
