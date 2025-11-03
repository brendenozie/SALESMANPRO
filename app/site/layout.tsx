// app/site/layout.tsx
import { ReactNode } from 'react';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <div className="justify-self-center">{children}</div>;
}
