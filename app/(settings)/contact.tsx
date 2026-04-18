import { ScrollView, Text } from 'react-native';

export default function ContactScreen() {
  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-4">Contact Us</Text>
      <Text className="text-lg text-slate-600 leading-relaxed">
        If you have any questions, feedback, or need support, please reach out to us at:
        {'\n\n'}Email: support@faithjournal.app
        {'\n'}Phone: 1-800-FAITH
        {'\n\n'}We are here to help and value your input!
      </Text>
    </ScrollView>
  );
}
