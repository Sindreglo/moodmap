// Mapping from mood rating (1-5) to PNG icon paths in /public
export const moodIconPaths: Record<number, string> = {
  1: '/mood-icons/rating_1.png',
  2: '/mood-icons/rating_2.png',
  3: '/mood-icons/rating_3.png',
  4: '/mood-icons/rating_4.png',
  5: '/mood-icons/rating_5.png',
};

export const getMoodIcon = (mood: number) => moodIconPaths[mood] || moodIconPaths[3];
