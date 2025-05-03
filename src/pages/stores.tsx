import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useRouter } from 'next/router';
import { Edit, Trash2 } from 'lucide-react';

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchStores() {
      const res = await fetch('/api/stores');
      const data = await res.json();
      setStores(data);
    }
    fetchStores();
  }, []);

  const handleEdit = (slug) => {
    router.push(`/stores/${slug}/edit`);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this store?')) {
      await fetch(`/api/stores/${id}`, { method: 'DELETE' });
      setStores((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Stores</h1>
        <Button onClick={() => router.push('/stores/create')}>
          + Create New Store
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <Card key={store.id} className="relative hover:shadow-lg transition-shadow">
            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleEdit(store.slug)}
                aria-label="Edit Store"
              >
                <Edit className="h-4 w-4 text-gray-600" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(store.id)}
                aria-label="Delete Store"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            <CardHeader className="flex items-center">
              <Avatar className="h-12 w-12 mr-4" src={store.logoUrl} />
              <div>
                <h2 className="text-xl font-semibold">{store.name}</h2>
                <p className="text-sm text-muted-foreground">{store.category}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="truncate text-gray-700 mb-4">{store.description}</p>
              <Button
                variant="link"
                size="sm"
                className="mt-2"
                onClick={() => router.push(`/stores/${store.slug}/edit`)}
              >
                View & Edit →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CreateStorePage() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6">
      {/* ... existing create form tabs ... */}
    </div>
  );
}
