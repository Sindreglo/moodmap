'use client'

import { useState } from 'react'
import styles from './MoodModal.module.scss'

interface MoodModalProps {
  onClose: () => void
  onSubmit: (mood: number, lat: number, lng: number) => void
}

const moodEmojis = ['😢', '😕', '😐', '🙂', '😄']
const moodLabels = ['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good']

export default function MoodModal({ onClose, onSubmit }: MoodModalProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)

  const handleSubmit = () => {
    if (selectedMood === null) return

    // Get random coordinates for demo purposes
    // In a real app, you might use geolocation or let users click on the map
    const lat = (Math.random() - 0.5) * 160 // Range: -80 to 80
    const lng = (Math.random() - 0.5) * 360 // Range: -180 to 180

    onSubmit(selectedMood, lat, lng)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        <h2>How are you feeling?</h2>
        <p className={styles.subtitle}>Select your current mood</p>

        <div className={styles.moodGrid}>
          {[1, 2, 3, 4, 5].map((mood) => (
            <button
              key={mood}
              className={`${styles.moodButton} ${
                selectedMood === mood ? styles.selected : ''
              }`}
              onClick={() => setSelectedMood(mood)}
            >
              <span className={styles.emoji}>{moodEmojis[mood - 1]}</span>
              <span className={styles.label}>{moodLabels[mood - 1]}</span>
              <span className={styles.number}>{mood}</span>
            </button>
          ))}
        </div>

        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={selectedMood === null}
        >
          Submit Mood
        </button>
      </div>
    </div>
  )
}
