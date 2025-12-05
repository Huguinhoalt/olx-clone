'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Começa com o texto que já estiver na URL (se houver)
  const [text, setText] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Não deixa a página recarregar à moda antiga
    
    if (text.trim()) {
      router.push(`/?q=${encodeURIComponent(text)}`);
    } else {
      router.push('/'); // Se apagar tudo, volta ao início
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative flex items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="O que procuras hoje? (Ex: iPhone, BMW...)"
          className="w-full p-4 pl-12 rounded-full border border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
        />
        {/* Ícone de Lupa */}
        <svg 
          className="absolute left-4 w-6 h-6 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        <button 
          type="submit" 
          className="absolute right-2 bg-emerald-600 text-white px-6 py-2 rounded-full font-bold hover:bg-emerald-700 transition"
        >
          Pesquisar
        </button>
      </div>
    </form>
  );
}