"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Mood } from "@/types/interfaces/Mood";
import styles from "./Map.module.scss";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface MapProps {
  moods: Mood[];
}

const moodColors: { [key: number]: string } = {
  1: "#e74c3c", // Very bad - red
  2: "#e67e22", // Bad - orange
  3: "#f39c12", // Neutral - yellow
  4: "#2ecc71", // Good - green
  5: "#27ae60", // Very good - dark green
};

export default function Map({ moods }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard",
      center: [0, 20],
      zoom: 2,
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Add or update GeoJSON source and layer for moods
  useEffect(() => {
    if (!map.current) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: moods.map((mood) => ({
        type: "Feature",
        properties: {
          mood: mood.mood,
          timestamp: mood.timestamp,
        },
        geometry: {
          type: "Point",
          coordinates: [mood.lng, mood.lat],
        },
      })),
    };

    const addSourceAndLayer = () => {
      if (map.current?.getSource("moods")) {
        (map.current.getSource("moods") as mapboxgl.GeoJSONSource).setData(
          geojson
        );
      } else {
        map.current?.addSource("moods", {
          type: "geojson",
          data: geojson,
        });
        map.current?.addLayer({
          id: "mood-points",
          type: "circle",
          source: "moods",
          paint: {
            "circle-radius": 10,
            "circle-color": [
              "match",
              ["get", "mood"],
              1,
              "#e74c3c",
              2,
              "#e67e22",
              3,
              "#f39c12",
              4,
              "#2ecc71",
              5,
              "#27ae60",
              "#888",
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        });
      }
    };

    if (map.current?.isStyleLoaded()) {
      addSourceAndLayer();
    } else {
      map.current?.once("style.load", addSourceAndLayer);
    }

    // Popup on click
    const onClick = (e: mapboxgl.MapLayerMouseEvent) => {
      const feature = e.features && e.features[0];
      if (!feature) return;
      const { mood, timestamp } = feature.properties as any;
      new mapboxgl.Popup()
        .setLngLat((feature.geometry as any).coordinates)
        .setHTML(
          `<div style="padding: 5px;">
            <strong>Mood: ${mood}/5</strong><br/>
            <small>${new Date(Number(timestamp)).toLocaleString()}</small>
          </div>`
        )
        .addTo(map.current!);
    };
    map.current.on("click", "mood-points", onClick);

    return () => {
      if (!map.current) return;
      map.current.off("click", "mood-points", onClick);
      // Optionally remove layer/source if needed
    };
  }, [moods]);

  return <div ref={mapContainer} className={styles.mapContainer} />;
}
