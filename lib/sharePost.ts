import * as Linking from 'expo-linking';
import { Alert, Share } from 'react-native';

type ShareablePost = {
  id?: string;
  title?: string;
};

const PUBLIC_APP_URL = process.env.EXPO_PUBLIC_APP_URL?.replace(/\/$/, '');

export function getPostShareUrl(postId: string) {
  const path = `/post/${encodeURIComponent(postId)}`;

  if (PUBLIC_APP_URL) {
    return `${PUBLIC_APP_URL}${path}`;
  }

  return Linking.createURL(path);
}

export async function sharePost(post: ShareablePost) {
  if (!post.id) {
    Alert.alert('Share unavailable', 'This post cannot be shared right now.');
    return;
  }

  const url = getPostShareUrl(post.id);
  const title = post.title || 'FaithJournal post';

  try {
    await Share.share({
      title,
      message: `${title}\n\n${url}`,
      url,
    });
  } catch {
    Alert.alert('Share unavailable', 'Could not open sharing options. Please try again.');
  }
}
