// src/components/ui/heat-map.tsx
"use client";
import { useEffect, useRef, useState } from 'react';

interface HeatMapDataPoint {
  region: string;
  country: string;
  value: number;
  revenue?: number;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  lat?: number;
  lng?: number;
}

interface HeatMapProps {
  title: string;
  data: HeatMapDataPoint[];
  valueKey: 'revenue' | 'spend' | 'impressions' | 'clicks' | 'conversions';
  className?: string;
  height?: number;
}

// UAE city coordinates
const UAE_CITY_COORDINATES: { [key: string]: [number, number] } = {
  'Dubai': [25.2048, 55.2708],
  'Sharjah': [25.3460, 55.4200],
  'Abu Dhabi': [24.4539, 54.3773],
  'Al Ain': [24.1302, 55.8023],
  'Ras Al Khaimah': [25.6741, 55.9804],
  'Fujairah': [25.1288, 56.3265],
  'Ajman': [25.4052, 55.5136],
  'Umm Al Quwain': [25.5653, 55.5533]
};

// Simple interface for Leaflet
interface LeafletMap {
  remove: () => void;
  setView: (center: [number, number], zoom: number) => void;
  fitBounds: (bounds: any, padding?: any) => void;
}

export function HeatMap({ 
  title, 
  data, 
  valueKey,
  className = "", 
  height = 500
}: HeatMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true only on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cleanup function for map
  const cleanupMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    markersRef.current = [];
    setMapLoaded(false);
  };

  // Load and initialize map only on client side
  useEffect(() => {
    if (!isClient || !mapRef.current || !data.length) return;

    let isMounted = true;

    const initializeMap = async () => {
      try {
        // Clean up any existing map first
        cleanupMap();

        // Check if Leaflet is already loaded
        if (typeof window === 'undefined' || !window.L) {
          // Load Leaflet CSS if not already loaded
          if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            document.head.appendChild(link);
          }

          // Load Leaflet JS if not already loaded
          if (!window.L) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
              script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
              script.crossOrigin = '';
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }
        }

        if (!isMounted || !mapRef.current) return;

        const L = window.L;
        
        // Check if the container already has a map
        if (mapRef.current._leaflet_id) {
          // Container already has a map, skip initialization
          console.warn('Map container already initialized');
          return;
        }
        
        // Initialize map
        const map: LeafletMap = L.map(mapRef.current).setView([24.5, 54.5], 8);
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        // Calculate min and max values for scaling
        const values = data.map(item => item[valueKey] || item.value);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const valueRange = maxValue - minValue;

        const markers: any[] = [];

        data.forEach(item => {
          const coordinates = UAE_CITY_COORDINATES[item.region] || [25.0, 55.0];
          const value = item[valueKey] || item.value;
          
          // Calculate radius based on value
          const normalizedValue = valueRange > 0 ? (value - minValue) / valueRange : 0.5;
          const radius = 5000 + normalizedValue * 45000;

          // Calculate color based on value
          const hue = valueKey === 'revenue' 
            ? 120 * normalizedValue
            : 240 - (120 * normalizedValue);
          
          const color = `hsl(${hue}, 70%, 50%)`;

          const circle = L.circle(coordinates, {
            color: color,
            fillColor: color,
            fillOpacity: 0.4,
            radius: radius,
            weight: 2,
          }).addTo(map);

          // Create popup content
          const popupContent = `
            <div class="p-3 text-gray-900 min-w-48">
              <h3 class="font-bold text-lg text-gray-800">${item.region}</h3>
              <p class="text-sm text-gray-600 mb-2">${item.country}</p>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-700">Revenue:</span>
                  <span class="font-semibold text-green-600">$${item.revenue?.toLocaleString()}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-700">Spend:</span>
                  <span class="font-semibold text-blue-600">$${item.spend?.toLocaleString()}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-700">Impressions:</span>
                  <span class="font-semibold">${item.impressions?.toLocaleString()}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-700">Clicks:</span>
                  <span class="font-semibold">${item.clicks?.toLocaleString()}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-700">Conversions:</span>
                  <span class="font-semibold">${item.conversions?.toLocaleString()}</span>
                </div>
                <div class="flex justify-between border-t border-gray-300 pt-1 mt-1">
                  <span class="text-gray-700 font-medium">ROAS:</span>
                  <span class="font-bold text-purple-600">
                    ${item.spend && item.revenue ? (item.revenue / item.spend).toFixed(1) + 'x' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          `;

          circle.bindPopup(popupContent);

          // Add hover effects
          circle.on('mouseover', function (this: any) {
            this.setStyle({
              fillOpacity: 0.7,
              weight: 3
            });
          });

          circle.on('mouseout', function (this: any) {
            this.setStyle({
              fillOpacity: 0.4,
              weight: 2
            });
          });

          markers.push(circle);
        });

        markersRef.current = markers;

        // Fit map to show all markers
        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }

        setMapLoaded(true);

      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMounted) {
          setMapLoaded(false);
        }
      }
    };

    // Add a small delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      cleanupMap();
    };
  }, [isClient, data, valueKey]);

  // Format value based on the key
  const formatValue = (value: number) => {
    if (valueKey === 'revenue' || valueKey === 'spend') {
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return value.toLocaleString();
  };

  // Get value label based on key
  const getValueLabel = () => {
    switch (valueKey) {
      case 'revenue': return 'Revenue';
      case 'spend': return 'Spend';
      case 'impressions': return 'Impressions';
      case 'clicks': return 'Clicks';
      case 'conversions': return 'Conversions';
      default: return 'Value';
    }
  };

  // Don't render map container during SSR
  if (!isClient) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
        <div className="flex items-center justify-center bg-gray-700 rounded-lg border border-gray-600" style={{ height: `${height}px` }}>
          <div className="text-white">Loading map...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      {/* Loading state */}
      {!mapLoaded && (
        <div className="flex items-center justify-center bg-gray-700 rounded-lg border border-gray-600" style={{ height: `${height}px` }}>
          <div className="text-white">Loading map...</div>
        </div>
      )}
      
      {/* Leaflet Map Container - Only render when client-side */}
      <div 
        ref={mapRef}
        className={`rounded-lg overflow-hidden border border-gray-600 bg-gray-700 ${!mapLoaded ? 'hidden' : ''}`}
        style={{ height: `${height}px` }}
      />
      
      {/* Legend */}
      {mapLoaded && (
        <>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-400">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="whitespace-nowrap">Smaller {getValueLabel()}</span>
              <div className="flex items-center space-x-1 overflow-x-auto">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const values = data.map(item => item[valueKey] || item.value);
                  const maxValue = Math.max(...values);
                  const minValue = Math.min(...values);
                  const valueRange = maxValue - minValue;
                  const value = minValue + ratio * valueRange;
                  const radius = 5000 + ratio * 45000;
                  const hue = valueKey === 'revenue' 
                    ? 120 * ratio
                    : 240 - (120 * ratio);
                  const color = `hsl(${hue}, 70%, 50%)`;

                  return (
                    <div key={ratio} className="flex flex-col items-center shrink-0">
                      <div
                        className="rounded-full border-2 border-white/20"
                        style={{
                          width: `${Math.max(8, radius / 6000)}px`,
                          height: `${Math.max(8, radius / 6000)}px`,
                          backgroundColor: color,
                          minWidth: '8px',
                          minHeight: '8px',
                          maxWidth: '25px',
                          maxHeight: '25px'
                        }}
                      />
                      <span className="text-xs mt-1 whitespace-nowrap">{formatValue(value)}</span>
                    </div>
                  );
                })}
              </div>
              <span className="whitespace-nowrap">Larger {getValueLabel()}</span>
            </div>
            
            {/* Color Legend */}
            <div className="flex items-center space-x-3 text-xs shrink-0">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-1 border border-gray-600" 
                  style={{ 
                    backgroundColor: valueKey === 'revenue' ? 'hsl(0, 70%, 50%)' : 'hsl(240, 70%, 50%)' 
                  }} 
                />
                <span>Low</span>
              </div>
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-1 border border-gray-600" 
                  style={{ 
                    backgroundColor: valueKey === 'revenue' ? 'hsl(60, 70%, 50%)' : 'hsl(180, 70%, 50%)' 
                  }} 
                />
                <span>Medium</span>
              </div>
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-1 border border-gray-600" 
                  style={{ 
                    backgroundColor: valueKey === 'revenue' ? 'hsl(120, 70%, 50%)' : 'hsl(120, 70%, 50%)' 
                  }} 
                />
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Click on any bubble to see detailed performance metrics • Hover for highlight
          </div>
        </>
      )}
    </div>
  );
}
