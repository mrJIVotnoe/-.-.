/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { WeatherCondition } from '../types';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Waves, 
  AlertTriangle, 
  ShieldCheck, 
  Compass, 
  Gauge, 
  Droplets, 
  Eye, 
  Clock,
  Thermometer,
  CloudSun,
  Activity,
  ExternalLink,
  Radio,
  Play,
  Pause,
  Maximize2,
  Layers,
  Zap,
  Info,
  Navigation,
  RefreshCw,
  Crosshair
} from 'lucide-react';
import { useTranslation } from '../lib/translations';

interface WeatherWidgetProps {
  currentWeather: WeatherCondition;
  onWeatherChange: (condition: WeatherCondition) => void;
  onOpenFullRadarMap?: () => void;
}

type WeatherSource = 'yandex' | 'radar' | 'windy' | 'google' | 'amap' | 'baidu';

// Fully functional, interactive high-precision Marine Meteorology & AIS Radar
const RadarSimulation = ({ 
  lang, 
  currentWeather,
  onOpenFullRadarMap 
}: { 
  lang: string; 
  currentWeather?: WeatherCondition;
  onOpenFullRadarMap?: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [radarMode, setRadarMode] = useState<'dbz' | 'wind' | 'ais'>('dbz');
  const [scaleNM, setScaleNM] = useState<number>(15); // 5, 15, 30 NM
  const [showWindyLive, setShowWindyLive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hoverInfo, setHoverInfo] = useState<{
    lat: string;
    lon: string;
    distNM: string;
    bearing: string;
    intensity: string;
    vesselName?: string;
  } | null>(null);

  // AIS Vessel Targets on Radar
  const aisVessels = [
    { name: 'Катер «Юлия 60»', xRel: -0.15, yRel: 0.20, course: 145, speed: 12.4, callsign: 'UDF-92' },
    { name: 'Яхта «Афина»', xRel: 0.25, yRel: -0.10, course: 80, speed: 6.2, callsign: 'UBR-14' },
    { name: 'Паром «Палада»', xRel: -0.05, yRel: -0.30, course: 210, speed: 14.0, callsign: 'UFL-08' },
    { name: 'Буксир «Богатырь»', xRel: 0.10, yRel: 0.35, course: 15, speed: 8.5, callsign: 'UTG-33' },
    { name: 'Катер «Флагман»', xRel: -0.35, yRel: -0.15, course: 310, speed: 15.1, callsign: 'UCR-55' },
    { name: 'Яхта «Аврора»', xRel: 0.30, yRel: 0.25, course: 170, speed: 9.0, callsign: 'UAY-77' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || showWindyLive) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angle = 0;
    let timeTick = 0;

    // Wind direction vectors
    let windDx = 0.5;
    let windDy = -0.3;
    if (currentWeather?.windDirection === 'N') { windDx = 0; windDy = 1; }
    else if (currentWeather?.windDirection === 'S') { windDx = 0; windDy = -1; }
    else if (currentWeather?.windDirection === 'E') { windDx = -1; windDy = 0; }
    else if (currentWeather?.windDirection === 'W') { windDx = 1; windDy = 0; }
    else if (currentWeather?.windDirection === 'NE') { windDx = -0.7; windDy = 0.7; }
    else if (currentWeather?.windDirection === 'SE') { windDx = -0.7; windDy = -0.7; }
    else if (currentWeather?.windDirection === 'NW') { windDx = 0.7; windDy = 0.7; }

    const windSpeedFactor = Math.max(1, (currentWeather?.windSpeed || 5) / 4);

    // Dynamic storm cloud centers
    const cloudNodes = [
      { xBase: -60, yBase: -50, r: 45, dbz: currentWeather?.status === 'stormy' ? 62 : 38 },
      { xBase: 80, yBase: -80, r: 55, dbz: currentWeather?.status === 'stormy' ? 55 : 28 },
      { xBase: -110, yBase: 70, r: 40, dbz: currentWeather?.status === 'stormy' ? 48 : 22 },
      { xBase: 120, yBase: 90, r: 60, dbz: currentWeather?.status === 'stormy' ? 58 : 32 },
    ];

    // Wind particles
    const windParticles = Array.from({ length: 60 }, () => ({
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 300,
      life: Math.random() * 100
    }));

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = 280;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Dark oceanic background with subtle radial gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(canvas.width, canvas.height));
      bgGrad.addColorStop(0, '#040d1a');
      bgGrad.addColorStop(1, '#02060d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const maxR = Math.min(canvas.width, canvas.height) * 0.44;
      const pxPerNM = maxR / scaleNM;

      // 1. Draw Range Rings & Compass Rose
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.12)';
      ctx.lineWidth = 1;
      const ringSteps = [0.25, 0.5, 0.75, 1.0];
      
      ringSteps.forEach((step) => {
        const r = maxR * step;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Ring Label
        ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
        ctx.font = '9px monospace';
        const distVal = (scaleNM * step).toFixed(scaleNM <= 5 ? 1 : 0);
        const kmVal = (scaleNM * step * 1.852).toFixed(1);
        ctx.fillText(`${distVal} NM (${kmVal} km)`, cx + 4, cy - r + 11);
      });

      // Bearing Rays (N, NE, E, SE, S, SW, W, NW)
      const bearings = [
        { angle: -Math.PI / 2, label: 'N 000°' },
        { angle: -Math.PI / 4, label: 'NE 045°' },
        { angle: 0, label: 'E 090°' },
        { angle: Math.PI / 4, label: 'SE 135°' },
        { angle: Math.PI / 2, label: 'S 180°' },
        { angle: (3 * Math.PI) / 4, label: 'SW 225°' },
        { angle: Math.PI, label: 'W 270°' },
        { angle: (-3 * Math.PI) / 4, label: 'NW 315°' }
      ];

      bearings.forEach((b) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const rx = cx + Math.cos(b.angle) * maxR;
        const ry = cy + Math.sin(b.angle) * maxR;
        ctx.lineTo(rx, ry);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
        ctx.stroke();

        // Label
        const lx = cx + Math.cos(b.angle) * (maxR + 14);
        const ly = cy + Math.sin(b.angle) * (maxR + 14);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.label, lx, ly);
      });

      // 2. Vladivostok Fairway Coastline Geometry (High Precision Stylized Vectors)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.8;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';

      // Muravyov-Amursky Peninsula Coastline
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy - 90);
      ctx.quadraticCurveTo(cx - 80, cy - 60, cx - 45, cy - 30); // Egersheld
      ctx.lineTo(cx - 30, cy - 10); // Tokarevsky Spit
      ctx.quadraticCurveTo(cx - 10, cy - 5, cx + 10, cy - 35); // Golden Horn Bay (Золотой Рог)
      ctx.quadraticCurveTo(cx + 40, cy - 60, cx + 90, cy - 45); // Churkin & Patroclus
      ctx.lineTo(cx + 140, cy - 20); // Ussuri Bay north
      ctx.stroke();

      // Russky Island Outline
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy + 15); // Sapyorny Peninsula
      ctx.quadraticCurveTo(cx - 20, cy + 30, cx - 10, cy + 60); // Novik Bay
      ctx.quadraticCurveTo(cx + 10, cy + 90, cx + 45, cy + 80); // Tobizina Cape
      ctx.quadraticCurveTo(cx + 60, cy + 50, cx + 25, cy + 25); // Sapyorny east
      ctx.quadraticCurveTo(cx - 10, cy + 10, cx - 40, cy + 15);
      ctx.stroke();

      // Zolotoy & Russky Cable Stayed Bridges (Line Markers)
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      
      // Zolotoy Bridge
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 32);
      ctx.lineTo(cx + 5, cy - 30);
      ctx.stroke();

      // Russky Bridge
      ctx.beginPath();
      ctx.moveTo(cx - 25, cy + 5);
      ctx.lineTo(cx - 15, cy + 18);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Bridge Labels
      ctx.fillStyle = 'rgba(250, 204, 21, 0.7)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('МОСТ РУССКИЙ', cx - 22, cy + 26);
      ctx.fillText('ЗОЛОТОЙ МОСТ', cx + 8, cy - 33);

      // 3. Lighthouses with Pulsing Beacons
      const lighthouses = [
        { name: 'МАЯК ТОКАРЕВСКИЙ', x: cx - 30, y: cy - 10, color: '#f43f5e' },
        { name: 'МАЯК БАСАРГИНА', x: cx + 90, y: cy - 45, color: '#10b981' },
        { name: 'МАЯК СКРЫПЛЕВА', x: cx + 55, y: cy + 15, color: '#eab308' }
      ];

      lighthouses.forEach((lh) => {
        // Blinking Beacon LED
        ctx.fillStyle = lh.color;
        ctx.beginPath();
        ctx.arc(lh.x, lh.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = lh.color + '40';
        ctx.beginPath();
        ctx.arc(lh.x, lh.y, 7 + Math.sin(timeTick / 8) * 3, 0, Math.PI * 2);
        ctx.fill();

        // Text
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(lh.name, lh.x + 8, lh.y + 3);
      });

      // 4. RADAR MODES RENDERING

      // MODE A: Precipitation Reflectivity (dBZ)
      if (radarMode === 'dbz') {
        cloudNodes.forEach((node, idx) => {
          // Calculate drift offset
          const driftX = (timeTick * windDx * windSpeedFactor * 0.15 + node.xBase) % (canvas.width / 2);
          const driftY = (timeTick * windDy * windSpeedFactor * 0.15 + node.yBase) % (canvas.height / 2);

          const px = cx + driftX;
          const py = cy + driftY;

          ctx.beginPath();
          const grad = ctx.createRadialGradient(px, py, 2, px, py, node.r);

          if (node.dbz > 50) {
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.65)');  // Red storm core
            grad.addColorStop(0.4, 'rgba(234, 179, 8, 0.45)'); // Yellow heavy rain
            grad.addColorStop(0.8, 'rgba(34, 197, 94, 0.2)');  // Green rain fringe
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else if (node.dbz > 30) {
            grad.addColorStop(0, 'rgba(234, 179, 8, 0.5)');   // Yellow core
            grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.3)'); // Cyan drizzle
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else {
            grad.addColorStop(0, 'rgba(34, 211, 238, 0.35)');  // Cyan drizzle
            grad.addColorStop(0.7, 'rgba(59, 130, 246, 0.15)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          }

          ctx.fillStyle = grad;
          ctx.arc(px, py, node.r, 0, Math.PI * 2);
          ctx.fill();

          // dBZ Intensity label
          ctx.fillStyle = node.dbz > 50 ? '#fca5a5' : '#7dd3fc';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${node.dbz} dBZ`, px, py + 2);
        });

        // Lightning arc for stormy weather
        if (currentWeather?.status === 'stormy' && Math.random() < 0.04) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx + 40, cy - 80);
          ctx.lineTo(cx + 30, cy - 50);
          ctx.lineTo(cx + 45, cy - 40);
          ctx.lineTo(cx + 35, cy - 10);
          ctx.stroke();
        }
      }

      // MODE B: Live Wind Streamlines
      if (radarMode === 'wind') {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.2;

        windParticles.forEach((p) => {
          p.x += windDx * windSpeedFactor * 1.2;
          p.y += windDy * windSpeedFactor * 1.2;
          p.life += 1;

          if (p.x > canvas.width / 2 || p.x < -canvas.width / 2 || p.y > canvas.height / 2 || p.y < -canvas.height / 2 || p.life > 120) {
            p.x = (Math.random() - 0.5) * canvas.width * 0.9;
            p.y = (Math.random() - 0.5) * canvas.height * 0.9;
            p.life = 0;
          }

          const px = cx + p.x;
          const py = cy + p.y;

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - windDx * 8, py - windDy * 8);
          ctx.stroke();
        });
      }

      // MODE C or ALWAYS: AIS Vessels Targets
      aisVessels.forEach((vessel) => {
        const vx = cx + vessel.xRel * maxR * 1.5;
        const vy = cy + vessel.yRel * maxR * 1.5;

        // Vessel Icon (Green triangle pointing along course)
        const courseRad = (vessel.course - 90) * (Math.PI / 180);
        ctx.save();
        ctx.translate(vx, vy);
        ctx.rotate(courseRad);

        ctx.fillStyle = radarMode === 'ais' ? '#22c55e' : 'rgba(34, 197, 94, 0.7)';
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-4, -4);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fill();

        // Heading vector line
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(16, 0);
        ctx.stroke();

        ctx.restore();

        // Label if AIS mode
        if (radarMode === 'ais') {
          ctx.fillStyle = '#86efac';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${vessel.name} (${vessel.speed} kn)`, vx + 8, vy + 3);
        }
      });

      // 5. Radar Sweeper Beam & Phosphor Persistence
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const rx = cx + Math.cos(angle) * maxR;
      const ry = cy + Math.sin(angle) * maxR;
      ctx.lineTo(rx, ry);
      ctx.stroke();

      // Sweeper Fade Trail (Sector)
      const sweeperGrad = ctx.createConicGradient(angle - 0.4, cx, cy);
      sweeperGrad.addColorStop(0, 'rgba(34, 211, 238, 0.0)');
      sweeperGrad.addColorStop(0.9, 'rgba(34, 211, 238, 0.08)');
      sweeperGrad.addColorStop(1, 'rgba(34, 211, 238, 0.25)');

      ctx.fillStyle = sweeperGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, angle - 0.4, angle);
      ctx.closePath();
      ctx.fill();

      // Center Station Marker (Tokarevsky Beacon Base)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Update Sweep Angle & Timers
      if (!isPaused) {
        angle += 0.015;
        if (angle > Math.PI * 2) angle = 0;
        timeTick += 1;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [lang, radarMode, scaleNM, showWindyLive, isPaused, currentWeather]);

  // Handle Mouse Hover Inspection on Radar
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    const maxR = Math.min(canvas.width, canvas.height) * 0.44;
    const pxPerNM = maxR / scaleNM;
    const distNMVal = Math.sqrt(dx * dx + dy * dy) / pxPerNM;

    if (distNMVal > scaleNM * 1.2) {
      setHoverInfo(null);
      return;
    }

    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    // Estimate GPS
    const lat = (43.073 - (dy / pxPerNM) * 0.0166).toFixed(3);
    const lon = (131.842 + (dx / pxPerNM) * 0.0227).toFixed(3);

    // Check if hovering near AIS vessel
    let matchedVessel: string | undefined = undefined;
    aisVessels.forEach((v) => {
      const vx = cx + v.xRel * maxR * 1.5;
      const vy = cy + v.yRel * maxR * 1.5;
      if (Math.hypot(x - vx, y - vy) < 14) {
        matchedVessel = `${v.name} • ${v.speed} узл • Позывной: ${v.callsign}`;
      }
    });

    // Estimate dBZ intensity under cursor
    let estimatedDbz = 18;
    if (distNMVal < 4) estimatedDbz = 24;
    if (distNMVal > 8 && distNMVal < 12) estimatedDbz = 38;
    if (currentWeather?.status === 'stormy') estimatedDbz += 22;

    const cardinal = deg >= 337.5 || deg < 22.5 ? 'N' :
                     deg >= 22.5 && deg < 67.5 ? 'NE' :
                     deg >= 67.5 && deg < 112.5 ? 'E' :
                     deg >= 112.5 && deg < 157.5 ? 'SE' :
                     deg >= 157.5 && deg < 202.5 ? 'S' :
                     deg >= 202.5 && deg < 247.5 ? 'SW' :
                     deg >= 247.5 && deg < 292.5 ? 'W' : 'NW';

    setHoverInfo({
      lat: `${lat}° N`,
      lon: `${lon}° E`,
      distNM: `${distNMVal.toFixed(1)} NM (${(distNMVal * 1.852).toFixed(1)} км)`,
      bearing: `${Math.round(deg)}° ${cardinal}`,
      intensity: `${estimatedDbz} dBZ (${estimatedDbz > 45 ? 'Сильный ливень' : estimatedDbz > 28 ? 'Умеренные осадки' : 'Легкая морось'})`,
      vesselName: matchedVessel
    });
  };

  return (
    <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl flex flex-col space-y-2 p-3 text-left">
      
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-white/5 font-mono text-xs">
        
        {/* Left: Mode Selection Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => { setRadarMode('dbz'); setShowWindyLive(false); }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
              radarMode === 'dbz' && !showWindyLive ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Осадки (dBZ)' : 'Precipitation'}</span>
          </button>

          <button
            onClick={() => { setRadarMode('wind'); setShowWindyLive(false); }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
              radarMode === 'wind' && !showWindyLive ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Ветер' : 'Wind'}</span>
          </button>

          <button
            onClick={() => { setRadarMode('ais'); setShowWindyLive(false); }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
              radarMode === 'ais' && !showWindyLive ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'АИС Суда' : 'AIS Traffic'}</span>
          </button>
        </div>

        {/* Middle: Scale Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-white/10 text-[10px]">
          <span className="text-slate-500 px-1 font-bold">ШКАЛА:</span>
          {[5, 15, 30].map((nm) => (
            <button
              key={nm}
              onClick={() => setScaleNM(nm)}
              className={`px-2 py-0.5 rounded font-bold ${
                scaleNM === nm ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              {nm} NM
            </button>
          ))}
        </div>

        {/* Right: Live Satellite Embed & Full Map Trigger */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setShowWindyLive(!showWindyLive)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
              showWindyLive 
                ? 'bg-amber-500 text-slate-950 border-amber-400' 
                : 'bg-slate-950 text-amber-300 border-amber-500/30 hover:bg-slate-900'
            }`}
            title="Переключиться на живой метеорологический спутниковый радар осадков"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{showWindyLive ? 'Векторный Радар' : '🛰️ LIVE Спутник Windy'}</span>
          </button>

          {onOpenFullRadarMap && (
            <button
              onClick={onOpenFullRadarMap}
              className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 text-[11px] font-bold transition-all flex items-center gap-1"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Морская Карта' : 'Full Map'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Radar Screen (Canvas or Live Satellite Embed) */}
      <div className="relative h-72 bg-slate-950 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
        
        {showWindyLive ? (
          <iframe
            src="https://embed.windy.com/embed2.html?lat=43.0600&lon=131.8869&zoom=9&level=surface&overlay=radar&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&metricWind=m%2Fs&metricTemp=%C2%B0C&radarRange=-1"
            className="w-full h-full border-0 rounded-xl"
            title="Windy Live Satellite Doppler Radar"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <>
            <canvas 
              ref={canvasRef} 
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverInfo(null)}
              className="absolute inset-0 w-full h-full cursor-crosshair" 
            />

            {/* Top Left Live Badge */}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {radarMode === 'dbz' ? 'ДОПЛЕРОВСКИЙ РАДАР ОСАДКОВ • РОСГИДРОМЕТ' :
                 radarMode === 'wind' ? 'ВЕТРОВОЙ ПОТОК • ЗАЛИВ ПЕТРА ВЕЛИКОГО' :
                 'АИС МОНИТОРИНГ АКВАТОРИИ JIV FLEET'}
              </span>
            </div>

            {/* Top Right Pause / Play Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-slate-300 hover:text-white transition-all text-xs"
              title={isPaused ? 'Запустить сканирование' : 'Пауза радара'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-cyan-400" />}
            </button>

            {/* Hover Inspector HUD Box */}
            {hoverInfo && (
              <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-[11px] font-mono text-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-2xl animate-fade-in">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" />
                  <div>
                    <span className="text-white font-bold block">{hoverInfo.lat}, {hoverInfo.lon}</span>
                    <span className="text-slate-400 text-[10px]">От Токаревского маяка: {hoverInfo.distNM} • Пеленг {hoverInfo.bearing}</span>
                  </div>
                </div>

                {hoverInfo.vesselName ? (
                  <div className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                    🚢 {hoverInfo.vesselName}
                  </div>
                ) : (
                  <div className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                    📊 Интенсивность: {hoverInfo.intensity}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Reflectivity dBZ Legend Bar */}
      <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
        <span className="font-bold text-slate-300 flex items-center gap-1 shrink-0">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Шкала отражаемости (dBZ):</span>
        </span>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto py-0.5">
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">10-25 (Морось)</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">30-40 (Дождь)</span>
          <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-bold">45-55 (Ливень)</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">60+ (Шторм)</span>
        </div>
      </div>

    </div>
  );
};

export default function WeatherWidget({ currentWeather, onWeatherChange, onOpenFullRadarMap }: WeatherWidgetProps) {
  const { lang, t } = useTranslation();
  const [activeSource, setActiveSource] = useState<WeatherSource>(lang === 'ru' ? 'yandex' : (lang === 'zh' || lang === 'zh-TW') ? 'amap' : 'google');
  const [iframeLoading, setIframeLoading] = useState(true);

  // Sync active source when language/mode changes
  useEffect(() => {
    if (lang === 'ru') {
      setActiveSource('yandex');
    } else if (lang === 'zh' || lang === 'zh-TW') {
      setActiveSource('amap');
    } else {
      setActiveSource('google');
    }
  }, [lang]);

  const sourcesList = lang === 'ru'
    ? [
        { id: 'yandex', label: '🟡 Яндекс Погода', desc: 'Яндекс.Погода — детальный прогноз' },
        { id: 'radar', label: '📡 Росгидромет', desc: 'Морской радар осадков Росгидромета РФ' },
        { id: 'windy', label: '💨 Ветровой радар', desc: 'Карта ветра и волнения Приморья' }
      ]
    : (lang === 'zh' || lang === 'zh-TW')
    ? [
        { id: 'amap', label: '🇨🇳 高德天气', desc: '高德地图实时海图与气象预报' },
        { id: 'baidu', label: '🗺️ 百度天气', desc: '百度气象水文雷达' },
        { id: 'windy', label: '💨 Windy 海图', desc: '全球风浪实时雷达' }
      ]
    : [
        { id: 'google', label: '🌐 Google Weather', desc: 'Google Weather API & Marine Forecast' },
        { id: 'windy', label: '💨 Windyty Global', desc: 'Live Marine Wind & Swell Radar' },
        { id: 'radar', label: '⚓ NOAA Marine Radar', desc: 'NOAA Ocean Precipitation & Storm Tracking' }
      ];

  const getWarningMessage = (status: 'calm' | 'moderate' | 'stormy') => {
    if (status === 'calm') {
      return lang === 'ru' 
        ? 'Штиль. Отличная видимость. Безопасный выход в открытое море по всей акватории.'
        : lang === 'en'
        ? 'Calm sea. Excellent visibility. Safe departure into the open sea across the entire area.'
        : '风平浪静。极佳能见度。整个海域皆可安全出海。';
    } else if (status === 'moderate') {
      return lang === 'ru'
        ? 'Умеренное волнение. Рекомендуется соблюдать осторожность при выходе на гидроциклах.'
        : lang === 'en'
        ? 'Moderate waves. Caution is advised when operating jet skis.'
        : '中等海浪。使用摩托艇时建议保持警惕。';
    } else {
      return lang === 'ru'
        ? 'ШТОРМОВОЕ ПРЕДУПРЕЖДЕНИЕ! Высокие волны в Босфоре Восточном и Амурском заливе.'
        : lang === 'en'
        ? 'STORM WARNING! High waves in Eastern Bosphorus and Amur Bay.'
        : '风暴预警！东博斯普鲁斯海峡和阿穆尔湾有巨浪。';
    }
  };

  const getShelteredBaySuggestion = () => {
    return lang === 'ru'
      ? 'Рекомендуется аренда только в защищенных бухтах (Бухта Новик, бухта Труда).'
      : lang === 'en'
      ? 'Rental is recommended only in sheltered bays (Novik Bay, Truda Bay).'
      : '建议仅在有遮蔽的港湾中租赁（诺维克湾、特鲁达湾）。';
  };

  const displayWarning = getWarningMessage(currentWeather.status);
  const displaySuggestion = currentWeather.status === 'stormy' ? getShelteredBaySuggestion() : undefined;

  // Hourly forecast for Vladivostok (Google Weather simulation)
  const hourlyForecast = [
    { time: '09:00', temp: 20, icon: <Sun className="w-4 h-4 text-amber-400" />, pop: '5%' },
    { time: '12:00', temp: 22, icon: <CloudSun className="w-4 h-4 text-yellow-300" />, pop: '10%' },
    { time: '15:00', temp: 23, icon: <CloudSun className="w-4 h-4 text-yellow-300" />, pop: '15%' },
    { time: '18:00', temp: 21, icon: <Cloud className="w-4 h-4 text-slate-300" />, pop: '25%' },
    { time: '21:00', temp: 18, icon: <CloudRain className="w-4 h-4 text-cyan-400" />, pop: '60%' },
    { time: '00:00', temp: 16, icon: <CloudRain className="w-4 h-4 text-cyan-400" />, pop: '80%' },
  ];

  const handleSourceChange = (source: WeatherSource) => {
    setIframeLoading(true);
    setActiveSource(source);
  };

  const toggleWeather = (status: 'calm' | 'moderate' | 'stormy') => {
    let nextWeather: WeatherCondition;
    if (status === 'calm') {
      nextWeather = {
        waveHeight: 0.3,
        windSpeed: 3.5,
        windDirection: 'NE',
        temperatureAir: 22,
        temperatureWater: 18,
        status: 'calm',
        warningMessage: getWarningMessage('calm')
      };
    } else if (status === 'moderate') {
      nextWeather = {
        waveHeight: 1.2,
        windSpeed: 8.5,
        windDirection: 'SE',
        temperatureAir: 19,
        temperatureWater: 17,
        status: 'moderate',
        warningMessage: getWarningMessage('moderate')
      };
    } else {
      nextWeather = {
        waveHeight: 2.8,
        windSpeed: 16.5,
        windDirection: 'S',
        temperatureAir: 15,
        temperatureWater: 16,
        status: 'stormy',
        warningMessage: getWarningMessage('stormy'),
        shelteredBaySuggestion: getShelteredBaySuggestion()
      };
    }
    onWeatherChange(nextWeather);
  };

  const getStatusColor = () => {
    switch (currentWeather.status) {
      case 'calm':
        return 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400';
      case 'moderate':
        return 'border-amber-500/30 bg-amber-950/20 text-amber-400';
      case 'stormy':
        return 'border-rose-500/30 bg-rose-950/20 text-rose-400 animate-pulse';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 backdrop-blur-xl p-5 shadow-2xl transition-all duration-300" id="weather-widget-container">
      
      {/* Title block */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 block">{t('title_sub', 'weather')}</span>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            {t('title', 'weather')}
          </h3>
        </div>
        
        {/* Source Toggle Switch */}
        <div className="flex bg-slate-900/85 rounded-xl p-1 border border-white/5" id="weather-source-switcher">
          {sourcesList.map((source) => (
            <button
              key={source.id}
              onClick={() => handleSourceChange(source.id as WeatherSource)}
              title={source.desc}
              id={`weather-src-btn-${source.id}`}
              className={`px-2.5 py-1.5 text-xs rounded-lg font-semibold tracking-wide transition-all ${
                activeSource === source.id
                  ? 'bg-white/10 text-white border border-white/10 shadow-inner'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {source.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area depending on Active Source */}
      <div className="relative border border-white/5 rounded-xl bg-slate-950/90 overflow-hidden mb-5 min-h-[340px] flex flex-col justify-between">
        
        {/* Loading overlay for iframes */}
        {iframeLoading && activeSource === 'windy' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-30 gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span className="text-[10px] text-cyan-400 font-mono tracking-wider animate-pulse">
              {lang === 'ru' ? 'Соединение с метеосервером...' : lang === 'en' ? 'Connecting to weather server...' : '正在连接气象服务器...'}
            </span>
          </div>
        )}

        {/* Tab: WINDY (LIVE WIND & SWELL EMBED) */}
        {activeSource === 'windy' && (
          <div className="flex-1 flex flex-col">
            <div className="relative flex-1 min-h-[280px]">
              <iframe
                src="https://embed.windy.com/embed2.html?lat=43.0600&lon=131.8869&zoom=10&level=surface&overlay=wind&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&metricWind=m%2Fs&metricTemp=%C2%B0C&radarRange=-1"
                className="absolute inset-0 w-full h-full border-0 rounded-t-xl"
                loading="lazy"
                referrerPolicy="no-referrer"
                onLoad={() => setIframeLoading(false)}
                title="Windyty Live Marine Radar"
              />
            </div>
            <div className="bg-slate-900/90 border-t border-white/5 p-3 flex justify-between items-center text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'ru' ? 'Мертвая зыбь: 0.4 м' : lang === 'en' ? 'Swell: 0.4m' : '涌浪：0.4米'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'ru' ? 'Ветер: до 6 м/с • Порывы 9 м/с' : lang === 'en' ? 'Wind: up to 6 m/s • Gusts 9 m/s' : '风速：最高 6 米/秒 • 阵风 9 米/秒'}</span>
              </span>
              <a 
                href="https://www.windy.com/43.060/131.887?42.541,131.887,9" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px]"
              >
                <span>{lang === 'ru' ? 'Подробнее' : lang === 'en' ? 'More info' : '了解更多'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Tab: YANDEX WEATHER (RUSSIAN MODE 1) */}
        {activeSource === 'yandex' && (
          <div className="p-4 flex flex-col justify-between flex-1 gap-3" id="yandex-weather-dashboard">
            {/* Top Row: Current Temperature */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center font-mono">🔴</span>
                  Яндекс Погода • Владивосток (Японское море)
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <CloudSun className="w-8 h-8 text-yellow-300" />
                  <div>
                    <span className="text-3xl font-bold text-white font-mono leading-none">22°</span>
                    <span className="text-xs text-slate-400 block font-sans">
                      Ощущается как 23°С • Облачно с прояснениями
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 space-y-1 font-mono">
                <div>Влажность: <span className="text-white">74%</span></div>
                <div>Ветер: <span className="text-white">3.5 м/с, СВ</span></div>
                <div>Давление: <span className="text-white">756 мм рт. ст.</span></div>
              </div>
            </div>

            {/* Radar Canvas component */}
            <RadarSimulation lang={lang} currentWeather={currentWeather} onOpenFullRadarMap={onOpenFullRadarMap} />

            {/* Bottom Row */}
            <div className="bg-slate-900/90 border border-white/5 rounded-lg p-2.5 flex justify-between items-center text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Осадки: в ближайшие 2 часа не ожидаются</span>
              </span>
              <a 
                href="https://yandex.ru/pogoda/vladivostok" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px]"
              >
                <span>Яндекс.Погода Подробнее</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Tab: ROSGIDROMET RADAR (RUSSIAN MODE 1 / INTL NOAA RADAR) */}
        {activeSource === 'radar' && (
          <div className="p-4 flex flex-col justify-between flex-1 gap-3" id="rosgidromet-radar-dashboard">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center font-mono">📡</span>
                  {lang === 'ru' ? 'Росгидромет РФ • Морской метеорадар' : 'NOAA & International Marine Weather Radar'}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ru' 
                    ? 'Оперативный мониторинг осадков, туманов и направления ветра в Заливе Петра Великого' 
                    : 'Real-time precipitation radar & marine storm cell tracking'}
                </p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/30">
                {lang === 'ru' ? '152-ФЗ Данные' : 'NOAA Satellite'}
              </span>
            </div>

            <RadarSimulation lang={lang} currentWeather={currentWeather} onOpenFullRadarMap={onOpenFullRadarMap} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'Высота волны' : 'Wave Height'}</span>
                <span className="font-bold text-white">0.3 м</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'Порывы ветра' : 'Wind Gusts'}</span>
                <span className="font-bold text-cyan-400">7.0 м/с</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'Температура воды' : 'Water Temp'}</span>
                <span className="font-bold text-amber-400">+18°C</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'УФ-Индекс' : 'UV Index'}</span>
                <span className="font-bold text-emerald-400">5 (Ср)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: GOOGLE WEATHER (INTERNATIONAL MODE 2) */}
        {activeSource === 'google' && (
          <div className="p-4 flex flex-col justify-between flex-1 gap-4" id="google-weather-dashboard">
            {/* Top Row: Current Temperature */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-white">Google Weather API • Vladivostok</span>
                <div className="flex items-center gap-2 mt-1">
                  <Sun className="w-8 h-8 text-amber-400" />
                  <div>
                    <span className="text-3xl font-bold text-white font-mono leading-none">22°C</span>
                    <span className="text-xs text-slate-400 block font-sans">Feels like 23°C • Mostly Sunny</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 space-y-1 font-mono">
                <div>Humidity: <span className="text-white font-mono">74%</span></div>
                <div>Wind: <span className="text-white font-mono">3.5 m/s NE</span></div>
                <div>Pressure: <span className="text-white font-mono">756 mmHg</span></div>
              </div>
            </div>

            {/* Hourly Forecast Slider */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Hourly Forecast</div>
              <div className="grid grid-cols-6 gap-2 text-center font-mono">
                {hourlyForecast.map((hour, idx) => (
                  <div key={idx} className="bg-slate-900/50 border border-white/5 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">{hour.time}</span>
                    <div className="my-1 flex justify-center">{hour.icon}</div>
                    <span className="text-xs font-bold text-white">{hour.temp}°</span>
                    <span className="text-[9px] text-cyan-400 block mt-0.5">{hour.pop}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-sans">
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-white/5 flex items-center gap-2">
                <Waves className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[9px] text-slate-400 font-mono uppercase">Wave Height</div>
                  <div className="text-xs font-bold text-white font-mono">0.3 m</div>
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-white/5 flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[9px] text-slate-400 font-mono uppercase">Wind Gusts</div>
                  <div className="text-xs font-bold text-white font-mono">3.5 (7) m/s</div>
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-white/5 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[9px] text-slate-400 font-mono uppercase">Water Temp</div>
                  <div className="text-xs font-bold text-white font-mono">+18°C</div>
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-white/5 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[9px] text-slate-400 font-mono uppercase">UV Index</div>
                  <div className="text-xs font-bold text-white font-mono">5 (Mod)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: AMAP / GAODE WEATHER (CHINESE MODE 3) */}
        {activeSource === 'amap' && (
          <div className="p-4 flex flex-col justify-between flex-1 gap-4" id="amap-weather-dashboard">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">🇨🇳</span>
                  高德天气 API • 符拉迪沃斯托克 (海参崴)
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Sun className="w-8 h-8 text-amber-400" />
                  <div>
                    <span className="text-3xl font-bold text-white font-mono leading-none">22°C</span>
                    <span className="text-xs text-slate-400 block font-sans">体感温度 23°C • 多云转晴</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 space-y-1 font-mono">
                <div>湿度: <span className="text-white font-mono">74%</span></div>
                <div>风速: <span className="text-white font-mono">3.5 米/秒，东北</span></div>
                <div>气压: <span className="text-white font-mono">756 毫米汞柱</span></div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">逐小时预报</div>
              <div className="grid grid-cols-6 gap-2 text-center font-mono">
                {hourlyForecast.map((hour, idx) => (
                  <div key={idx} className="bg-slate-900/50 border border-white/5 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">{hour.time}</span>
                    <div className="my-1 flex justify-center">{hour.icon}</div>
                    <span className="text-xs font-bold text-white">{hour.temp}°</span>
                    <span className="text-[9px] text-cyan-400 block mt-0.5">{hour.pop}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-white/5 rounded-lg p-2.5 flex justify-between items-center text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>未来2小时内无降水，适宜游艇出航</span>
              </span>
              <a 
                href="https://ditu.amap.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[10px]"
              >
                <span>高德地图气象</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Tab: BAIDU WEATHER (CHINESE MODE 3) */}
        {activeSource === 'baidu' && (
          <div className="p-4 flex flex-col justify-between flex-1 gap-3" id="baidu-weather-dashboard">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">🗺️</span>
                  百度天气 • 气象水文雷达
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  符拉迪沃斯托克彼得大帝湾实时气象与波浪数据
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/30">
                百度 GIS
              </span>
            </div>

            <RadarSimulation lang={lang} currentWeather={currentWeather} onOpenFullRadarMap={onOpenFullRadarMap} />

            <div className="bg-slate-900/90 border border-white/5 rounded-lg p-2.5 flex justify-between items-center text-[11px] font-mono text-slate-300">
              <span>波浪高度: 0.3 米 • 风速: 3.5 米/秒</span>
              <a 
                href="https://map.baidu.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[10px]"
              >
                <span>百度地图</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Weather Safety Alert Banner */}
      <div className={`border rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2.5 mb-4 transition-all duration-300 ${getStatusColor()}`} id="weather-status-alert font-sans">
        {currentWeather.status === 'stormy' ? (
          <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 animate-bounce text-rose-400" />
        ) : (
          <ShieldCheck className="w-4.5 h-4.5 flex-shrink-0 text-emerald-400" />
        )}
        <div>
          <span className="font-semibold block mb-0.5">
            {currentWeather.status === 'calm' 
              ? (lang === 'ru' ? 'Условия благоприятны' : lang === 'en' ? 'Conditions Favorable' : '天气条件良好') 
              : currentWeather.status === 'moderate' 
              ? (lang === 'ru' ? 'Внимание' : lang === 'en' ? 'Caution' : '注意') 
              : (lang === 'ru' ? 'Штормовое положение!' : lang === 'en' ? 'Storm alert!' : '风暴预警！')}
          </span>
          <p className="opacity-90">{displayWarning}</p>
          {displaySuggestion && (
            <div className="mt-2 text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-500/20 font-medium font-sans">
              ⚠️ {displaySuggestion}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
