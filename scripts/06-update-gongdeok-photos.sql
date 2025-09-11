-- 공덕점 기존 사진 삭제
DELETE FROM space_photos WHERE space_id = 2;

-- 공덕점 실제 사진 추가
INSERT INTO space_photos (space_id, photo_url, description, display_order) VALUES
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4162.jpg-IzRa2cl0lJwS4QktMTFWCTBIV8vfzF.jpeg', '공덕점 회의실 - 프로젝터와 화이트보드', 1),
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4163.jpg-IsJ0nJ1hWoeSpUm6e9t0kYSZM1fwCj.jpeg', '공덕점 회의실 - 6인용 테이블과 프로젝터', 2),
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4160.jpg-E9QNWHmO2nwRyTFVprUwGl7ZLYYxr0.jpeg', '공덕점 회의실 - 3D 모델링 작업 공간', 3),
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4165.jpg-PtysuqnTC8jnvBpSvxfkWgte0OjQ1n.jpeg', '공덕점 회의실 - 유리 파티션과 현대적 인테리어', 4),
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4124.jpg-4cKRmSNg4qzmMyPi2WesZtBlTeiSP9.jpeg', '공덕점 복도 - 유리벽 회의실들', 5),
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4161.jpg-mJU4noGXaRCNyjoPMZL0shYz3jEHqA.jpeg', '공덕점 회의실 - 교육 및 프레젠테이션 공간', 6);
