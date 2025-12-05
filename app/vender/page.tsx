'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function VenderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Dados do formulário
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category_id: '1', // Começa com Tecnologia por defeito
    location: 'Lisboa', // Simplificação para teste
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      // 1. UPLOAD PARA O CLOUDINARY (Se houver ficheiro)
      if (file) {
        const data = new FormData();
        data.append('file', file);
        // SUBSTITUI AQUI PELOS TEUS DADOS REAIS!
        data.append('upload_preset', 'olx-clone-preset'); 
        const cloudName = 'dtestdzoz'; 

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: data,
        });

        const fileData = await res.json();
        if (fileData.secure_url) {
          imageUrl = fileData.secure_url;
        }
      }

      // 2. SALVAR NO SUPABASE
      // Para simplificar, usamos o ID do utilizador de teste que criámos antes
      const fakeUserId = '00000000-0000-0000-0000-000000000000'; 

      const { error } = await supabase.from('listings').insert([
        {
          user_id: fakeUserId,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: parseInt(formData.category_id),
          images: imageUrl ? [imageUrl] : [], // Guarda o link do Cloudinary
          location: '0101000020E610000000000000000000000000000000000000', // Ponto zero (dummy) para não dar erro
          address_text: formData.location,
        },
      ]);

      if (error) throw error;

      alert('Anúncio criado com sucesso!');
      router.push('/'); // Volta para a página inicial
      router.refresh(); // Atualiza a lista

    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Criar Novo Anúncio</h1>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700">O que estás a vender?</label>
          <input
            type="text"
            required
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="Ex: PS5 com 2 comandos"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Preço */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Preço (€)</label>
          <input
            type="number"
            required
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoria</label>
          <select
            className="w-full mt-1 p-2 border rounded-md bg-white"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          >
            <option value="1">Tecnologia</option>
            <option value="2">Carros</option>
            <option value="3">Imóveis</option>
          </select>
        </div>

        {/* Imagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            required
            rows={3}
            className="w-full mt-1 p-2 border rounded-md"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-md hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {loading ? 'A publicar...' : 'Publicar Anúncio Agora'}
        </button>
      </form>
    </main>
  );
}