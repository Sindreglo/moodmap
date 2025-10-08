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
          clusterMaxZoom: 14,
          clusterRadius: 40,
          // Standard Mapbox syntax: each property is an accumulating expression (no explicit initial needed)
          clusterProperties: {
            sum: ["+", ["get", "mood"]], // running sum of mood
            count: ["+", 1], // running count of points
          },
        });

        // Cluster circles with color based on average mood (sum/count)
        map.current?.addLayer({
          id: "clusters",
          type: "circle",
          source: "moods",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              [
                "case",
                ["==", ["get", "count"], 0],
                0,
                ["/", ["get", "sum"], ["get", "count"]],
              ],
              "#e74c3c", // <2
              2,
              "#e67e22",
              3,
              "#f39c12",
              4,
              "#2ecc71",
              5,
              "#27ae60",
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

        // Cluster label: show average mood (rounded) and count
        map.current?.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "moods",
          filter: ["has", "point_count"],
          layout: {
            // Format: avg (count)
            "text-field": [
              "format",
              [
                "to-string",
                [
                  "round",
                  [
                    "case",
                    ["==", ["get", "count"], 0],
                    0,
                    ["/", ["get", "sum"], ["get", "count"]],
                  ],
                ],
              ],
              { "font-scale": 1.1 },
              " ",
              {},
              "(",
              { "font-scale": 0.9 },
              ["to-string", ["get", "point_count_abbreviated"]],
              { "font-scale": 0.9 },
              ")",
              { "font-scale": 0.9 },
            ],
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
