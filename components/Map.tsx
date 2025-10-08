"use client";

import { useEffect, useRef } from "react";
import { moodIconPaths } from "@/lib/moodIcons";
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
          // Increased for stronger clustering
          clusterMaxZoom: 16, // clusters persist to a higher zoom level
          clusterRadius: 80, // larger radius groups more nearby points
          // Standard Mapbox syntax: each property is an accumulating expression (no explicit initial needed)
          clusterProperties: {
            sum: ["+", ["get", "mood"]], // running sum of mood
            count: ["+", 1], // running count of points
          },
        });

        // Preload icons and then add symbol layers for clusters & unclustered points
        const preloadIcons = async () => {
          for (const [key, path] of Object.entries(moodIconPaths)) {
            const id = `mood-icon-${key}`;
            if (map.current && !map.current.hasImage(id)) {
              await new Promise<void>((resolve, reject) => {
                map.current!.loadImage(path, (err, image) => {
                  if (err || !image) return reject(err);
                  if (!map.current!.hasImage(id))
                    map.current!.addImage(id, image, { pixelRatio: 2 });
                  resolve();
                });
              });
            }
          }
        };

        preloadIcons().then(() => {
          // Cluster layer (symbol) chooses icon by average mood
          if (!map.current?.getLayer("clusters")) {
            map.current?.addLayer({
              id: "clusters",
              type: "symbol",
              source: "moods",
              filter: ["has", "point_count"],
              layout: {
                "icon-image": [
                  "concat",
                  "mood-icon-",
                  [
                    "to-string",
                    [
                      "max",
                      1,
                      [
                        "min",
                        5,
                        [
                          "round",
                          [
                            "case",
                            ["==", ["get", "count"], 0],
                            3,
                            ["/", ["get", "sum"], ["get", "count"]],
                          ],
                        ],
                      ],
                    ],
                  ],
                ],
                "icon-size": [
                  "interpolate",
                  ["linear"],
                  ["get", "point_count"],
                  1,
                  0.175,
                  10,
                  0.225,
                  25,
                  0.275,
                  50,
                  0.31,
                  100,
                  0.35,
                ],
                "icon-allow-overlap": true,
              },
            });
          }
          // Unclustered mood points
          if (!map.current?.getLayer("mood-points")) {
            map.current?.addLayer({
              id: "mood-points",
              type: "symbol",
              source: "moods",
              filter: ["!has", "point_count"],
              layout: {
                "icon-image": [
                  "concat",
                  "mood-icon-",
                  ["to-string", ["get", "mood"]],
                ],
                "icon-size": 0.175,
                "icon-allow-overlap": true,
              },
            });
          }
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
