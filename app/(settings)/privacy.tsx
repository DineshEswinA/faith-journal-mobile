import { ScrollView, Text } from 'react-native';

export default function PrivacyScreen() {
  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-4">Privacy Policy</Text>
      <Text className="text-lg text-slate-600 leading-relaxed text-justify mb-4">
        Your privacy is critically important to us. At Faith Journal, we have a few fundamental principles:
      </Text>
      <Text className="text-lg text-slate-600 leading-relaxed mb-4">
        • We don't ask you for personal information unless we truly need it.
        {'\n'}• We don't share your personal information with anyone except to comply with the law, develop our products, or protect our rights.
      </Text>
    </ScrollView>
  );
}
