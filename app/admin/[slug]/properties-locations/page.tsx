// src/app/admin/[slug]/properties-locations/page.tsx
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { HomeIcon, PlusIcon, PencilIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline'; // Assuming Heroicons


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

// Type definition for a Location
interface Location {
  id: string;
  name: string;
  description?: string;
  parentLocation?: string; // e.g., 'Nairobi' for 'Kilimani'
  latitude?: number;  // Optional: for precise mapping
  longitude?: number; // Optional: for precise mapping
  propertyCount: number;
}

// Mock Data (Replace with actual API call)
const mockLocations: Location[] = [
  { id: 'loc-001', name: 'Karen', description: 'Upscale residential area', propertyCount: 55, latitude: -1.31, longitude: 36.68 },
  { id: 'loc-002', name: 'Kilimani', description: 'Vibrant urban center', propertyCount: 120, latitude: -1.29, longitude: 36.79 },
  { id: 'loc-003', name: 'Westlands', description: 'Major commercial and residential hub', propertyCount: 90, latitude: -1.26, longitude: 36.80 },
  { id: 'loc-004', name: 'Runda', description: 'Exclusive residential area with large homes', propertyCount: 40, latitude: -1.22, longitude: 36.83 },
  { id: 'loc-005', name: 'Syokimau', description: 'Growing residential area along Mombasa Road', propertyCount: 70, latitude: -1.37, longitude: 36.93 },
  { id: 'loc-006', name: 'CBD', description: 'Central Business District', propertyCount: 30, latitude: -1.28, longitude: 36.82 },
];

interface LocationsPageProps {
  params:Promise<{ slug: string }>
}

export default function PropertiesLocationsPage({ params }: LocationsPageProps) {
  const { slug } = params;

  // In a real app, you'd fetch locations here:
  // const [locations, setLocations] = useState<Location[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchLocations = async () => {
  //     try {
  //       // Replace with your actual API endpoint
  //       const response = await fetch(`${apiBaseUrl}/admin/${slug}/locations`);
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch locations');
  //       }
  //       const data: Location[] = await response.json();
  //       setLocations(data);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'An unknown error occurred');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchLocations();
  // }, [slug]);

  // For demonstration, we'll use mock data directly
  const locations = mockLocations;
  const loading = false; // Set to true when fetching
  const error = null; // Set if an error occurs

  // --- Handlers for CRUD operations (placeholders) ---

  const handleAddLocation = () => {
    // Navigate to a new page or open a modal for adding
    console.log('Navigate to add new location form');
    // Example: router.push(`/admin/${slug}/properties-locations/new`);
  };

  const handleEditLocation = (locationId: string) => {
    // Navigate to an edit page or open a modal with location data
    console.log(`Edit location with ID: ${locationId}`);
    // Example: router.push(`/admin/${slug}/properties-locations/edit/${locationId}`);
  };

  const handleDeleteLocation = (locationId: string) => {
    // Implement confirmation modal before actual deletion
    console.log(`Delete location with ID: ${locationId}`);
    // Call API to delete, then update state
  };

  // --- Render logic ---

  if (loading) {
    return <div className="p-8 text-center">Loading locations...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  // You might want to check if slug is valid here
  // if (!isValidAdminSlug(slug)) {
  //   notFound(); // Next.js built-in for 404
  // }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center space-x-2 text-gray-600 mb-4">
        <HomeIcon className="h-5 w-5" />
        <span>Admin Dashboard</span>
        <span>/</span>
        <span>Real Estate</span>
        <span>/</span>
        <span className="font-semibold">Locations</span>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Property Locations</h1>
          <button
            onClick={handleAddLocation}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Location
          </button>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No locations found. Click "Add New Location" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  {/* Optional: Add columns for Latitude/Longitude if you display them */}
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.map((location) => (
                  <tr key={location.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {location.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.propertyCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditLocation(location.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Edit Location"
                      >
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Location"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Further enhance with a map component here for visual location management */}
      </div>
    </div>
  );
}