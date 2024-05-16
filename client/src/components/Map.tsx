import "mapbox-gl/dist/mapbox-gl.css";

import { FunctionComponent, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface iMapProps {
  id?: string;
}

const initialPosition = {
  lng: 0.1276,
  lat: 51.5072,
  zoom: 10,
};

const getInitialPosition = () => {
  const url = new URL(window.location.href);
  const lng = Number(url.searchParams.get("long") || 0);
  const lat = Number(url.searchParams.get("lat") || 0);
  const zoom = Number(url.searchParams.get("zoom") || 0);

  return {
    lng: lng || initialPosition.lng,
    lat: lat || initialPosition.lat,
    zoom: zoom || initialPosition.zoom,
  };
};

const Map: FunctionComponent<iMapProps> = () => {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map>(null);
  const updatetiemout = useRef<any | null>(null);

  const _handleSavePosition = () => {
    const center = map.current?.getCenter();
    const zoom = map.current?.getZoom();

    const url = new URL(window.location.href);
    url.searchParams.set("long", center?.lng?.toFixed(4) ?? "");
    url.searchParams.set("lat", center?.lat?.toFixed(4) ?? "");
    url.searchParams.set("zoom", zoom?.toFixed(2) ?? "");
    window.history.replaceState({}, "", url.toString());
  };

  const _handleMove = () => {
    if (updatetiemout.current) clearTimeout(updatetiemout.current);
    updatetiemout.current = setTimeout(_handleSavePosition, 500);
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once

    const { lng, lat, zoom } = getInitialPosition();
    {
      // @ts-ignore
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        // style: "mapbox://styles/balazsszalay/clppasmvl010q01pkf0604a1l",
        center: [lng, lat],
        zoom: zoom,
      }) as any;

      if (!map.current) return;

      map.current?.on("load", () => {
        console.log("map loaded");
        map.current?.addSource("areas", {
          type: "geojson",
          // Use a URL for the value for the `data` property.
          data: `${import.meta.env.VITE_ENDPOINT}/api/areas`,
        });

        map.current?.addLayer({
          id: "areas-fill",
          type: "fill",
          source: "areas",
          paint: {
            "fill-color": "#2200ff",
            "fill-opacity": 0.4,
          },
        });

        map.current?.addLayer({
          id: "areas-outline",
          type: "line",
          source: "areas",
          layout: {},
          paint: {
            "line-color": "#000",
            "line-width": 3,
          },
        });
      });
    }

    map.current?.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    map.current?.on("move", _handleMove);
  }, []);
  return (
    <div ref={mapContainer} className={"flex-1 h-screen map-container"}></div>
  );
};

export default Map;
