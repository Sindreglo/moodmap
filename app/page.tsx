'use client'

import { useState } from 'react'
import Map from '@/components/Map'
import MoodModal from '@/components/MoodModal'
import styles from './page.module.scss'

export interface Mood {
  id: string
  mood: number
  lat: number
  lng: number
  timestamp: number
}

export default function Home() {
  const [moods, setMoods] = useState<Mood[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddMood = (mood: number, lat: number, lng: number) => {
    const newMood: Mood = {
      id: Date.now().toString(),
      mood,
      lat,
      lng,
      timestamp: Date.now(),
    }
    setMoods([...moods, newMood])
    setIsModalOpen(false)
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>MoodMap</h1>
        <p>Share your mood with the world</p>
      </div>
      
      <button 
        className={styles.addMoodButton}
        onClick={() => setIsModalOpen(true)}
      >
        + Add Your Mood
      </button>

      <Map moods={moods} />

      {isModalOpen && (
        <MoodModal 
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddMood}
        />
      )}
    </main>
  )
}
