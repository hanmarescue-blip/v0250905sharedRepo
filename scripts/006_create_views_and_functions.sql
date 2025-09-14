-- Create view for posts with author info and stats
CREATE OR REPLACE VIEW public.posts_with_details AS
SELECT 
  p.id,
  p.content,
  p.image_url,
  p.created_at,
  p.updated_at,
  pr.id as author_id,
  pr.username as author_username,
  pr.display_name as author_display_name,
  pr.avatar_url as author_avatar_url,
  COALESCE(like_counts.like_count, 0) as like_count,
  COALESCE(comment_counts.comment_count, 0) as comment_count
FROM public.posts p
JOIN public.profiles pr ON p.author_id = pr.id
LEFT JOIN (
  SELECT post_id, COUNT(*) as like_count
  FROM public.likes
  GROUP BY post_id
) like_counts ON p.id = like_counts.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) as comment_count
  FROM public.comments
  GROUP BY post_id
) comment_counts ON p.id = comment_counts.post_id
ORDER BY p.created_at DESC;

-- Create function to get user feed (posts from followed users)
CREATE OR REPLACE FUNCTION public.get_user_feed(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  author_id UUID,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  like_count BIGINT,
  comment_count BIGINT,
  user_has_liked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pwd.id,
    pwd.content,
    pwd.image_url,
    pwd.created_at,
    pwd.updated_at,
    pwd.author_id,
    pwd.author_username,
    pwd.author_display_name,
    pwd.author_avatar_url,
    pwd.like_count,
    pwd.comment_count,
    EXISTS(
      SELECT 1 FROM public.likes l 
      WHERE l.post_id = pwd.id AND l.user_id = user_uuid
    ) as user_has_liked
  FROM public.posts_with_details pwd
  WHERE pwd.author_id IN (
    SELECT following_id FROM public.follows WHERE follower_id = user_uuid
    UNION
    SELECT user_uuid -- Include user's own posts
  )
  ORDER BY pwd.created_at DESC;
END;
$$;
