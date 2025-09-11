-- 염리점 샘플 사진 추가
INSERT INTO space_photos (space_id, photo_url, caption, display_order) 
SELECT 
  s.id,
  '/placeholder.svg?height=400&width=600',
  '염리점 전체 모습',
  1
FROM spaces s WHERE s.name = '염리점';

INSERT INTO space_photos (space_id, photo_url, caption, display_order) 
SELECT 
  s.id,
  '/placeholder.svg?height=400&width=600',
  '회의용 테이블과 의자 (최대 8명)',
  2
FROM spaces s WHERE s.name = '염리점';

INSERT INTO space_photos (space_id, photo_url, caption, display_order) 
SELECT 
  s.id,
  '/placeholder.svg?height=400&width=600',
  '화이트보드 및 프레젠테이션 공간',
  3
FROM spaces s WHERE s.name = '염리점';

INSERT INTO space_photos (space_id, photo_url, caption, display_order) 
SELECT 
  s.id,
  '/placeholder.svg?height=400&width=600',
  '염리점 입구 (2층 210호)',
  4
FROM spaces s WHERE s.name = '염리점';

-- 공덕점 샘플 사진 추가
INSERT INTO space_photos (space_id, photo_url, caption, display_order) 
SELECT 
  s.id,
  '/placeholder.svg?height=400&width=600',
  '공덕점 전체 모습',
  1
FROM spaces s WHERE s.name = '공덕점';

INSERT INTO space_photos (space_id, photo_url, caption, display_order) 
SELECT 
  s.id,
  '/placeholder.svg?height=400&width=600',
  '회의용 테이블과 의자 (최대 6명)',
  2
FROM spaces s WHERE s.name = '공덕점';

INSERT INTO space_photos (space_id, photo_url, caption, display_order) 
SELECT 
  s.id,
  '/placeholder.svg?height=400&width=600',
  '화이트보드 및 프레젠테이션 공간',
  3
FROM spaces s WHERE s.name = '공덕점';

INSERT INTO space_photos (space_id, photo_url, caption, display_order) 
SELECT 
  s.id,
  '/placeholder.svg?height=400&width=600',
  '공덕점 입구 (상가 319-1호)',
  4
FROM spaces s WHERE s.name = '공덕점';
