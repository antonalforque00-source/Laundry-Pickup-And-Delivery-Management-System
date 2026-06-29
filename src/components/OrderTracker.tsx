import { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Order } from '../types';
import { motion } from 'motion/react';
import { Truck } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function RouteDisplay({ origin, destination }: {
  origin: string | google.maps.LatLngLiteral;
  destination: string | google.maps.LatLngLiteral;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map) return;
    polylinesRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => p.setMap(map));
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) map.fitBounds(routes[0].viewport);
      }
    });

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination]);

  return null;
}

interface OrderTrackerProps {
  order: Order;
}

export default function OrderTracker({ order }: OrderTrackerProps) {
  const [storeLocation, setStoreLocation] = useState<google.maps.LatLngLiteral | null>(null);
  
  // We'll hardcode a store location for the demo
  const defaultStoreLocation = { lat: 14.5995, lng: 120.9842 }; // Manila
  
  if (!hasValidKey) {
    return (
      <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="font-bold text-slate-800 mb-2">Google Maps Tracking Unavailable</h3>
        <p className="text-slate-600 text-sm mb-4">API Key is required to show the map.</p>
        <p className="text-xs text-slate-500">Add <code>GOOGLE_MAPS_PLATFORM_KEY</code> in settings to enable.</p>
      </div>
    );
  }

  const showRoute = order.status === 'Out for Delivery' || order.status === 'Pickup Scheduled';

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden shadow-inner border border-slate-200 relative">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={defaultStoreLocation}
          defaultZoom={13}
          mapId="TRACKING_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI={true}
        >
          {showRoute ? (
            <RouteDisplay origin={defaultStoreLocation} destination={order.address} />
          ) : (
            <AdvancedMarker position={defaultStoreLocation}>
              <Pin background="#0ea5e9" glyphColor="#fff" />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
      
      {showRoute && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
            <Truck size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Rider on the way</p>
            <p className="text-xs text-slate-500">{order.status === 'Out for Delivery' ? 'Heading to your location' : 'Heading to pick up'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
