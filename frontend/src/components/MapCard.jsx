import { useEffect, useRef, useState } from "react";
import "./MapCard.css";

const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIB =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors';

function loadLeaflet() {
  if (typeof window === "undefined") return Promise.reject();
  if (window.L) return Promise.resolve(window.L);

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src="${LEAFLET_JS}"]`
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L));
      existingScript.addEventListener("error", reject);
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = LEAFLET_JS;
      script.async = true;
      script.onload = () => resolve(window.L);
      script.onerror = reject;
      document.body.appendChild(script);
    }
  });
}

export default function MapCard({ title, subtitle }) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let mapInstance;
    let tileLayer;
    let markers = [];

    loadLeaflet()
      .then((L) => {
        if (!mapRef.current) return;

        mapInstance = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
          worldCopyJump: true,
        });

        tileLayer = L.tileLayer(TILE_URL, {
          attribution: TILE_ATTRIB,
          maxZoom: 5,
          minZoom: 1,
          noWrap: false,
        });

        tileLayer.addTo(mapInstance);
        mapInstance.setView([25, 0], 1);

        const pins = [
          { coords: [37.77, -122.4], color: "#59ba57", radius: 5 },
          { coords: [51.5, -0.1], color: "#59ba57", radius: 10 },
          { coords: [1.35, 103.8], color: "#e05b5b", radius: 5 },
          { coords: [-33.9, 151.2], color: "#e05b5b", radius: 10 },
        ];

        markers = pins.map((p) =>
          L.circleMarker(p.coords, {
            radius: p.radius,
            color: p.color,
            fillColor: p.color,
            fillOpacity: 0.9,
            weight: 2,
          }).addTo(mapInstance)
        );

        setMapReady(true);
      })
      .catch(() => setMapReady(false));

    return () => {
      markers.forEach((m) => m.remove());
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  return (
    <div className="table-card map-card">
      <div className="map-card__header">
        <div className="table-header">
          <p className="table-title">
            {title} - <code>{subtitle}</code>
          </p>
        </div>
      </div>

      <div className="map-surface">
        <div ref={mapRef} className="leaflet-host" role="presentation" />
        {!mapReady && <div className="map-loading">Loading map...</div>}
      </div>
    </div>
  );
}
