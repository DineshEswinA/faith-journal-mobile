-- 1️⃣ Profiles Table (User Info)
-- Linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  bio text,
  avatar_url text,
  website text,
  created_at timestamp with time zone default now()
);

-- 2️⃣ Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  slug text unique,
  created_at timestamp default now()
);

-- 3️⃣ Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(user_id) on delete cascade,
  category_id uuid references public.categories(id),
  title text not null,
  slug text unique,
  excerpt text,
  content jsonb,
  cover_image text,
  status text default 'draft',
  reading_time integer,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 4️⃣ Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  slug text unique
);

-- 5️⃣ Post Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- 6️⃣ Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(user_id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamp default now()
);

-- 7️⃣ Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamp default now(),
  unique(user_id, post_id)
);

-- 8️⃣ Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamp default now(),
  unique(user_id, post_id)
);

-- 9️⃣ Followers Table
CREATE TABLE IF NOT EXISTS public.followers (
  follower_id uuid references public.profiles(user_id) on delete cascade,
  following_id uuid references public.profiles(user_id) on delete cascade,
  created_at timestamp default now(),
  primary key (follower_id, following_id)
);

-- 🔟 Post Views Table
CREATE TABLE IF NOT EXISTS public.post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(user_id),
  viewed_at timestamp default now()
);

-- 11️⃣ Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete cascade,
  type text,
  reference_id uuid,
  message text,
  is_read boolean default false,
  created_at timestamp default now()
);

-- 12️⃣ Recommended Indexes (Performance)
CREATE INDEX IF NOT EXISTS idx_posts_author on public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category on public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_comments_post on public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post on public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_views_post on public.post_views(post_id);

-- 13️⃣ Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Base RLS Policy Examples (You can enhance these in Supabase)
-- CREATE POLICY "Users can edit own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);

-- Bookmarks Table RLS Policies
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Profiles Table RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- 14️⃣ Seed Categories
INSERT INTO public.categories (name, slug) VALUES
  ('Gospels', 'gospels'),
  ('Stories', 'stories'),
  ('Mime Ideas', 'mime-ideas'),
  ('Salvations', 'salvations'),
  ('Ministries', 'ministries'),
  ('Musics', 'musics'),
  ('Daily Bread', 'daily-bread')
ON CONFLICT (name) DO NOTHING;

insert into tags (name) values
('faith'),
('prayer'),
('grace'),
('hope'),
('jesus'),
('worship'),
('bible'),
('salvation'),
('testimony'),
('love'),
('peace'),
('trust'),
('devotion'),
('scripture'),
('blessing');

-- 15️⃣ Storage Setup (Avatars)
-- Create the storage bucket for profile pictures (Note: Ensure this is run if 'faith-journal' bucket doesn't exist)
-- Allow public viewing of all files in the bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'faith-journal');

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'faith-journal' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their files
CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'faith-journal' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);
