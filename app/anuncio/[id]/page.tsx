import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';
import ContactButton from '../../../components/ContactButton';
// IMPORTANTE: Importamos agora o LazyMap (a nossa "ponte") e não o dynamic
import Map from '../../../components/LazyMap'; 

// Força a página a carregar dados frescos sempre que alguém entra
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnuncioDetalhe({ params }: PageProps) {
  const { id } = await params;

  const { data: item, error } = await supabase
    .from('listings')
    .select('*, profiles(*), categories(*)')
    .eq('id', id)
    .single();

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Anúncio não encontrado</h1>
        <Link href="/" className="text-emerald-600 hover:underline">Voltar à página inicial</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <nav className="bg-white p-4 shadow-sm mb-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-gray-500 hover:text-emerald-600 font-medium flex items-center gap-2">
            ← Voltar
          </Link>
          <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {item.categories?.name}
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Esquerda: Imagens e Descrição */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-96 flex items-center justify-center bg-gray-100">
            {item.images && item.images.length > 0 ? (
              <img src={item.images[0]} alt={item.title} className="w-full h-full object-contain" />
            ) : (
              <span className="text-6xl">📷</span>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Descrição</h2>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{item.description}</p>

            {/* Mapa */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Localização</h3>
              
              {/* Aqui usamos o LazyMap, que já trata do erro ssr: false */}
              <Map 
                lat={38.7223} 
                lng={-9.1393} 
                address={item.address_text} 
              />
              
              <p className="text-xs text-gray-400 mt-2">📍 {item.address_text || "Localização aproximada"}</p>
            </div>
          </div>
        </div>

        {/* Direita: Preço */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{item.title}</h1>
            <div className="text-4xl font-extrabold text-emerald-600 mb-6">{item.price} €</div>
            {/* ... preço em cima ... */}
            <div className="text-4xl font-extrabold text-emerald-600 mb-6 tracking-tight">
              {item.price} €
            </div>

            {/* O NOSSO NOVO BOTÃO INTELIGENTE */}
            <ContactButton 
              listingId={item.id} 
              sellerId={item.user_id} 
              listingTitle={item.title}
            />
            
            <button className="w-full bg-white text-emerald-600 font-bold py-3 rounded-xl border-2 border-emerald-100 hover:border-emerald-600 transition">
              Ver Telefone
            </button>
            <div className="mt-4 text-center text-xs text-gray-300">Ref: {item.id.slice(0, 8)}</div>
          </div>
        </div>

      </div>
    </main>
  );
}