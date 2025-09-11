-- 초기 공간 데이터 삽입 (염리점, 공덕점)
INSERT INTO spaces (name, location, capacity, hourly_rate, description, naver_map_url) VALUES
(
  '염리점',
  '서울 마포구 염리동 98 상가 2층 210호',
  8,
  9000,
  '염리점은 최대 8명까지 이용 가능한 공간입니다. 주차는 불가하며, 커피나 차 반입은 금지되어 있습니다.',
  'https://map.naver.com/p/search/%EC%97%BC%EB%A6%AC%EB%8F%99%2098%20%EC%83%81%EA%B0%80%202%EC%B8%B5%20210%ED%98%B8?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=%2Fhome%3Fentry%3Dpll'
),
(
  '공덕점',
  '서울 마포구 마포대로 115-12 공덕상상아파트 상가 319-1호',
  6,
  9000,
  '공덕점은 최대 6명까지 이용 가능한 공간입니다. 주차는 불가하며, 커피나 차 반입은 금지되어 있습니다.',
  'https://map.naver.com/p/search/%EB%A7%88%ED%8F%AC%EB%8C%80%EB%A1%9C%20115-12%20%EA%B3%B5%EB%8D%95%EC%83%81%EC%83%81%EC%95%84%ED%8C%8C%ED%8A%B8%20%EC%83%81%EA%B0%80%20319-1%ED%98%B8?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=%2Fhome%3Fentry%3Dpll'
);

-- 샘플 커뮤니티 그룹 (실제 사용자가 생성되면 creator_id 업데이트 필요)
-- INSERT INTO community_groups (name, description, creator_id) VALUES
-- ('스터디 모임', '함께 공부하는 모임입니다.', 'user-uuid-here'),
-- ('독서 클럽', '책을 읽고 토론하는 모임입니다.', 'user-uuid-here');
