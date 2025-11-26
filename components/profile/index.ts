// components/profile/index.ts
// Export all profile components
export { default as ProfileHeader } from './ProfileHeader';
export type { ProfileHeaderProps } from './ProfileHeader';

export { default as SectionGrid, SectionHighlights, CoreValuesSection, StatsSection } from './SectionGrid';

export { 
  BlogCard, 
  EventCard, 
  ProductCard, 
  PhotoCard, 
  VideoCard 
} from './ContentCards';

export { default as EmptyState } from './EmptyState';

export { default as Pagination, PagePagination } from './Pagination';

export { default as ProfilePage } from './ProfilePage';
