const isProd = process.env.NODE_ENV === 'production';
// If you ever change the repo name, update this constant or move to NEXT_PUBLIC_BASE_PATH.
const BASE_PATH = isProd ? '/moodmap' : '';

export const moodIconPaths: Record<number, string> = {
    1: `${BASE_PATH}/mood-icons/rating_1.png`,
    2: `${BASE_PATH}/mood-icons/rating_2.png`,
    3: `${BASE_PATH}/mood-icons/rating_3.png`,
    4: `${BASE_PATH}/mood-icons/rating_4.png`,
    5: `${BASE_PATH}/mood-icons/rating_5.png`,
};

export const getMoodIcon = (mood: number) => moodIconPaths[mood] || moodIconPaths[3];
