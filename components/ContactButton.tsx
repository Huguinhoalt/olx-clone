'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface ContactButtonProps {
  listingId: string;
  sellerId: string;
  listingTitle: string;
}

export default function ContactButton({ listingId, sellerId }: ContactButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    setLoading(true);

    // 1. Verificar Login
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Precisas de fazer login para enviar mensagens!");
      router.push('/auth');
      return;
    }

    if (user.id === sellerId) {
      alert("Não podes enviar mensagens para ti próprio!");
      setLoading(false);
      return;
    }

    try {
      // 2. TÉCNICA UPSERT (A Solução Definitiva)
      // Tenta criar. Se já existir (conflito), ATUALIZA a data e devolve o ID existente.
      // Isto garante que nunca criamos uma sala nova por engano.
      const { data, error } = await supabase
        .from('conversations')
        .upsert(
          { 
            listing_id: listingId, 
            buyer_id: user.id, 
            seller_id: sellerId,
            updated_at: new Date().toISOString() // Atualiza a data para a conversa subir na lista
          },
          { onConflict: 'listing_id, buyer_id, seller_id' } // A chave da regra que criámos no SQL
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Redireciona SEMPRE para a sala correta (seja nova ou velha)
        router.push(`/mensagens/${data.id}`);
      }

    } catch (error: any) {
      alert("Erro ao abrir conversa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleContact}
      disabled={loading}
      className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95 transform duration-100 mb-4 disabled:opacity-70"
    >
      {loading ? 'A abrir chat...' : 'Enviar Mensagem'}
    </button>
  );
}