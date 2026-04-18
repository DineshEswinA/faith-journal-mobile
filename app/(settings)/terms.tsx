import { ScrollView, Text } from 'react-native';

export default function TermsScreen() {
  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-4">Terms of Service</Text>
      <Text className="text-lg text-slate-600 leading-relaxed">
        By accessing or using the Faith Journal application, you agree to be bound by these Terms of Service and all applicable laws and regulations. You also agree to maintain a respectful and uplifting environment for all users within the community.
      </Text>
    </ScrollView>
  );
}
