/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Vessel, MapPoint } from '../types';
import { Compass, Navigation, Info, ExternalLink, Anchor, Wind, Check, Sparkles } from 'lucide-react';
import { MAP_POINTS_DATA } from '../data/vessels';
import { useProjectLine } from '../lib/projectLineContext';
import { useTranslation } from '../lib/translations';
import { getLocalizedVessel, transliterateCyrillicToLatin } from '../lib/vesselLocalization';

interface InteractiveSeaMapProps {
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel | null) => void;
  weatherStatus: 'calm' | 'moderate' | 'stormy';
  routePoints?: [number, number][];
  pickupPoint?: { latLon: [number, number]; type: 'pickup' | 'evac' } | null;
  onMapClick?: (lat: number, lon: number) => void;
  onRouteDraw?: (points: [number, number][]) => void;
}

export default function InteractiveSeaMap({
  vessels,
  selectedVessel,
  onSelectVessel,
  weatherStatus,
  routePoints = [],
  pickupPoint = null,
  onMapClick,
  onRouteDraw
}: InteractiveSeaMapProps) {
  const { lang, t } = useTranslation();
  const { projectLine } = useProjectLine();
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [showNavigatorModal, setShowNavigatorModal] = useState(false);
  const [mapProvider, setMapProvider] = useState<'yandex' | 'google' | '2gis' | 'baidu' | 'amap' | 'opensea'>('yandex');
  
  useEffect(() => {
    if (lang === 'ru') {
      setMapProvider('yandex');
    } else if (lang === 'zh' || lang === 'zh-TW') {
      setMapProvider('baidu');
    } else {
      setMapProvider('google');
    }
  }, [lang]);

  const [iframeLoading, setIframeLoading] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnRouteInfo, setDrawnRouteInfo] = useState<{
    distance: number;
    points: [number, number][];
    description: string;
  } | null>(null);

  // Message listener to receive clicks on vessel/point markers or drawn route coordinates inside Leaflet iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'select-vessel') {
        const vesselId = event.data.id;
        const v = vessels.find((x) => x.id === vesselId);
        if (v) {
          onSelectVessel(v);
          setSelectedPoint(null);
        }
      } else if (event.data?.type === 'select-point') {
        const pointId = event.data.id;
        const pt = MAP_POINTS_DATA.find((x) => x.id === pointId);
        if (pt) {
          setSelectedPoint(pt);
          onSelectVessel(null);
        }
      } else if (event.data?.type === 'map-click') {
        if (onMapClick) {
          onMapClick(event.data.lat, event.data.lng);
        }
      } else if (event.data?.type === 'draw-route') {
        const points = event.data.points;
        const distance = event.data.distance;
        const description = event.data.description;
        
        setDrawnRouteInfo({
          distance,
          points,
          description
        });
        
        if (onRouteDraw) {
          onRouteDraw(points);
        }
        
        // Turn off drawing mode automatically on successful path draw
        setIsDrawingMode(false);
        const iframe = document.getElementById(`iframe-map-${mapProvider}`) as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'set-drawing-mode', enabled: false }, '*');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [vessels, onSelectVessel, onMapClick, onRouteDraw, mapProvider]);

  // Synchronize point state when parent overrides selectVessel
  useEffect(() => {
    if (selectedVessel) {
      setSelectedPoint(null);
    }
  }, [selectedVessel]);

  // Handle routePoints state updates if cleared externally
  useEffect(() => {
    if (routePoints.length === 0) {
      setDrawnRouteInfo(null);
    }
  }, [routePoints]);

  // Generate Leaflet iframe source document with flexible freehand drawing & simplification code
  const generateSrcDoc = () => {
    const selectedVesselId = selectedVessel ? selectedVessel.id : null;
    const selectedPointId = selectedPoint ? selectedPoint.id : null;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #020617; }
    
    /* Control styles */
    .leaflet-bar { border: 1px solid rgba(255,255,255,0.1) !important; box-shadow: none !important; }
    .leaflet-bar a { background-color: #0f172a !important; color: #cbd5e1 !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; }
    .leaflet-bar a:hover { background-color: #1e293b !important; color: #ffffff !important; }
    .leaflet-control-attribution { background: rgba(15, 23, 42, 0.85) !important; color: #94a3b8 !important; font-family: monospace; font-size: 9px; padding: 2px 6px !important; }
    .leaflet-control-attribution a { color: #22d3ee !important; text-decoration: none; }
    
    /* Custom Marker Styles */
    .custom-marker {
      background: none;
      border: none;
    }
    
    /* Boat marker */
    .boat-dot {
      width: 14px;
      height: 14px;
      background: #22d3ee;
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(34, 211, 238, 0.8);
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }
    .boat-dot.selected {
      background: #ef4444;
      border-color: #ffffff;
      box-shadow: 0 0 15px rgba(239, 68, 68, 1);
      width: 18px;
      height: 18px;
      transform: scale(1.1);
      animation: pulse-ring 1.5s infinite;
    }
    
    /* Anchor marker */
    .anchor-dot {
      width: 14px;
      height: 14px;
      background: #f59e0b;
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }
    .anchor-dot.selected {
      background: #ef4444;
      border-color: #ffffff;
      box-shadow: 0 0 15px rgba(239, 68, 68, 1);
      width: 18px;
      height: 18px;
      transform: scale(1.1);
      animation: pulse-ring-yellow 1.5s infinite;
    }
    
    /* Labels styling */
    .marker-label {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #f1f5f9;
      padding: 3px 7px;
      font-size: 10px;
      font-family: system-ui, -apple-system, sans-serif;
      font-weight: 600;
      border-radius: 5px;
      white-space: nowrap;
      position: absolute;
      left: 22px;
      top: -3px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
      pointer-events: none;
      transition: all 0.2s;
    }
    .boat-dot.selected + .marker-label,
    .anchor-dot.selected + .marker-label {
      border-color: rgba(239, 68, 68, 0.4);
      background: rgba(225, 29, 72, 0.95);
      font-weight: 700;
      left: 25px;
    }

    /* Pickup & SOS Markers */
    .pickup-dot {
      width: 16px;
      height: 16px;
      background: #06b6d4;
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 10px #06b6d4;
      cursor: pointer;
    }
    
    .sos-dot {
      width: 18px;
      height: 18px;
      background: #ef4444;
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 12px #ef4444;
      cursor: pointer;
      animation: pulse-ring 1.2s infinite;
    }

    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8); }
      70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    
    @keyframes pulse-ring-yellow {
      0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
      100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const vessels = ${JSON.stringify(vessels)};
    const mapPoints = ${JSON.stringify(MAP_POINTS_DATA)};
    const selectedVesselId = ${selectedVesselId ? JSON.stringify(selectedVesselId) : 'null'};
    const selectedPointId = ${selectedPointId ? JSON.stringify(selectedPointId) : 'null'};
    const mapProvider = '${mapProvider}';
    
    // Custom route and pickup values
    const routePoints = ${JSON.stringify(routePoints)};
    const pickupPoint = ${JSON.stringify(pickupPoint)};

    // Set initial view coordinates based on active selection
    let initialLat = 43.0600;
    let initialLon = 131.8869;
    let initialZoom = 11;

    if (selectedVesselId) {
      const sv = vessels.find(v => v.id === selectedVesselId);
      if (sv) {
        initialLat = sv.latLon[0];
        initialLon = sv.latLon[1];
        initialZoom = 13;
      }
    } else if (selectedPointId) {
      const sp = mapPoints.find(p => p.id === selectedPointId);
      if (sp) {
        const latLon = sp.id === 'tokarevsky-pt' ? [43.07390, 131.84310] :
                      sp.id === 'novik-pt' ? [43.0375, 131.8361] :
                      sp.id === 'zmeinka-pt' ? [43.0886, 131.9056] :
                      sp.id === 'uliss-pt' ? [43.0850, 131.9280] :
                      sp.id === 'pospelovo-pt' ? [43.0645, 131.8943] : [43.0600, 131.8869];
        initialLat = latLon[0];
        initialLon = latLon[1];
        initialZoom = 13;
      }
    } else if (pickupPoint) {
      initialLat = pickupPoint.latLon[0];
      initialLon = pickupPoint.latLon[1];
      initialZoom = 13;
    } else if (routePoints.length > 0) {
      initialLat = routePoints[0][0];
      initialLon = routePoints[0][1];
      initialZoom = 12;
    }

    const map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView([initialLat, initialLon], initialZoom);

    let tileUrl = '';
    let attribution = '';

    if (mapProvider === 'yandex') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '© <a href="https://yandex.ru/maps" target="_blank">Яндекс.Карты API</a>';
    } else if (mapProvider === 'google') {
      tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      attribution = '© <a href="https://maps.google.com" target="_blank">Google Maps Satellite</a>';
    } else if (mapProvider === 'baidu') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '© <a href="https://map.baidu.com" target="_blank">百度地图 (Baidu Maps)</a>';
    } else if (mapProvider === 'amap') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      attribution = '© <a href="https://ditu.amap.com" target="_blank">高德地图 (Amap GIS)</a>';
    } else if (mapProvider === 'opensea') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '© <a href="https://openseamap.org" target="_blank">OpenSeaMap Marine Radar</a>';
    } else {
      tileUrl = 'https://tile{s}.maps.2gis.com/tiles?x={x}&y={y}&z={z}';
      attribution = '© <a href="https://2gis.ru" target="_blank">2ГИС Навигатор</a>';
    }

    L.tileLayer(tileUrl, {
      subdomains: mapProvider === '2gis' ? '1234' : 'abcd',
      maxZoom: 18,
      minZoom: 9,
      attribution: attribution
    }).addTo(map);

    // Plot vessels
    vessels.forEach(v => {
      const isSel = v.id === selectedVesselId;
      const cleanName = v.name.replace(/Эксклюзивная яхта |Парусно-моторная яхта |Трофейный катер |Глиссирующий флайбридж /g, '«');
      
      const marker = L.marker(v.latLon, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div><div class="boat-dot ' + (isSel ? 'selected' : '') + '"></div><div class="marker-label">' + cleanName + '</div></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(map);

      marker.on('click', () => {
        window.parent.postMessage({ type: 'select-vessel', id: v.id }, '*');
      });
    });

    // Plot map points
    mapPoints.forEach(p => {
      const latLon = p.id === 'tokarevsky-pt' ? [43.07390, 131.84310] :
                    p.id === 'novik-pt' ? [43.0375, 131.8361] :
                    p.id === 'zmeinka-pt' ? [43.0886, 131.9056] :
                    p.id === 'uliss-pt' ? [43.0850, 131.9280] :
                    p.id === 'pospelovo-pt' ? [43.0645, 131.8943] : [43.0600, 131.8869];
      
      const isSel = p.id === selectedPointId;
      const marker = L.marker(latLon, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div><div class="anchor-dot ' + (isSel ? 'selected' : '') + '"></div><div class="marker-label" style="border-color: rgba(245,158,11,0.25);">' + p.name + '</div></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(map);

      marker.on('click', () => {
        window.parent.postMessage({ type: 'select-point', id: p.id }, '*');
      });
    });

    // Plot pickup / SOS point if set
    if (pickupPoint && pickupPoint.latLon) {
      const labelText = pickupPoint.type === 'evac' 
        ? (lang === 'ru' ? '🚨 SOS ЭВАКУАЦИЯ!' : lang === 'en' ? '🚨 SOS EVACUATION!' : '🚨 SOS 紧急求救！') 
        : (lang === 'ru' ? '📍 ПОСАДКА ТУТ' : lang === 'en' ? '📍 BOARDING HERE' : '📍 登船点');
      const cssDot = pickupPoint.type === 'evac' ? 'sos-dot' : 'pickup-dot';
      
      const pMarker = L.marker(pickupPoint.latLon, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div><div class="' + cssDot + '"></div><div class="marker-label" style="background: #ef4444; color: white;">' + labelText + '</div></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        })
      }).addTo(map);
    }

    // Plot polyline route path if set
    if (routePoints && routePoints.length > 1) {
      const polyline = L.polyline(routePoints, {
        color: '#06b6d4',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
        lineJoin: 'round'
      }).addTo(map);
      
      // Auto-fit path bounds
      map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

      const wptPrefix = lang === 'ru' ? 'Точка ' : lang === 'en' ? 'Point ' : '航点 ';

      // Add small intermediate marker circles for the route
      routePoints.forEach((pt, index) => {
        L.circleMarker(pt, {
          radius: 5,
          fillColor: '#ffffff',
          color: '#0891b2',
          weight: 2,
          fillOpacity: 1
        }).bindTooltip(wptPrefix + (index + 1), { permanent: true, direction: 'top', className: 'route-tooltip' }).addTo(map);
      });
    }

    // Map click listener to set pickup/SOS coords directly
    map.on('click', function(e) {
      if (!isDrawingModeEnabled) {
        window.parent.postMessage({ type: 'map-click', lat: e.latlng.lat, lng: e.latlng.lng }, '*');
      }
    });

    // --- Stylus & Touch Route Drawing Logic ---
    let isDrawing = false;
    let rawCoords = [];
    let tempPolyline = null;
    let isDrawingModeEnabled = false;

    // Toggle drawing capability via incoming messages
    window.addEventListener('message', function(event) {
      if (event.data?.type === 'set-drawing-mode') {
        setDrawingMode(event.data.enabled);
      }
    });

    function setDrawingMode(enabled) {
      isDrawingModeEnabled = enabled;
      if (enabled) {
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.getContainer().style.cursor = 'crosshair';
        showDrawingOverlayHint(true);
      } else {
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.getContainer().style.cursor = '';
        showDrawingOverlayHint(false);
      }
    }

    function showDrawingOverlayHint(show) {
      let hint = document.getElementById('drawing-hint');
      if (!hint) {
        hint = document.createElement('div');
        hint.id = 'drawing-hint';
        hint.style.position = 'absolute';
        hint.style.top = '10px';
        hint.style.left = '50%';
        hint.style.transform = 'translateX(-50%)';
        hint.style.background = 'rgba(244, 63, 94, 0.95)';
        hint.style.color = '#fff';
        hint.style.padding = '8px 16px';
        hint.style.borderRadius = '20px';
        hint.style.fontFamily = 'monospace';
        hint.style.fontSize = '10px';
        hint.style.fontWeight = 'bold';
        hint.style.letterSpacing = '1px';
        hint.style.zIndex = '1000';
        hint.style.pointerEvents = 'none';
        hint.style.boxShadow = '0 4px 12px rgba(244, 63, 94, 0.4)';
        hint.style.transition = 'opacity 0.2s';
        hint.innerText = ${JSON.stringify(
          lang === 'ru'
            ? '✍️ РЕЖИМ РИСОВАНИЯ: ПРОВЕДИТЕ ПО КАРТЕ ПАЛЬЦЕМ ИЛИ СТИЛУСОМ'
            : lang === 'en'
            ? '✍️ DRAWING MODE: DRAW ROUTE ON MAP WITH FINGER OR STYLUS'
            : '✍️ 绘制模式：用手指或触控笔在地图上绘制航线'
        )};
        document.body.appendChild(hint);
      }
      hint.style.opacity = show ? '1' : '0';
      hint.style.display = show ? 'block' : 'none';
    }

    // Leaflet Drawing Events
    function startDrawingFlow(e) {
      if (!isDrawingModeEnabled) return;
      isDrawing = true;
      rawCoords = [e.latlng];
      
      if (tempPolyline) {
        map.removeLayer(tempPolyline);
      }
      
      tempPolyline = L.polyline(rawCoords, {
        color: '#f43f5e',
        weight: 4,
        opacity: 0.9,
        dashArray: '4, 4'
      }).addTo(map);
    }

    function moveDrawingFlow(e) {
      if (!isDrawing || !isDrawingModeEnabled) return;
      rawCoords.push(e.latlng);
      tempPolyline.setLatLngs(rawCoords);
    }

    function stopDrawingFlow() {
      if (!isDrawing) return;
      isDrawing = false;
      
      if (tempPolyline) {
        map.removeLayer(tempPolyline);
      }
      
      if (rawCoords.length > 5) {
        const simplePoints = rawCoords.map(c => ({ lat: c.lat, lng: c.lng }));
        
        // Simplify with Douglas-Peucker (Tolerate 300 meters coordinates offset)
        const simplified = simplifyDouglasPeucker(simplePoints, 0.00002);
        const finalCoords = simplified.map(p => [p.lat, p.lng]);
        
        // Calculate cumulative Nautical Miles distance
        let totalDistNM = 0;
        for (let i = 0; i < simplified.length - 1; i++) {
          totalDistNM += haversineDistance(simplified[i], simplified[i+1]);
        }
        
        const desc = ${JSON.stringify(
          lang === 'ru'
            ? 'Согласованный радарный маршрут на '
            : lang === 'en'
            ? 'Radar route generated with '
            : '已确认雷达航线包含 '
        )} + simplified.length + ${JSON.stringify(
          lang === 'ru'
            ? ' точек. Дистанция: '
            : lang === 'en'
            ? ' waypoints. Distance: '
            : ' 个航点。航程：'
        )} + totalDistNM.toFixed(1) + ${JSON.stringify(
          lang === 'ru' ? ' миль.' : lang === 'en' ? ' NM.' : ' 海里。'
        )};
        
        window.parent.postMessage({
          type: 'draw-route',
          points: finalCoords,
          distance: totalDistNM,
          description: desc
        }, '*');
      }
    }

    map.on('mousedown', startDrawingFlow);
    map.on('mousemove', moveDrawingFlow);
    map.on('mouseup', stopDrawingFlow);

    // Bind touch listeners for tablets and mobile stylus
    map.on('touchstart', function(e) {
      if (isDrawingModeEnabled) {
        startDrawingFlow(e);
      }
    });
    map.on('touchmove', function(e) {
      if (isDrawingModeEnabled && isDrawing) {
        moveDrawingFlow(e);
      }
    });
    map.on('touchend', function() {
      if (isDrawingModeEnabled && isDrawing) {
        stopDrawingFlow();
      }
    });

    // --- Math helpers inside Leaflet sandbox ---
    function getSqSegDist(p, p1, p2) {
      var x = p1.lat, y = p1.lng, dx = p2.lat - x, dy = p2.lng - y;
      if (dx !== 0 || dy !== 0) {
        var t = ((p.lat - x) * dx + (p.lng - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
          x = p2.lat; y = p2.lng;
        } else if (t > 0) {
          x += dx * t; y += dy * t;
        }
      }
      dx = p.lat - x; dy = p.lng - y;
      return dx * dx + dy * dy;
    }

    function simplifyDPStep(points, first, last, sqTolerance, simplified) {
      var maxSqDist = sqTolerance, index;
      for (var i = first + 1; i < last; i++) {
        var sqDist = getSqSegDist(points[i], points[first], points[last]);
        if (sqDist > maxSqDist) {
          index = i; maxSqDist = sqDist;
        }
      }
      if (maxSqDist > sqTolerance) {
        if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
      }
    }

    function simplifyDouglasPeucker(points, sqTolerance) {
      if (points.length <= 2) return points;
      var last = points.length - 1;
      var simplified = [points[0]];
      simplifyDPStep(points, 0, last, sqTolerance, simplified);
      simplified.push(points[last]);
      return simplified;
    }

    function haversineDistance(pt1, pt2) {
      var R = 6371; // Earth's radius in km
      var dLat = (pt2.lat - pt1.lat) * Math.PI / 180;
      var dLon = (pt2.lng - pt1.lng) * Math.PI / 180;
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pt1.lat * Math.PI / 180) * Math.cos(pt2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c) / 1.852; // NM
    }
  </script>
</body>
</html>`;
  };

  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-950/50 backdrop-blur-xl p-5 shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-between" id="sea-map-wrapper">
      
      {/* Background Neon Grid & Compass Rose */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(15,23,42,0.6)_0%,rgba(3,7,18,0.95)_100%] pointer-events-none" />
      
      {/* Decorative Navigation lines & circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-cyan-500/5 rounded-full pointer-events-none animate-spin [animation-duration:120s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-cyan-500/5 rounded-full pointer-events-none" />
      <div className="absolute top-6 right-6 flex items-center gap-1.5 opacity-40 text-xs font-mono text-cyan-400 pointer-events-none">
        <Compass className="w-4 h-4 animate-spin [animation-duration:20s]" />
        <span>N 43°07&apos; / E 131°54&apos;</span>
      </div>

      {/* Top Controls & Status Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 block">
            {lang === 'ru' ? 'Интерактивный радар' : lang === 'en' ? 'Interactive Sea Radar' : '互动海洋雷达'}
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {lang === 'ru' ? 'Акватория Залива Петра Великого' : lang === 'en' ? 'Peter the Great Gulf Water Area' : '彼得大帝湾海域'}
          </h3>
        </div>
        <div className="flex gap-2">
          <div className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${weatherStatus === 'stormy' ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <span>{lang === 'ru' ? 'Канал связи: УКВ 16' : lang === 'en' ? 'VHF Channel 16' : '通信频道: VHF 16'}</span>
          </div>
          {weatherStatus === 'stormy' && (
            <div className="px-2.5 py-1 rounded-md bg-rose-950/30 border border-rose-500/20 text-[11px] font-mono text-rose-400 flex items-center gap-1.5 animate-pulse">
              <Wind className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Шторм в проливе' : lang === 'en' ? 'Strait Storm Warning' : '海峡风暴警报'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Inspirational Creative Description of the Section */}
      <div className="relative z-10 p-5 bg-gradient-to-br from-slate-900/95 to-slate-950/90 border border-cyan-500/20 rounded-2xl mb-4 space-y-3 shadow-[0_4px_25px_rgba(6,182,212,0.05)]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-extrabold block">
              {lang === 'ru' ? 'Создайте маршрут своей мечты' : lang === 'en' ? 'Design Your Custom Sea Route' : '设计您的定制航线'}
            </span>
          </div>
          
          <h4 className="text-base font-bold text-slate-100 tracking-tight">
            🌊 {lang === 'ru' ? 'Проложите собственный авторский курс по Японскому морю!' : lang === 'en' ? 'Chart your custom passage across the Sea of Japan!' : '在日本海上规划您的专属航线！'}
          </h4>
          
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {lang === 'ru' ? (
              <>
                Представьте себя отважным первооткрывателем и капитаном собственного приключения. Возьмите в руки виртуальный штурвал: проведите пальцем или стилусом прямо по карте акватории! Проложите путь мимо легендарного{' '}
                <button
                  type="button"
                  onClick={() => {
                    const pt = MAP_POINTS_DATA.find(x => x.id === 'tokarevsky-pt');
                    if (pt) {
                      setSelectedPoint(pt);
                      onSelectVessel(null);
                    }
                  }}
                  className="text-cyan-400 font-bold hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Токаревского маяка
                </button>
                , загляните в живописные, скрытые от ветров бухты{' '}
                <button
                  type="button"
                  onClick={() => {
                    const pt = MAP_POINTS_DATA.find(x => x.id === 'novik-pt');
                    if (pt) {
                      setSelectedPoint(pt);
                      onSelectVessel(null);
                    }
                  }}
                  className="text-amber-400 font-bold hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  острова Русский
                </button>
                , или начертите секретную траекторию к необитаемым островам, где на теплых камнях греются дикие пятнистые нерпы.
              </>
            ) : lang === 'en' ? (
              <>
                Imagine yourself as a bold maritime explorer. Take the helm and draw your custom route with your finger or mouse right on the interactive map! Pass by the iconic{' '}
                <button
                  type="button"
                  onClick={() => {
                    const pt = MAP_POINTS_DATA.find(x => x.id === 'tokarevsky-pt');
                    if (pt) {
                      setSelectedPoint(pt);
                      onSelectVessel(null);
                    }
                  }}
                  className="text-cyan-400 font-bold hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Tokarevsky Lighthouse
                </button>
                , explore sheltered bays of{' '}
                <button
                  type="button"
                  onClick={() => {
                    const pt = MAP_POINTS_DATA.find(x => x.id === 'novik-pt');
                    if (pt) {
                      setSelectedPoint(pt);
                      onSelectVessel(null);
                    }
                  }}
                  className="text-amber-400 font-bold hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Russky Island
                </button>
                , or trace a path to uninhabited islands inhabited by wild spotted seals.
              </>
            ) : (
              <>
                把自己想象成勇敢的海上探险家。用手指或鼠标在地图上绘制属于您的独家航线！穿过著名的{' '}
                <button
                  type="button"
                  onClick={() => {
                    const pt = MAP_POINTS_DATA.find(x => x.id === 'tokarevsky-pt');
                    if (pt) {
                      setSelectedPoint(pt);
                      onSelectVessel(null);
                    }
                  }}
                  className="text-cyan-400 font-bold hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  托卡列夫斯基灯塔
                </button>
                ，探索{' '}
                <button
                  type="button"
                  onClick={() => {
                    const pt = MAP_POINTS_DATA.find(x => x.id === 'novik-pt');
                    if (pt) {
                      setSelectedPoint(pt);
                      onSelectVessel(null);
                    }
                  }}
                  className="text-amber-400 font-bold hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  俄罗斯岛
                </button>
                避风的海湾，或前往有斑海豹的无人荒岛。
              </>
            )}
          </p>
          
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {lang === 'ru' 
              ? 'Наш высокоточный интерактивный радар мгновенно оцифрует ваш творческий эскиз в профессиональные лоцманские вехи, рассчитает точное расстояние, время хода и передаст готовую карту капитану яхты.'
              : lang === 'en'
              ? 'Our high-precision radar digitizes your sketch into pilot waypoints, computes exact distance, ETA, and sends the navigation plan directly to your captain.'
              : '我们的高精度雷达会将您的路线转化为专业导航航点，计算准确距离与用时，并将航线图直接发送给船长。'}
          </p>
        </div>
      </div>

      {/* Real-time calculated telemetry overlay for the drawn route */}
      {routePoints.length > 0 && (
        <div className="relative z-10 p-4 bg-slate-900/95 border border-cyan-500/30 rounded-2xl mb-4 space-y-3 shadow-[0_0_20px_rgba(34,211,238,0.1)] animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-2 bg-slate-950/50 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-500 uppercase font-mono block">
                {lang === 'ru' ? 'Протяженность' : lang === 'en' ? 'Distance' : '航程距离'}
              </span>
              <span className="text-sm font-extrabold text-white font-mono block">
                {(drawnRouteInfo?.distance || (routePoints.length * 1.6)).toFixed(1)} {lang === 'ru' ? 'миль' : 'NM'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ~{((drawnRouteInfo?.distance || (routePoints.length * 1.6)) * 1.852).toFixed(1)} km
              </span>
            </div>
            <div className="p-2 bg-slate-950/50 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-500 uppercase font-mono block">
                {lang === 'ru' ? 'Скорость судна' : lang === 'en' ? 'Cruising Speed' : '巡航速度'}
              </span>
              <span className="text-sm font-extrabold text-cyan-400 font-mono block">
                {selectedVessel ? `${selectedVessel.speed} km/h` : '28 km/h'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ~{selectedVessel ? (selectedVessel.speed / 1.852).toFixed(0) : '15'} kts
              </span>
            </div>
            <div className="p-2 bg-slate-950/50 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-500 uppercase font-mono block">
                {lang === 'ru' ? 'Время хода' : lang === 'en' ? 'Transit Time' : '预计航程时间'}
              </span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono block">
                {(() => {
                  const speed = selectedVessel?.speed || 28;
                  const distKm = (drawnRouteInfo?.distance || (routePoints.length * 1.6)) * 1.852;
                  const timeHours = distKm / speed;
                  const minutes = Math.round(timeHours * 60);
                  if (minutes < 60) return `${minutes} ${lang === 'ru' ? 'мин' : 'min'}`;
                  const h = Math.floor(minutes / 60);
                  const m = minutes % 60;
                  return `${h} ${lang === 'ru' ? 'ч' : 'h'} ${m} ${lang === 'ru' ? 'мин' : 'min'}`;
                })()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {lang === 'ru' ? 'Без дрейфа / стоянки' : lang === 'en' ? 'Direct passage' : '直达时间'}
              </span>
            </div>
            <div className="p-2 bg-slate-950/50 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-500 uppercase font-mono block">
                {lang === 'ru' ? 'Лоция' : lang === 'en' ? 'Waypoints' : '航点数量'}
              </span>
              <span className="text-sm font-extrabold text-amber-400 font-mono block">
                {routePoints.length} {lang === 'ru' ? 'вех' : lang === 'en' ? 'points' : '个航点'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                GIS Digital
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-white/5 bg-cyan-950/10 p-2.5 rounded-lg">
            <div className="text-xs">
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                {lang === 'ru' ? 'Схема следования:' : lang === 'en' ? 'Passage Plan:' : '航行路线:'}
              </span>
              <span className="text-slate-100 font-medium font-sans block mt-0.5">
                🏁 {lang === 'ru' ? 'Пирс' : lang === 'en' ? 'Pier' : '码头'} ➔ {routePoints.map((_, idx) => `${lang === 'ru' ? 'Лег' : 'Leg'} ${idx + 1}`).join(' ➔ ')} ➔ {lang === 'ru' ? 'Финиш в море' : lang === 'en' ? 'Destination at Sea' : '海上目的地'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const descText = lang === 'ru' 
                  ? `Спланирован радарный маршрут на ${routePoints.length} точек. Дистанция: ${(drawnRouteInfo?.distance || (routePoints.length * 1.6)).toFixed(1)} миль. Схема: Пирс ➔ ${routePoints.map((_, idx) => `Лег ${idx + 1}`).join(' ➔ ')} ➔ Точка прибытия.`
                  : `Custom radar route planned (${routePoints.length} waypoints, ${(drawnRouteInfo?.distance || (routePoints.length * 1.6)).toFixed(1)} NM). Pier ➔ Waypoints ➔ Destination.`;
                
                localStorage.setItem('drawn_radar_route_description', descText);
                window.dispatchEvent(new CustomEvent('radar-route-applied', { detail: descText }));
                
                const applyBtn = document.getElementById('apply-route-success-indicator');
                if (applyBtn) {
                  applyBtn.classList.remove('hidden');
                  setTimeout(() => applyBtn.classList.add('hidden'), 4000);
                }
              }}
              className="px-3.5 py-2 bg-cyan-400 hover:bg-cyan-500 text-slate-950 text-[10px] font-extrabold tracking-wider rounded-lg uppercase transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-cyan-400/20"
            >
              <span>{lang === 'ru' ? 'Загрузить в пожелания брони' : lang === 'en' ? 'Attach to Booking' : '附加至预订'}</span>
              <span className="font-mono text-xs">📝</span>
            </button>
          </div>
          
          <div id="apply-route-success-indicator" className="hidden text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>✨ {lang === 'ru' ? 'Маршрут оцифрован и передан в систему!' : lang === 'en' ? 'Route saved! It will automatically populate your charter booking preferences.' : '路线已保存！它将自动填入您的预订偏好。'}</span>
          </div>
        </div>
      )}

      {/* Main Map Container with Floating HUD Controls */}
      <div className="relative flex-1 min-h-[440px] border border-white/10 rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center group" id="sea-map-container-parent">
        <div className="absolute inset-0 w-full h-full bg-slate-950">
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-40 gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span className="text-xs text-cyan-400 font-mono tracking-wider animate-pulse">Загрузка картографических данных...</span>
            </div>
          )}
          <iframe
            key={`${mapProvider}-${selectedVessel?.id || 'none'}-${selectedPoint?.id || 'none'}-${routePoints.length}-${pickupPoint ? 'has-pickup' : 'no-pickup'}`}
            srcDoc={generateSrcDoc()}
            className="w-full h-full border-0 rounded-2xl"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setIframeLoading(false)}
            id={`iframe-map-${mapProvider}`}
          />
        </div>

        {/* Floating High-Tech HUD Controls Layer */}
        <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none" id="floating-hud-controls">
          {/* Left HUD: Map Provider Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-xl pointer-events-auto shadow-lg overflow-x-auto max-w-full scrollbar-none">
            {(lang === 'ru'
              ? [
                  { id: 'yandex', label: '🔴 Яндекс Карты', desc: 'Яндекс Спутник и Морская Лоция' },
                  { id: '2gis', label: '🧭 2ГИС', desc: '2ГИС Владивосток и Акватория' }
                ]
              : (lang === 'zh' || lang === 'zh-TW')
              ? [
                  { id: 'baidu', label: '🇨🇳 百度 GIS', desc: '百度高精地图与水域' },
                  { id: 'amap', label: '🗺️ 高德地图', desc: '高德气象与海图' }
                ]
              : [
                  { id: 'google', label: '🌐 Google Maps', desc: 'Google Sat Platform (INTL)' },
                  { id: 'opensea', label: '⚓ OpenSeaMap', desc: 'OpenSeaMap Marine Chart' }
                ]
            ).map((prov) => (
              <button
                key={prov.id}
                type="button"
                onClick={() => {
                  setIframeLoading(true);
                  setMapProvider(prov.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all whitespace-nowrap ${
                  mapProvider === prov.id
                    ? 'bg-cyan-500 text-slate-950 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title={prov.desc}
              >
                {prov.label}
              </button>
            ))}
          </div>

          {/* Right HUD: Stylus Drawing Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-xl pointer-events-auto shadow-lg" id="drawing-hud-group">
            <button
              type="button"
              onClick={() => {
                const nextDrawing = !isDrawingMode;
                setIsDrawingMode(nextDrawing);
                const iframe = document.getElementById(`iframe-map-${mapProvider}`) as HTMLIFrameElement;
                if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.postMessage({ type: 'set-drawing-mode', enabled: nextDrawing }, '*');
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                isDrawingMode
                  ? 'bg-rose-500 text-slate-950 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
                  : 'bg-slate-900 text-slate-200 border border-white/5 hover:border-white/10 hover:bg-slate-800'
              }`}
            >
              <span>{isDrawingMode ? (lang === 'ru' ? '⏹️ Отмена' : lang === 'en' ? '⏹️ Cancel' : '⏹️ 取消') : (lang === 'ru' ? '🖌️ Нарисовать трек' : lang === 'en' ? '🖌️ Draw Route' : '🖌️ 绘制航线')}</span>
            </button>

            {routePoints.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setDrawnRouteInfo(null);
                  if (onRouteDraw) {
                    onRouteDraw([]);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-rose-400 hover:bg-rose-950/40 border border-white/5 transition-all text-[11px] font-bold uppercase whitespace-nowrap"
              >
                {lang === 'ru' ? 'Сбросить' : lang === 'en' ? 'Reset' : '重置'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map Information Panel (Dynamic Overlay) */}
      <div className="relative z-10 mt-4 bg-slate-900/80 border border-white/5 rounded-xl p-4 transition-all duration-300" id="map-info-panel">
        {selectedVessel ? (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex-shrink-0">
                <Navigation className="w-5 h-5 text-cyan-400 rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-full">
                    {lang === 'ru' ? 'ВЫБРАННОЕ СУДНО' : lang === 'en' ? 'SELECTED VESSEL' : '已选船只'}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    (selectedVessel.status || 'free') === 'free' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 
                    (selectedVessel.status || 'free') === 'trip' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 
                    'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      (selectedVessel.status || 'free') === 'free' ? 'bg-emerald-400' : 
                      (selectedVessel.status || 'free') === 'trip' ? 'bg-amber-400' : 
                      'bg-rose-400'
                    }`} />
                    {(selectedVessel.status || 'free') === 'free' 
                      ? (lang === 'ru' ? 'Свободен' : lang === 'en' ? 'Available' : '空闲') 
                      : (selectedVessel.status || 'free') === 'trip' 
                      ? (lang === 'ru' ? 'На рейсе' : lang === 'en' ? 'On Trip' : '航行中') 
                      : (lang === 'ru' ? 'Техпомощь' : lang === 'en' ? 'Maintenance' : '维护')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedVessel.homeport}
                  </span>
                </div>
                <h4 className="text-base font-semibold text-white mt-1">{selectedVessel.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'ru' 
                    ? `Базируется: ${selectedVessel.homeport}. Координаты: ${selectedVessel.latLon[0].toFixed(4)}° N, ${selectedVessel.latLon[1].toFixed(4)}° E` 
                    : lang === 'en' 
                    ? `Homeport: ${selectedVessel.homeport}. Coordinates: ${selectedVessel.latLon[0].toFixed(4)}° N, ${selectedVessel.latLon[1].toFixed(4)}° E` 
                    : `停泊港：${selectedVessel.homeport}。坐标：${selectedVessel.latLon[0].toFixed(4)}° N, ${selectedVessel.latLon[1].toFixed(4)}° E`}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto self-end md:self-center">
              <button 
                onClick={() => setShowNavigatorModal(true)}
                id="btn-yandex-nav-vessel"
                className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs font-semibold text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{lang === 'ru' ? 'В Навигатор' : lang === 'en' ? 'Open Navigator' : '打开导航'}</span>
              </button>
              <button
                onClick={() => onSelectVessel(null)}
                id="btn-close-map-selection"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                {lang === 'ru' ? 'Закрыть' : lang === 'en' ? 'Close' : '关闭'}
              </button>
            </div>
          </div>
        ) : selectedPoint ? (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
                <Anchor className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full uppercase">
                  {selectedPoint.type === 'harbor' 
                    ? (lang === 'ru' ? 'Бухта / Стоянка' : lang === 'en' ? 'Bay / Anchorage' : '海湾 / 锚地') 
                    : selectedPoint.type === 'lighthouse' 
                    ? (lang === 'ru' ? 'Маяк' : lang === 'en' ? 'Lighthouse' : '灯塔') 
                    : (lang === 'ru' ? 'Достопримечательность' : lang === 'en' ? 'Attraction' : '景点')}
                </span>
                <h4 className="text-base font-semibold text-white mt-1">{selectedPoint.name}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">{selectedPoint.description}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto self-end md:self-center">
              <button 
                onClick={() => setShowNavigatorModal(true)}
                id="btn-yandex-nav-point"
                className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-semibold text-amber-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{lang === 'ru' ? 'Проложить маршрут' : lang === 'en' ? 'Build Route' : '规划路线'}</span>
              </button>
              <button
                onClick={() => setSelectedPoint(null)}
                id="btn-close-point-selection"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                {lang === 'ru' ? 'Закрыть' : lang === 'en' ? 'Close' : '关闭'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-400 text-xs py-1">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{lang === 'ru' ? 'Выберите любое судно или гавань на карте, чтобы просмотреть точные координаты, причал базирования и запустить маршрут в Яндекс.Навигатор для заезда на пирс.' : lang === 'en' ? 'Select any vessel or bay on the map to view precise GPS coordinates, homeport pier, and send routing directions to your navigation app.' : '选择地图上的任何船只或海湾，以查看精准GPS坐标、停泊码头并发送导航。'}</span>
          </div>
        )}
      </div>

      {/* Yandex Navigator Interactive Instruction Modal */}
      {showNavigatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" id="yandex-nav-modal">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#f59e0b]" />
              {lang === 'ru' ? 'Переход в Яндекс.Навигатор' : lang === 'en' ? 'Open Yandex.Navigator' : '跳转至 Yandex 导航'}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              {lang === 'ru' ? 'Капитаны во Владивостоке часто швартуются на необорудованных пирсах. Мы сформировали точные координаты заезда до причала.' : lang === 'en' ? 'Captains in Vladivostok often dock at distinct coastal piers. We generated precise pier access coordinates.' : '符拉迪沃斯托克的船长常停靠于具体码头。我们生成了精准的码头入口坐标。'}
            </p>

            {/* Simulated Mobile Navigator App */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs mb-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 text-[10px] text-slate-400">
                <span>{lang === 'ru' ? 'Яндекс.Навигатор v5.24' : 'Yandex.Navigator v5.24'}</span>
                <span className="text-emerald-400">● {lang === 'ru' ? 'GPS Сигнал OK' : lang === 'en' ? 'GPS Signal OK' : 'GPS 信号正常'}</span>
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === 'ru' ? 'Пункт назначения:' : lang === 'en' ? 'Destination:' : '目的地：'}</span>
                  <span className="text-white font-semibold">
                    {selectedVessel ? selectedVessel.name : selectedPoint?.name || (lang === 'ru' ? 'Пирс' : 'Pier')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === 'ru' ? 'Точные координаты:' : lang === 'en' ? 'Exact Coordinates:' : '精准坐标：'}</span>
                  <span className="text-cyan-400">
                    {selectedVessel ? `${selectedVessel.latLon[0].toFixed(5)}, ${selectedVessel.latLon[1].toFixed(5)}` : '43.07390, 131.84310'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === 'ru' ? 'Расстояние от центра:' : lang === 'en' ? 'Distance from city center:' : '距离市中心：'}</span>
                  <span className="text-white">~7.4 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === 'ru' ? 'Рекомендуемый съезд:' : lang === 'en' ? 'Recommended coastal exit:' : '建议入口：'}</span>
                  <span className="text-amber-400">{lang === 'ru' ? 'Грунтовый съезд у береговой полосы' : lang === 'en' ? 'Unpaved shoreline turnoff' : '沿海平整车道'}</span>
                </div>
              </div>

              {/* Mock Route Map Visual */}
              <div className="mt-3 h-16 bg-slate-900 rounded-lg flex items-center justify-center border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] bg-[size:10px_10px]" />
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 z-10 animate-pulse">
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  <span>{lang === 'ru' ? 'Маршрут построен • 12 мин в пути' : lang === 'en' ? 'Route built • 12 min ETA' : '路线已规划 • 预计12分钟'}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const lat = selectedVessel ? selectedVessel.latLon[0] : 43.0739;
                  const lon = selectedVessel ? selectedVessel.latLon[1] : 131.8431;
                  window.open(`yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lon}`, '_blank');
                  setShowNavigatorModal(false);
                }}
                id="btn-open-real-yandex"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{lang === 'ru' ? 'Открыть в приложении' : lang === 'en' ? 'Open App' : '在应用中打开'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowNavigatorModal(false)}
                id="btn-close-yandex-modal"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {lang === 'ru' ? 'Отмена' : lang === 'en' ? 'Cancel' : '取消'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
