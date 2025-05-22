import UserNav from '../../../components/AdminNav';
import ClientLayout from '../../../components/ClientLayout';
import React from 'react';

const messages = [
  { id: 1, sender: 'John Doe', subject: 'Order Inquiry', date: '2025-01-20', content: 'Can you provide more details about my recent order?' },
  { id: 2, sender: 'Jane Smith', subject: 'Product Feedback', date: '2025-01-19', content: 'I absolutely love the product I purchased!' },
  { id: 3, sender: 'Alice Johnson', subject: 'Request for Return', date: '2025-01-18', content: 'I need to return an item I ordered by mistake.' },
  { id: 4, sender: 'Bob Brown', subject: 'Shipping Update', date: '2025-01-17', content: 'Has my package been shipped yet?' },
];

const ProductsPage = () => {
  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto">
          <div className="min-h-screen bg-gray-100 py-10">
            <h1 className="text-4xl font-bold text-center mb-10">Messages</h1>
            <div className="container mx-auto px-4">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="py-3 px-6 text-left">Sender</th>
                      <th className="py-3 px-6 text-left">Subject</th>
                      <th className="py-3 px-6 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {messages.map((message) => (
                      <tr
                        key={message.id}
                        className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                        onClick={() => alert(`Message from ${message.sender}:\n\n${message.content}`)}
                      >
                        <td className="py-3 px-6">{message.sender}</td>
                        <td className="py-3 px-6">{message.subject}</td>
                        <td className="py-3 px-6">{message.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ProductsPage;
