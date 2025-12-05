import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import SearchBar from '../components/SearchBar';

export const revalidate = 0;

interface HomeProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  // 1. Ler parâmetros de pesquisa
  const { q } = await searchParams;
  const queryText = q || '';

  // 2. Construir consulta ao Supabase
  let query = supabase
    .from('listings')
    .select('*, categories(*)')
    .order('created_at', { ascending: false });

  // Se houver pesquisa, filtrar pelo título
  if (queryText) {
    query = query.ilike('title', `%${queryText}%`);
  }

  const { data: listings, error } = await query;

  if (error) {
    return <div className="p-10 text-red-500">Erro: {error.message}</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      {/* --- NAVBAR --- */}
      <header className="bg-white shadow-sm p-4 mb-8 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold text-emerald-600 tracking-tight">
            Clone OLX
          </Link>
          
          <div className="flex items-center gap-4">
             {/* BOTÃO DE LOGIN ATUALIZADO */}
             <Link href="/auth" className="text-gray-600 hover:text-emerald-600 font-medium transition">
               Entrar / Registar
             </Link>
             {/* Link para Inbox */}
             <Link href="/mensagens" className="text-gray-600 hover:text-emerald-600 mr-4 font-bold text-xl" title="Mensagens">
               💬
             </Link>

             <Link href="/vender">
               <button className="bg-emerald-600 text-white px-5 py-2 rounded-full font-bold hover:bg-emerald-700 transition shadow-md">
                 Vender Agora
               </button>
             </Link>
          </div>
        </div>
      </header>

      {/* --- CONTEÚDO --- */}
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Barra de Pesquisa */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Encontra bons negócios perto de ti
          </h2>
          <SearchBar />
        </div>

        {/* Feedback de Pesquisa */}
        {queryText && (
          <p className="mb-4 text-gray-500">
            Resultados para: <span className="font-bold text-gray-800">"{queryText}"</span>
          </p>
        )}
        
        {/* Lista de Anúncios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings?.map((item) => (
            <Link key={item.id} href={`/anuncio/${item.id}`} className="group">
              <article className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition duration-300 flex flex-col h-full">
                
                {/* Imagem */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-5xl">📷</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm z-10">
                    {item.categories?.name}
                  </div>
                </div>
                
                {/* Detalhes */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition">
                    {item.title}
                  </h3>
                  <div className="text-2xl font-bold text-emerald-600 mb-2">
                    {item.price} €
                  </div>
                  <p className="text-sm text-gray-500 mb-3">📍 {item.address_text}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Estado Vazio */}
        {(!listings || listings.length === 0) && (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Nenhum anúncio encontrado.</p>
            {queryText && (
              <Link href="/" className="text-emerald-600 hover:underline mt-2 inline-block">
                Limpar pesquisa
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}