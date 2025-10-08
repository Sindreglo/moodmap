'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Mood } from '@/app/page'
import styles from './Map.module.scss'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

interface MapProps {
  moods: Mood[]
}

const moodColors: { [key: number]: string } = {
  1: '#e74c3c', // Very bad - red
  2: '#e67e22', // Bad - orange
  3: '#f39c12', // Neutral - yellow
  4: '#2ecc71', // Good - green
  5: '#27ae60', // Very good - dark green
}

export default function Map({ moods }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 2,
    })

    return () => {
      map.current?.remove()
    }
  }, [])

  // Update markers when moods change
  useEffect(() => {
    if (!map.current) return

    // Remove existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Add new markers
    moods.forEach(mood => {
      const el = document.createElement('div')
      el.className = styles.marker
      el.style.backgroundColor = moodColors[mood.mood]
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.borderRadius = '50%'
      el.style.border = '2px solid white'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
      el.style.cursor = 'pointer'

      const marker = new mapboxgl.Marker(el)
        .setLngLat([mood.lng, mood.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 5px;">
                <strong>Mood: ${mood.mood}/5</strong><br/>
                <small>${new Date(mood.timestamp).toLocaleString()}</small>
              </div>
            `)
        )
        .addTo(map.current!)

      markers.current.push(marker)
    })
  }, [moods])

  return <div ref={mapContainer} className={styles.mapContainer} />
}
