import type { Mood } from '@/types/interfaces/Mood';

function getRandomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randomlyGeneratedMockMoods(count = 500): Mood[] {
  const moods: Mood[] = [];
  for (let i = 0; i < count; i++) {
    const mood = Math.floor(getRandomInRange(1, 6)); // 1-5
    const lat = getRandomInRange(35, 70); // Europe approx lat
    const lng = getRandomInRange(-10, 40); // Europe approx lng
    moods.push({
      id: `random-${i}-${Date.now()}`,
      mood,
      lat,
      lng,
      timestamp: Date.now() - Math.floor(getRandomInRange(0, 100000000)),
    });
  }
  return moods;
}
