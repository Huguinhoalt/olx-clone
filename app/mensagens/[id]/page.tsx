'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState('CONNECTING'); // CONNECTING, SUBSCRIBED, ERROR
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Carregar mensagens antigas ao entrar
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchInitialData();
  }, [id, router]);

  // 2. Ligar o Tempo Real (Realtime)
  useEffect(() => {
    const channel = supabase
      .channel(`room-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          // Quando chega uma nova mensagem do servidor:
          const newMsg = payload.new;
          
          setMessages((current) => {
            // Evitar duplicados: Se já tivermos esta mensagem (pelo ID), ignoramos
            if (current.some(msg => msg.id === newMsg.id)) {
              return current;
            }
            return [...current, newMsg];
          });
          
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe((state) => {
        console.log("Estado da Conexão:", state);
        setStatus(state);
      });

    // Limpeza ao sair da página
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const msgContent = newMessage;
    setNewMessage(''); // Limpar input imediatamente

    // --- TRUQUE OTIMISTA ---
    // Mostramos a mensagem logo no ecrã (com um ID temporário) para parecer instantâneo
    const tempId = Math.random().toString();
    const optimisticMsg = {
      id: tempId,
      conversation_id: id,
      sender_id: userId,
      content: msgContent,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    // Enviar para a base de dados (em segundo plano)
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { conversation_id: id, sender_id: userId, content: msgContent }
      ])
      .select()
      .single();

    if (error) {
      alert('Erro ao enviar mensagem. Verifica a tua conexão.');
      // Se falhar, removemos a mensagem otimista (opcional, mas recomendado)
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    } else if (data) {
      // Quando o servidor confirma, substituímos a mensagem temporária pela real
      setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-2xl mx-auto border-x border-gray-200 shadow-xl">
      {/* Cabeçalho */}
      <header className="bg-white p-4 shadow-sm flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/mensagens" className="text-gray-500 hover:text-emerald-600 transition p-2 rounded-full hover:bg-gray-100">
            ← Voltar
          </Link>
          <div>
            <h1 className="font-bold text-gray-800 leading-tight">Chat</h1>
            <div className="flex items-center gap-1.5">
              {/* Indicador Visual de Status */}
              <span className={`w-2.5 h-2.5 rounded-full ${status === 'SUBSCRIBED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <p className="text-xs text-gray-500 font-medium">
                {status === 'SUBSCRIBED' ? 'Online' : 'A conectar...'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-3 shadow-sm text-sm ${
                msg.sender_id === userId 
                  ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none'
              }`}
            >
              {msg.content}
              <div className={`text-[10px] mt-1 text-right opacity-70`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 sticky bottom-0">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escreve aqui..."
            className="flex-1 p-3 pl-5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md w-12 h-12 flex items-center justify-center"
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}