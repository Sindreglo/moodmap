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
          cluster: true,
          clusterMaxZoom: 14, // Max zoom to cluster points on
          clusterRadius: 40, // Radius of each cluster when clustering points (defaults to 50)
        });

        // Cluster circles
        map.current?.addLayer({
          id: "clusters",
          type: "circle",
          source: "moods",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              10,
              "#f1f075",
              30,
              "#f28cb1",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              15,
              10,
              20,
              30,
              25,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        });

        // Cluster count labels
        map.current?.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "moods",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 14,
          },
        });

        // Unclustered points
        map.current?.addLayer({
          id: "mood-points",
          type: "circle",
          source: "moods",
          filter: ["!has", "point_count"],
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

    // Popup for unclustered points
    const onPointClick = (e: mapboxgl.MapLayerMouseEvent) => {
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
    map.current.on("click", "mood-points", onPointClick);

    // Zoom into cluster on click
    const onClusterClick = (e: mapboxgl.MapLayerMouseEvent) => {
      const features = map.current?.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      if (!features || !features.length) return;
      const clusterId = features[0].properties?.cluster_id;
      (
        map.current?.getSource("moods") as mapboxgl.GeoJSONSource
      ).getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        if (typeof zoom === "number") {
          map.current?.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom,
          });
        }
      });
    };
    map.current.on("click", "clusters", onClusterClick);

    return () => {
      if (!map.current) return;
      map.current.off("click", "mood-points", onPointClick);
      map.current.off("click", "clusters", onClusterClick);
      // Optionally remove layer/source if needed
    };
  }, [moods]);

  return <div ref={mapContainer} className={styles.mapContainer} />;
}
