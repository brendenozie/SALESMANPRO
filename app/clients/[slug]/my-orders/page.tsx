import UserNav from '@/components/AdminNav';
import ClientLayout from '@/components/ClientLayout';
import React from 'react';

const myProducts = [
  { id: 1, name: 'Product 1', price: '$10', image: 'https://via.placeholder.com/150', stock: 50 },
  { id: 2, name: 'Product 2', price: '$20', image: 'https://via.placeholder.com/150', stock: 10 },
  { id: 3, name: 'Product 3', price: '$30', image: 'https://via.placeholder.com/150', stock: 0 },
  { id: 4, name: 'Product 4', price: '$40', image: 'https://via.placeholder.com/150', stock: 5 },
];

const MyProductsPage = () => {
  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto">
          <div className="min-h-screen bg-gray-100 py-10">
            <h1 className="text-4xl font-bold text-center mb-10">My Products</h1>
            <div className="container mx-auto px-4">
              <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Product Name</th>
                    <th className="py-3 px-6 text-center">Stock Level</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {myProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span
                          className={
                            product.stock > 0
                              ? 'text-green-500 font-semibold'
                              : 'text-red-500 font-semibold'
                          }
                        >
                          {product.stock > 0 ? product.stock : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
        </ClientLayout>
  );
};

export default MyProductsPage;
