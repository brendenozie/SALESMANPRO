// app/admin/[adminSlug]/parentresources/page.tsx
import { 
  BookOpenIcon, 
  VideoCameraIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';
import ResourcesClientPage from './ResourcesClientPage';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'link';
  category: 'Academic' | 'Policy' | 'Tutorial';
  fileSize?: string;
  duration?: string;
  thumbnail?: string;
}

export default async function ParentResourcesPage({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;

  const resources: Resource[] = [
    {
      id: 'r1',
      title: '2026 Academic Calendar',
      description: 'Important dates for terms, holidays, and parent-teacher meetings.',
      type: 'pdf',
      category: 'Policy',
      fileSize: '1.2 MB'
    },
    {
      id: 'r2',
      title: 'How to use the Student Portal',
      description: 'A quick video walkthrough of checking grades and assignments.',
      type: 'video',
      category: 'Tutorial',
      duration: '4:15'
    },
    {
      id: 'r3',
      title: 'School Bus Safety Guidelines',
      description: 'Standard operating procedures for student transportation.',
      type: 'pdf',
      category: 'Policy',
      fileSize: '850 KB'
    }
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-[#f8fafc] min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Resource Center</h1>
        <p className="text-slate-500 mt-1">Access essential documents, guides, and educational videos.</p>
      </div>

      <ResourcesClientPage initialResources={resources} />
    </div>
  );
}