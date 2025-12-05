'use client';

import dynamic from 'next/dynamic';

// Este componente carrega o mapa original, mas desliga o SSR (Server-Side Rendering)
const LazyMap = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">
      A carregar mapa...
    </div>
  )
});

export default LazyMap;