'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Buscar conversas onde sou comprador OU vendedor
      // Trazemos também os dados do Anúncio (listings) e dos Perfis (profiles)
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, 
          updated_at,
          listing:listings(title, images),
          buyer:profiles!buyer_id(full_name),
          seller:profiles!seller_id(full_name)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (data) setConversations(data);
      setLoading(false);
    };

    fetchConversations();
  }, []);

  if (loading) return <div className="p-10 text-center">A carregar conversas...</div>;

  return (
    <div className="min-h-screen bg-gray-50 max-w-2xl mx-auto border-x border-gray-200">
      <header className="bg-white p-4 shadow-sm flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-emerald-600">← Voltar</Link>
        <h1 className="font-bold text-xl text-gray-800">As Minhas Mensagens</h1>
      </header>

      <div className="divide-y divide-gray-100">
        {conversations.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Ainda não tens mensagens.
          </div>
        ) : (
          conversations.map((chat) => {
            // Decidir qual nome mostrar (o "outro" participante)
            const otherName = userId === chat.buyer_id ? chat.seller?.full_name : chat.buyer?.full_name;
            const isMeBuyer = userId === chat.buyer_id; // Sou eu o comprador?

            return (
              <Link key={chat.id} href={`/mensagens/${chat.id}`} className="block bg-white hover:bg-emerald-50 transition p-4 flex gap-4 items-center">
                {/* Imagem do Anúncio */}
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {chat.listing?.images?.[0] ? (
                    <img src={chat.listing.images[0]} className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex items-center justify-center h-full text-xl">📦</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 truncate">{otherName || 'Utilizador'}</h3>
                    <span className="text-xs text-gray-400">
                      {new Date(chat.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-600 font-medium truncate">
                    {chat.listing?.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isMeBuyer ? 'Tu queres comprar' : 'Querem comprar o teu artigo'}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}