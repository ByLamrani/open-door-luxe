
-- Add social media link columns to profiles
ALTER TABLE public.profiles ADD COLUMN instagram_url TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN facebook_url TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN twitter_url TEXT DEFAULT NULL;
