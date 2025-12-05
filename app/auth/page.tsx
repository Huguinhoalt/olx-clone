'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Controla se é Login ou Registo

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let error;
      
      if (isLogin) {
        // --- MODO LOGIN ---
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        error = signInError;
      } else {
        // --- MODO REGISTO ---
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        error = signUpError;
      }

      if (error) throw error;

      // Se tudo correr bem:
      alert(isLogin ? 'Login efetuado!' : 'Registo efetuado! Verifica o teu email se necessário.');
      router.push('/'); // Manda para a página inicial
      router.refresh(); // Atualiza o site para reconhecer o utilizador

    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6 text-emerald-800">
          {isLogin ? 'Bem-vindo de volta' : 'Cria a tua conta'}
        </h1>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              placeholder="exemplo@email.com"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              placeholder="******"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? 'A processar...' : (isLogin ? 'Entrar' : 'Registar')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="mb-2">
            {isLogin ? 'Ainda não tens conta?' : 'Já tens uma conta?'}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 font-bold hover:underline"
          >
            {isLogin ? 'Criar conta nova' : 'Fazer Login'}
          </button>
        </div>
      </div>
    </div>
  );
}