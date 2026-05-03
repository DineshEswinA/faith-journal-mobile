import { useAppTheme } from '@/hooks/useAppTheme';
import { Image, Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
import { ExternalLink, Play } from 'lucide-react-native';

type InlinePart = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  highlight?: boolean;
  url?: string;
};

type RichContentRendererProps = {
  content: string;
};

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] || null;
};

const parseInline = (text: string): InlinePart[] => {
  const parts: InlinePart[] = [];
  const tokenPattern = /(\*\*[^*]+\*\*|_[^_]+_|<u>.*?<\/u>|==.*?==|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text))) {
    if (match.index > cursor) {
      parts.push({ text: text.slice(cursor, match.index) });
    }

    const token = match[0];
    if (token.startsWith('**')) {
      parts.push({ text: token.slice(2, -2), bold: true });
    } else if (token.startsWith('_')) {
      parts.push({ text: token.slice(1, -1), italic: true });
    } else if (token.startsWith('<u>')) {
      parts.push({ text: token.slice(3, -4), underline: true });
    } else if (token.startsWith('==')) {
      parts.push({ text: token.slice(2, -2), highlight: true });
    } else {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push({ text: linkMatch[1], url: linkMatch[2], underline: true });
      }
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor) });
  }

  return parts;
};

export default function RichContentRenderer({ content }: RichContentRendererProps) {
  const { isDark } = useAppTheme();
  const lines = content.split('\n');

  return (
    <View>
      {lines.map((rawLine, index) => {
        const line = rawLine.trimEnd();
        const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        const youtubeMatch = line.match(/^@\[youtube\]\(([^)]+)\)$/);
        const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);

        if (!line.trim()) {
          return <View key={`space-${index}`} className="h-4" />;
        }

        if (imageMatch) {
          return (
            <View key={`image-${index}`} className="mb-6">
              <View className="w-full h-[220px] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                <Image source={{ uri: imageMatch[2] }} className="w-full h-full" resizeMode="cover" />
              </View>
              {imageMatch[1] ? (
                <Text className="text-center font-serif italic text-xs text-slate-400 dark:text-slate-500 mt-3">
                  {imageMatch[1]}
                </Text>
              ) : null}
            </View>
          );
        }

        if (youtubeMatch) {
          const videoId = getYouTubeId(youtubeMatch[1]);
          return (
            <TouchableOpacity
              key={`youtube-${index}`}
              activeOpacity={0.85}
              className="mb-6 rounded-lg overflow-hidden bg-slate-900"
              onPress={() => Linking.openURL(youtubeMatch[1])}
            >
              <View className="h-[210px] items-center justify-center">
                {videoId ? (
                  <Image source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }} className="absolute inset-0 w-full h-full opacity-80" resizeMode="cover" />
                ) : null}
                <View className="w-14 h-14 rounded-full bg-white/90 items-center justify-center">
                  <Play size={24} color="#047857" fill="#047857" />
                </View>
              </View>
              <View className="px-4 py-3 bg-slate-950 flex-row items-center justify-between">
                <Text className="text-white text-xs font-bold uppercase tracking-[1.5px]">YouTube Video</Text>
                <ExternalLink size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          );
        }

        const inlineParts = parseInline(bulletMatch ? bulletMatch[1] : line);
        return (
          <View key={`line-${index}`} className={`${bulletMatch ? 'flex-row items-start' : ''} mb-3`}>
            {bulletMatch ? <Text className="text-[17px] text-slate-800 dark:text-slate-200 leading-[32px] mr-3">•</Text> : null}
            <Text
              className="text-[17px] text-slate-800 dark:text-slate-200 leading-[32px] flex-1"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            >
              {inlineParts.map((part, partIndex) => (
                <Text
                  key={`${index}-${partIndex}`}
                  onPress={part.url ? () => Linking.openURL(part.url!) : undefined}
                  style={{
                    color: part.url ? '#047857' : undefined,
                    fontWeight: part.bold ? '700' : '400',
                    fontStyle: part.italic ? 'italic' : 'normal',
                    textDecorationLine: part.underline || part.url ? 'underline' : 'none',
                    backgroundColor: part.highlight ? (isDark ? '#4A3A12' : '#FEF3C7') : 'transparent',
                  }}
                >
                  {part.text}
                </Text>
              ))}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
