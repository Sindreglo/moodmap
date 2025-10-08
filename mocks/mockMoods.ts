import type { Mood } from "@/types/interfaces/Mood";

export const mockMoods: Mood[] = [
  { id: 'paris', lat: 48.8566, lng: 2.3522, mood: 5, timestamp: Date.now() - 1000000 }, // Paris
  { id: 'london', lat: 51.5074, lng: -0.1278, mood: 4, timestamp: Date.now() - 2000000 }, // London
  { id: 'berlin', lat: 52.52, lng: 13.405, mood: 3, timestamp: Date.now() - 3000000 }, // Berlin
  { id: 'rome', lat: 41.9028, lng: 12.4964, mood: 2, timestamp: Date.now() - 4000000 }, // Rome
  { id: 'madrid', lat: 40.4168, lng: -3.7038, mood: 1, timestamp: Date.now() - 5000000 }, // Madrid
  { id: 'stockholm', lat: 59.3293, lng: 18.0686, mood: 4, timestamp: Date.now() - 6000000 }, // Stockholm
  { id: 'helsinki', lat: 60.1699, lng: 24.9384, mood: 5, timestamp: Date.now() - 7000000 }, // Helsinki
  { id: 'prague', lat: 50.0755, lng: 14.4378, mood: 3, timestamp: Date.now() - 8000000 }, // Prague
  { id: 'vienna', lat: 48.2082, lng: 16.3738, mood: 2, timestamp: Date.now() - 9000000 }, // Vienna
  { id: 'milan', lat: 45.4654, lng: 9.1859, mood: 1, timestamp: Date.now() - 10000000 }, // Milan
];
