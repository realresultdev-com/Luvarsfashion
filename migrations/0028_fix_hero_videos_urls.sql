UPDATE hero_videos
SET video_url = 'https://assets.mixkit.co/videos/31411/31411-720.mp4',
    video_url_720p = 'https://assets.mixkit.co/videos/31411/31411-720.mp4',
    video_url_360p = 'https://assets.mixkit.co/videos/31411/31411-360.mp4',
    poster_url = 'https://assets.mixkit.co/videos/31411/31411-thumb-720-0.jpg'
WHERE id = 'hv_demo_1' OR instr(video_url, '41556') > 0;
