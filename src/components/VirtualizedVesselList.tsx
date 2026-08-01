import React, { useRef, useState, useEffect } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Vessel } from '../types';
import VesselCard from './VesselCard';
import FarpostListRow from './FarpostListRow';

interface VirtualizedVesselListProps {
  vessels: Vessel[];
  listingsLayout: 'grid' | 'list';
  selectedVesselForMap: Vessel | null;
  onSelectVesselForMap: (vessel: Vessel) => void;
  onBookVessel: (vessel: Vessel) => void;
}

export default function VirtualizedVesselList({
  vessels,
  listingsLayout,
  selectedVesselForMap,
  onSelectVesselForMap,
  onBookVessel,
}: VirtualizedVesselListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<number>(3);

  // Responsive column count detector for grid mode
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Compute total virtual rows depending on layout mode
  const isGrid = listingsLayout === 'grid';
  const totalRows = isGrid ? Math.ceil(vessels.length / columns) : vessels.length;

  const virtualizer = useWindowVirtualizer({
    count: totalRows,
    estimateSize: () => (isGrid ? 520 : 185), // Estimated height in pixels per row
    overscan: 4, // Render 4 buffer rows above and below viewport
    scrollMargin: containerRef.current?.offsetTop ?? 0,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={containerRef} className="relative w-full" id="virtualized-fleet-container">
      {/* Container virtualization indicator badge */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-3 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Оптимизация DOM: Vitualized List (tanstack/react-virtual) Active</span>
        </span>
        <span>
          Отрендерено: {virtualItems.length} {isGrid ? 'строк сетки' : 'строк'} из {totalRows} (Всего судов: {vessels.length})
        </span>
      </div>

      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const rowIndex = virtualRow.index;
          const startItemIndex = isGrid ? rowIndex * columns : rowIndex;
          const rowItems = isGrid
            ? vessels.slice(startItemIndex, startItemIndex + columns)
            : [vessels[rowIndex]];

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
              }}
              className="pb-6"
            >
              {isGrid ? (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
                  {rowItems.map((vessel) => (
                    <VesselCard
                      key={vessel.id}
                      vessel={vessel}
                      onSelect={(vs) => {
                        onSelectVesselForMap(vs);
                        document.getElementById('sea-map-wrapper')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      onBook={(vs) => onBookVessel(vs)}
                      isMapSelected={selectedVesselForMap?.id === vessel.id}
                    />
                  ))}
                </div>
              ) : (
                rowItems.map((vessel) => (
                  <FarpostListRow
                    key={vessel.id}
                    vessel={vessel}
                    onSelect={(vs) => {
                      onSelectVesselForMap(vs);
                      document.getElementById('sea-map-wrapper')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    onBook={(vs) => onBookVessel(vs)}
                    isMapSelected={selectedVesselForMap?.id === vessel.id}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
