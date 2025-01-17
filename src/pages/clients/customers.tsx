import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSales: number;
  recentTransactionAmount: number;
  recentTransactionDate: string;
  status: "new" | "active";
};

type Props = {
  clientsData: Client[];
};

const ClientsPage = ({ clientsData }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredClients = clientsData.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newClients = filteredClients.filter((client) => client.status === "new");
  const activeClients = filteredClients.filter((client) => client.status === "active");

  const totalCustomerGrowth = clientsData.length;
  const totalSales = clientsData.reduce((sum, client) => sum + client.totalSales, 0);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // Chart Data for Customer Growth
  const chartData = {
    labels: ["New Clients", "Active Clients"],
    datasets: [
      {
        label: "Number of Clients",
        data: [newClients.length, activeClients.length],
        backgroundColor: ["#FFA726", "#29B6F6"],
        borderColor: ["#FB8C00", "#0288D1"],
        borderWidth: 1,
      },
    ],
  };

  const handleDelete = (id: string) => {
    // Placeholder for delete logic
    alert(`Client with ID ${id} deleted.`);
  };

  const handleEdit = (id: string) => {
    // Placeholder for edit logic
    alert(`Editing client with ID ${id}.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Clients Overview</h1>

        {/* Search Bar */}
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search clients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-3 rounded-lg w-full max-w-lg shadow"
          />
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-indigo-600 text-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold">Total Clients</h2>
            <p className="text-2xl font-semibold">{clientsData.length}</p>
          </div>
          <div className="bg-green-600 text-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold">Customer Growth</h2>
            <p className="text-2xl font-semibold">{totalCustomerGrowth}</p>
          </div>
          <div className="bg-yellow-500 text-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold">Total Sales</h2>
            <p className="text-2xl font-semibold">${totalSales.toFixed(2)}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Customer Growth Chart</h2>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>

        {/* Paginated Clients Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Clients List</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedClients.map((client) => (
              <div key={client.id} className="bg-white p-4 rounded-lg shadow relative">
                <h3 className="text-lg font-bold">{client.name}</h3>
                <p className="text-sm text-gray-500">Email: {client.email}</p>
                <p className="text-sm text-gray-500">Phone: {client.phone}</p>
                <p className="text-sm text-gray-700">
                  Total Sales: ${client.totalSales.toFixed(2)}
                </p>
                <p className="text-sm text-gray-700">
                  Recent Transaction: ${client.recentTransactionAmount.toFixed(2)} on{" "}
                  {format(parseISO(client.recentTransactionDate), "MMMM dd, yyyy")}
                </p>

                {/* Edit/Delete Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-700"
                    onClick={() => handleEdit(client.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded shadow hover:bg-red-700"
                    onClick={() => handleDelete(client.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;

export const getServerSideProps = async () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const clientsData = await fetch(`${url}/clients`)
    .then((res) => res.json())
    .catch(() => []);
  return { props: { clientsData } };
};
