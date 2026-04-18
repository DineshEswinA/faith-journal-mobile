import { ScrollView, Text } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-4">About Faith Journal</Text>
      <Text className="text-lg text-slate-600 leading-relaxed">
        Faith Journal is a dedicated space for believers to document their spiritual journey, share testimonies, and connect with a community of faith. This mobile application is a companion to the web app, allowing you to access your journal anytime, anywhere.
      </Text>
    </ScrollView>
  );
}
