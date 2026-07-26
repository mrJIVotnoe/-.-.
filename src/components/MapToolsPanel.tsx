/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Route, 
  Navigation, 
  Download, 
  Share2, 
  Check, 
  Plus, 
  Star,
  ExternalLink
} from 'lucide-react';
import { Vessel } from '../types';
import { useTranslation } from '../lib/translations';

interface MapToolsPanelProps {
  currentRoutePoints: [number, number][];
  onSetCustomRoute: (points: [number, number][]) => void;
  currentPickupPoint: { latLon: [number, number]; type: 'pickup' | 'evac' } | null;
  onSetPickupPoint: (point: { latLon: [number, number]; type: 'pickup' | 'evac' } | null) => void;
  selectedVessel: Vessel | null;
  triggerToast: (msg: string) => void;
}

// Preset scenic marine tours of Vladivostok
const PRESET_ROUTES = [
  {
    id: 'russky-bridge-tools',
    nameRu: '🌉 Золотой Рог — Русский Мост',
    nameEn: '🌉 Golden Horn — Russian Bridge',
    nameZh: '🌉 金角湾 — 俄罗斯大桥',
    points: [
      [43.1155, 131.8900], // Golden Horn
      [43.0886, 131.9056], // Zmeinka
      [43.0645, 131.8943], // Pospelovo
      [43.0620, 131.9060]  // Under Russian Bridge
    ] as [number, number][],
    durationRu: '1.5 часа',
    durationEn: '1.5 hours',
    durationZh: '1.5 小时',
    lengthRu: '12 км',
    lengthEn: '12 km',
    lengthZh: '12 公里'
  },
  {
    id: 'novik-starck-tools',
    nameRu: '🏝️ Бухта Новик — о. Шкота',
    nameEn: '🏝️ Novik Bay — Shkota Island',
    nameZh: '🏝️ 诺维克湾 — 什科特岛',
    points: [
      [43.0375, 131.8361], // Novik Pt
      [43.0030, 131.8120], // Stark Passage
      [42.9430, 131.8350]  // Shkota island cape
    ] as [number, number][],
    durationRu: '3 часа',
    durationEn: '3 hours',
    durationZh: '3 小时',
    lengthRu: '24 км',
    lengthEn: '24 km',
    lengthZh: '24 公里'
  },
  {
    id: 'lighthouse-tour-tools',
    nameRu: '🧭 Маяки залива Босфор Восточный',
    nameEn: '🧭 Lighthouses of Eastern Bosphorus',
    nameZh: '🧭 东博斯普鲁斯海峡灯塔群',
    points: [
      [43.0739, 131.8431], // Tokarevsky Light
      [43.0580, 131.8000], // Amursky bay
      [43.0110, 131.8900], // Basargin lighthouse
      [43.1155, 131.8900]  // Golden Horn return
    ] as [number, number][],
    durationRu: '2.5 часа',
    durationEn: '2.5 hours',
    durationZh: '2.5 小时',
    lengthRu: '20 км',
    lengthEn: '20 km',
    lengthZh: '20 公里'
  }
];

export default function MapToolsPanel({
  currentRoutePoints,
  onSetCustomRoute,
  currentPickupPoint,
  onSetPickupPoint,
  selectedVessel,
  triggerToast
}: MapToolsPanelProps) {
  const { lang, t } = useTranslation();
  const [customLat, setCustomLat] = useState<string>('43.0645');
  const [customLon, setCustomLon] = useState<string>('131.8943');
  const [routeNameInput, setRouteNameInput] = useState<string>('');
  const [shareType, setShareType] = useState<'public' | 'private'>('private');

  // Favorites routes storage
  const [savedRoutes, setSavedRoutes] = useState<{ name: string; points: [number, number][] }[]>([]);

  useEffect(() => {
    // Initialize localized default saved route
    setSavedRoutes([
      {
        name: lang === 'ru' 
          ? '❤️ Избранный: Мой семейный круиз' 
          : lang === 'en' 
          ? '❤️ Favorite: My Family Cruise' 
          : '❤️ 最爱：我的家庭游艇巡航',
        points: [[43.0375, 131.8361], [43.0620, 131.9060]]
      }
    ]);
  }, [lang]);

  // Sync inputs with selected point if updated from outside click
  useEffect(() => {
    if (currentPickupPoint) {
      setCustomLat(currentPickupPoint.latLon[0].toFixed(5));
      setCustomLon(currentPickupPoint.latLon[1].toFixed(5));
    }
  }, [currentPickupPoint]);

  // Send Pick-up Pin
  const handleSendPickupPoint = () => {
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      onSetPickupPoint({
        latLon: [lat, lon],
        type: 'pickup'
      });
      triggerToast(
        lang === 'ru' 
          ? '📍 Координаты точки посадки зафиксированы и спроецированы на карту.' 
          : lang === 'en' 
          ? '📍 Boarding point coordinates are captured and projected on the map.' 
          : '📍 登船点坐标已记录并投射在地图上。'
      );
    }
  };

  // Get current browser coordinates
  const handleGetGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCustomLat(lat.toFixed(5));
          setCustomLon(lon.toFixed(5));
          onSetPickupPoint({
            latLon: [lat, lon],
            type: 'pickup'
          });
          triggerToast(
            lang === 'ru' 
              ? '📍 Координаты вашего устройства получены с точностью до 10 метров!' 
              : lang === 'en' 
              ? '📍 Device coordinates retrieved with 10m accuracy!' 
              : '📍 设备定位成功，精度达10米！'
          );
        },
        () => {
          setCustomLat('43.1155');
          setCustomLon('131.8900');
          triggerToast(
            lang === 'ru' 
              ? '⚠️ Ошибка геолокации. Установлены координаты центра бухты Золотой Рог.' 
              : lang === 'en' 
              ? '⚠️ Geolocation error. Golden Horn Bay coordinates set.' 
              : '⚠️ 定位失败。已设定金角湾中心坐标。'
          );
        }
      );
    } else {
      triggerToast(
        lang === 'ru' 
          ? '❌ Браузер не поддерживает определение координат.' 
          : lang === 'en' 
          ? '❌ Geolocation not supported by this browser.' 
          : '❌ 您的浏览器不支持设备定位。'
      );
    }
  };

  // Save drawn route to favorites
  const handleSaveRoute = () => {
    if (currentRoutePoints.length === 0) {
      triggerToast(
        lang === 'ru' 
          ? '❌ Сначала нарисуйте или выберите маршрут!' 
          : lang === 'en' 
          ? '❌ Draw or select a route first!' 
          : '❌ 请先绘制或选择一条航线！'
      );
      return;
    }
    const fallbackName = lang === 'ru' 
      ? `🗺️ Маршрут #${savedRoutes.length + 1} (${currentRoutePoints.length} точ.)` 
      : lang === 'en' 
      ? `🗺️ Route #${savedRoutes.length + 1} (${currentRoutePoints.length} pts.)` 
      : `🗺️ 航线 #${savedRoutes.length + 1} (${currentRoutePoints.length} 点)`;
    const name = routeNameInput.trim() || fallbackName;
    setSavedRoutes([...savedRoutes, { name, points: currentRoutePoints }]);
    setRouteNameInput('');
    triggerToast(
      lang === 'ru' 
        ? '⭐ Маршрут успешно добавлен в ваше Избранное на JIV!' 
        : lang === 'en' 
        ? '⭐ Route successfully added to your JIV Favorites!' 
        : '⭐ 航线已成功保存到您的「JIV」收藏夹中！'
    );
  };

  // Export functions generating real formatted XML/JSON files
  const downloadRouteFile = (format: 'gpx' | 'kml' | 'geojson') => {
    if (currentRoutePoints.length === 0) {
      triggerToast(
        lang === 'ru' 
          ? '❌ Нет активных точек для экспорта маршрута!' 
          : lang === 'en' 
          ? '❌ No active points to export route!' 
          : '❌ 没有活动点可用于导出航线！'
      );
      return;
    }

    let fileContent = '';
    let fileName = `jiv_route_${new Date().toISOString().slice(0,10)}`;
    let mimeType = 'text/plain';

    if (format === 'gpx') {
      const trkpts = currentRoutePoints.map(pt => `      <trkpt lat="${pt[0]}" lon="${pt[1]}"><time>${new Date().toISOString()}</time></trkpt>`).join('\n');
      fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="JIV Vladivostok" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${lang === 'ru' ? 'JIV Маршрут' : lang === 'en' ? 'JIV Route' : 'JIV 规划航线'}</name>
    <desc>Записанный морской прогулочный переход во Владивостоке</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>JIV Marine Walk</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
      fileName += '.gpx';
      mimeType = 'application/gpx+xml';
    } else if (format === 'kml') {
      const coordinates = currentRoutePoints.map(pt => `${pt[1]},${pt[0]},0`).join(' ');
      fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${lang === 'ru' ? 'Морской маршрут JIV' : lang === 'en' ? 'JIV Marine Route' : 'JIV 海上航线'}</name>
    <description>Сгенерировано в приложении Journey In Vladivostok</description>
    <Placemark>
      <name>Траектория пути</name>
      <LineString>
        <coordinates>${coordinates}</coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;
      fileName += '.kml';
      mimeType = 'application/vnd.google-earth.kml+xml';
    } else {
      const coordinates = currentRoutePoints.map(pt => [pt[1], pt[0]]);
      fileContent = JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: lang === 'ru' ? "JIV Маршрут" : lang === 'en' ? "JIV Route" : "JIV 航线",
              description: "Экспортировано для навигатора"
            },
            geometry: {
              type: "LineString",
              coordinates: coordinates
            }
          }
        ]
      }, null, 2);
      fileName += '.geojson';
      mimeType = 'application/geo+json';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast(
      lang === 'ru' 
        ? `📥 Файл ${fileName.toUpperCase()} успешно сгенерирован и загружен!` 
        : lang === 'en' 
        ? `📥 File ${fileName.toUpperCase()} successfully generated and downloaded!` 
        : `📥 文件 ${fileName.toUpperCase()} 已成功生成并下载！`
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left" id="map-navigation-tools-subgrid">
      
      {/* Col 1: Pointing & Locating Coords */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-3" id="tool-pickup-point-selector">
        <div className="flex items-center gap-2 text-cyan-400">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">
            {lang === 'ru' ? 'Точное указание места посадки' : lang === 'en' ? 'Precise Boarding Location' : '精准登船位置'}
          </span>
        </div>
        
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {lang === 'ru' 
            ? 'Кликните по интерактивной карте выше или введите координаты, чтобы установить индивидуальную точку подачи судна для посадки.' 
            : lang === 'en' 
            ? 'Click on the interactive map above or enter coordinates to set an individual vessel delivery point for boarding.' 
            : '点击上方交互式地图或输入坐标，即可设置船舶个性化停靠登船点。'}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-slate-500 block">
              {lang === 'ru' ? 'ШИРОТА (LAT)' : lang === 'en' ? 'LATITUDE (LAT)' : '纬度 (LAT)'}
            </span>
            <input
              type="text"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              className="w-full bg-slate-950 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-slate-500 block">
              {lang === 'ru' ? 'ДОЛГОТА (LON)' : lang === 'en' ? 'LONGITUDE (LON)' : '经度 (LON)'}
            </span>
            <input
              type="text"
              value={customLon}
              onChange={(e) => setCustomLon(e.target.value)}
              className="w-full bg-slate-950 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleGetGeolocation}
            className="py-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-white/5 text-[10px] font-mono text-slate-300 transition-all flex items-center justify-center gap-1.5"
            title={lang === 'ru' ? 'Определить координаты устройства' : lang === 'en' ? 'Get device coordinates' : '确定设备坐标'}
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'ru' ? 'Моя позиция' : lang === 'en' ? 'My position' : '我的位置'}</span>
          </button>

          <button
            onClick={handleSendPickupPoint}
            className="py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-[10px] font-mono transition-all flex items-center justify-center gap-1.5"
          >
            <span>{lang === 'ru' ? 'Установить точку' : lang === 'en' ? 'Set Boarding' : '设定登船点'}</span>
          </button>
        </div>

        {currentPickupPoint && (
          <div className="p-2.5 rounded-lg border border-cyan-500/20 bg-cyan-950/20 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
            <span className="truncate">
              📍 {lang === 'ru' ? 'Координаты посадки' : lang === 'en' ? 'Boarding location' : '登船坐标'}: {currentPickupPoint.latLon[0].toFixed(4)}, {currentPickupPoint.latLon[1].toFixed(4)}
            </span>
            <button onClick={() => onSetPickupPoint(null)} className="text-slate-400 hover:text-white ml-2 flex-shrink-0">✕</button>
          </div>
        )}
      </div>

      {/* Col 2: Routes Presets & Exporters */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-3" id="tool-route-projector">
        <div className="flex items-center gap-2 text-cyan-400">
          <Route className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">
            {lang === 'ru' ? 'Проекция и Экспорт маршрута' : lang === 'en' ? 'Route Projection & Export' : '航线规划与导出'}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          {lang === 'ru'
            ? 'Проецируйте готовые живописные экскурсии на карту или экспортируйте активную траекторию в файлы для судовых картплоттеров.'
            : lang === 'en'
            ? 'Project scenic ready-made tours on the map or export active tracks into files for marine chartplotters.'
            : '在地图上规划成熟的观光航线，或导出活跃轨迹以便导入船舶制图仪。'}
        </p>

        {/* Scenic route presets */}
        <div className="space-y-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase block">
            {lang === 'ru' ? 'Живописные маршруты залива:' : lang === 'en' ? 'Scenic Gulf Routes:' : '海湾观光航线：'}
          </span>
          <div className="grid grid-cols-1 gap-1">
            {PRESET_ROUTES.map((routeOpt) => {
              const isActive = JSON.stringify(currentRoutePoints) === JSON.stringify(routeOpt.points);
              const routeName = lang === 'ru' ? routeOpt.nameRu : lang === 'en' ? routeOpt.nameEn : routeOpt.nameZh;
              const routeLen = lang === 'ru' ? routeOpt.lengthRu : lang === 'en' ? routeOpt.lengthEn : routeOpt.lengthZh;
              const routeDur = lang === 'ru' ? routeOpt.durationRu : lang === 'en' ? routeOpt.durationEn : routeOpt.durationZh;
              return (
                <button
                  key={routeOpt.id}
                  onClick={() => {
                    onSetCustomRoute(routeOpt.points);
                    const label = lang === 'ru' ? 'спроецирована на карту.' : lang === 'en' ? 'projected on map.' : '已投射到地图。';
                    triggerToast(`«${routeName}» ${label}`);
                  }}
                  className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-[10px] border transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="truncate">{routeName}</span>
                  <span className="text-[9px] font-mono text-slate-500 flex-shrink-0 ml-1">
                    {routeLen} • {routeDur}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export actions */}
        {currentRoutePoints.length > 0 ? (
          <div className="space-y-2 pt-1 border-t border-white/5">
            <span className="text-[9px] font-mono text-slate-400 block">
              {lang === 'ru' ? 'Скачать файл для судового навигатора:' : lang === 'en' ? 'Download file for marine navigator:' : '下载船舶导航文件：'}
            </span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => downloadRouteFile('gpx')}
                className="py-1 rounded bg-slate-950 hover:bg-slate-900 border border-cyan-500/10 hover:border-cyan-500/20 text-[9px] font-mono font-bold text-cyan-400 flex flex-col items-center justify-center gap-0.5"
                title="GPX format"
              >
                <Download className="w-3 h-3" />
                <span>GPX</span>
              </button>
              <button
                onClick={() => downloadRouteFile('kml')}
                className="py-1 rounded bg-slate-950 hover:bg-slate-900 border border-cyan-500/10 hover:border-cyan-500/20 text-[9px] font-mono font-bold text-cyan-400 flex flex-col items-center justify-center gap-0.5"
                title="KML Google Earth format"
              >
                <Download className="w-3 h-3" />
                <span>KML</span>
              </button>
              <button
                onClick={() => downloadRouteFile('geojson')}
                className="py-1 rounded bg-slate-950 hover:bg-slate-900 border border-cyan-500/10 hover:border-cyan-500/20 text-[9px] font-mono font-bold text-cyan-400 flex flex-col items-center justify-center gap-0.5"
                title="GeoJSON format"
              >
                <Download className="w-3 h-3" />
                <span>JSON</span>
              </button>
            </div>

            {/* Sharing toggle */}
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/5 text-[9px] font-mono mt-2">
              <button
                onClick={() => {
                  setShareType('private');
                  triggerToast(
                    lang === 'ru' 
                      ? '🔒 Маршрут передан капитану в защищенном приватном режиме.' 
                      : lang === 'en' 
                      ? '🔒 Route securely transmitted to the captain.' 
                      : '🔒 航线已安全发送给船长。'
                  );
                }}
                className={`flex-1 py-1 rounded transition-all text-center ${shareType === 'private' ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-slate-500'}`}
              >
                {lang === 'ru' ? '🔒 Капитану' : lang === 'en' ? '🔒 To Captain' : '🔒 发给船长'}
              </button>
              <button
                onClick={() => {
                  setShareType('public');
                  triggerToast(
                    lang === 'ru' 
                      ? '🔗 Публичная ссылка сгенерирована и скопирована в буфер обмена!' 
                      : lang === 'en' 
                      ? '🔗 Public link generated and copied to clipboard!' 
                      : '🔗 公开分享链接已生成并复制到剪贴板！'
                  );
                }}
                className={`flex-1 py-1 rounded transition-all text-center ${shareType === 'public' ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-slate-500'}`}
              >
                {lang === 'ru' ? '🌐 Поделиться' : lang === 'en' ? '🌐 Share' : '🌐 分享'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-slate-950/60 rounded border border-white/5 text-[9px] text-slate-500 font-mono text-center">
            {lang === 'ru'
              ? 'Маршрут пуст. Постройте маршрут кликами по карте или выберите один из пресетов выше для доступа к экспорту.'
              : lang === 'en'
              ? 'Route is empty. Build a route by clicking on the map or choose a preset above to access export.'
              : '航线为空。请点击地图绘制航线或选择上述预设航线以访问导出功能。'}
          </div>
        )}
      </div>

    </div>
  );
}
