import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Info, Shield, FileText, Mail } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();

  const settingsOptions = [
    { title: 'About', route: '/(settings)/about', icon: <Info size={24} color="#64748b" /> },
    { title: 'Privacy Policy', route: '/(settings)/privacy', icon: <Shield size={24} color="#64748b" /> },
    { title: 'Terms of Service', route: '/(settings)/terms', icon: <FileText size={24} color="#64748b" /> },
    { title: 'Contact', route: '/(settings)/contact', icon: <Mail size={24} color="#64748b" /> },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4">
      <View className="bg-white rounded-2xl overflow-hidden mb-6 border border-slate-100">
        {settingsOptions.map((option, index) => (
          <TouchableOpacity 
            key={index}
            className={`flex-row justify-between items-center bg-white p-4 ${index !== settingsOptions.length - 1 ? 'border-b border-slate-100' : ''}`}
            onPress={() => router.push(option.route as any)}
          >
            <View className="flex-row items-center gap-x-4">
              {option.icon}
              <Text className="text-lg text-slate-800 font-medium">{option.title}</Text>
            </View>
            <ChevronRight size={24} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
