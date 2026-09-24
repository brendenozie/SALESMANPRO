const fs = require('fs');

// 1. library-acquisitions/page.tsx
const acqPage = `import LibraryAcquisitionsClient from "./LibraryAcquisitionsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryAcquisitionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const raw = await prisma.libraryAcquisition.findMany({
    where: { companyId },
    orderBy: { updatedAt: "desc" },
  });

  const initialOrders = raw.map((o) => ({
    id: o.id,
    title: o.title,
    qty: o.qty,
    cost: o.cost,
    status: o.status,
    vendor: o.vendor,
    date: new Date(o.updatedAt).toLocaleDateString(),
  }));

  return <LibraryAcquisitionsClient initialOrders={JSON.parse(JSON.stringify(initialOrders))} schoolId={companyId} />;
}
`;
fs.writeFileSync('app/admin/[slug]/library-acquisitions/page.tsx', acqPage, 'utf8');

// 2. library-books-categories/page.tsx
const catPage = `import LibraryCategoriesClient from "./LibraryCategoriesClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryCategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const raw = await prisma.libraryCategory.findMany({
    where: { companyId },
    include: {
      _count: {
        select: { libraryBooks: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const initialCategories = raw.map((c) => ({
    id: c.id,
    name: c.name,
    count: c._count?.libraryBooks || 0,
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <LibraryCategoriesClient initialCategories={JSON.parse(JSON.stringify(initialCategories))} schoolId={companyId} />;
}
`;
fs.writeFileSync('app/admin/[slug]/library-books-categories/page.tsx', catPage, 'utf8');

// 3. library-inventory/page.tsx
const invPage = `import LibraryInventoryClient from "./LibraryInventoryClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryInventoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const raw = await prisma.libraryBook.findMany({
    where: { companyId },
    include: { category: true },
    orderBy: { title: "asc" },
  });

  const initialItems = raw.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    isbn: b.isbn || "N/A",
    category: b.category?.name || "Uncategorized",
    shelfLocation: b.shelfLocation || b.location || "Unassigned",
    status: b.status,
    integrity: b.integrity ?? 100,
    condition: b.condition || "Good",
    lastAudit: b.lastAudit ? new Date(b.lastAudit).toLocaleDateString() : new Date().toLocaleDateString(),
  }));

  return <LibraryInventoryClient initialItems={JSON.parse(JSON.stringify(initialItems))} schoolId={companyId} />;
}
`;
fs.writeFileSync('app/admin/[slug]/library-inventory/page.tsx', invPage, 'utf8');

// 4. library-maintenance/page.tsx
const maintPage = `import MaintenanceClient from "./MaintenanceClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryMaintenancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const raw = await prisma.libraryBook.findMany({
    where: { companyId },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  const initialBooks = raw.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    isbn: b.isbn || "N/A",
    shelfLocation: b.shelfLocation || b.location || "Unassigned",
    integrity: b.integrity ?? 100,
    condition: b.condition || "Good",
    status: b.status,
    lastAudit: b.lastAudit ? new Date(b.lastAudit).toLocaleDateString() : new Date().toLocaleDateString(),
  }));

  return <MaintenanceClient schoolId={companyId} initialBooks={JSON.parse(JSON.stringify(initialBooks))} />;
}
`;
fs.writeFileSync('app/admin/[slug]/library-maintenance/page.tsx', maintPage, 'utf8');

// 5. library-reservations/page.tsx
const resPage = `import LibraryReservationsClient from "./LibraryReservationsClient";
import { format } from "date-fns";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryReservationsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const rawData = await prisma.libraryReservation.findMany({
    where: { book: { companyId } },
    include: {
      book: true,
      libraryMember: {
        include: {
          student: true,
          educator: { include: { user: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const bookQueues = {};
  const initialReservations = rawData.map((res) => {
    if (!bookQueues[res.bookId]) bookQueues[res.bookId] = [];
    bookQueues[res.bookId].push(res.id);

    const member = res.libraryMember;
    const memberName = member?.student
      ? \`\${member.student.firstName} \${member.student.lastName}\`
      : member?.educator?.user?.name || "Unknown Member";

    const isReady = res.book.status === "AVAILABLE" || res.book.status === "RESERVED";

    return {
      id: res.id,
      book: res.book.title,
      member: memberName,
      memberEmail: member?.student?.contactEmail || member?.educator?.user?.email || "",
      requestDate: format(new Date(res.createdAt), "MMM dd, yyyy"),
      status: isReady ? 'Ready' : 'Pending',
      position: bookQueues[res.bookId].indexOf(res.id) + 1,
      expectedArrival: res.book.status === "ISSUED" ? "Within 14 days" : "Check Shelves",
    };
  });

  return (
    <LibraryReservationsClient
      initialReservations={JSON.parse(JSON.stringify(initialReservations))}
      schoolId={companyId}
    />
  );
}
`;
fs.writeFileSync('app/admin/[slug]/library-reservations/page.tsx', resPage, 'utf8');

// 6. library-returns/page.tsx
const retPage = `import LibraryReturnsPageClient from "./LibraryReturnsPageClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryReturnsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const raw = await prisma.libraryIssuance.findMany({
    where: { companyId, status: "RETURNED" },
    include: {
      book: true,
      libraryMember: {
        include: {
          student: true,
          educator: { include: { user: true } },
        },
      },
    },
    orderBy: { returnDate: "desc" },
    take: 50,
  });

  const initialHistory = raw.map((iss) => {
    const member = iss.libraryMember;
    const memberName = member?.student
      ? \`\${member.student.firstName} \${member.student.lastName}\`
      : member?.educator?.user?.name || "Library Member";

    return {
      id: iss.id,
      bookTitle: iss.book?.title || "Unknown Book",
      member: memberName,
      returnDate: iss.returnDate ? iss.returnDate.toISOString() : new Date().toISOString(),
      condition: iss.isDamaged ? "Damaged" : "Good",
    };
  });

  return <LibraryReturnsPageClient schoolId={companyId} initialHistory={JSON.parse(JSON.stringify(initialHistory))} />;
}
`;
fs.writeFileSync('app/admin/[slug]/library-returns/page.tsx', retPage, 'utf8');

// 7. library-suppliers/page.tsx
const supPage = `import LibrarySuppliersClient from "./LibrarySuppliersClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibrarySuppliersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const [suppliersRaw, categoriesRaw] = await Promise.all([
    prisma.librarySupplier.findMany({
      where: { companyId },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.librarySupplierCategory.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    }),
  ]);

  const initialSuppliers = suppliersRaw.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone || "N/A",
    category: s.category?.name || "General",
    contact: s.contactEmail,
    leadTime: s.leadTime || "7 Days",
    status: s.status || "Active",
    reliability: s.reliability ?? 100,
  }));

  const initialCategories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    phone: "N/A",
    category: c.name,
    contact: "",
    leadTime: "7 Days",
    status: "Active",
    reliability: 100,
  }));

  return (
    <LibrarySuppliersClient 
      initialSuppliers={JSON.parse(JSON.stringify(initialSuppliers))} 
      initialCategories={JSON.parse(JSON.stringify(initialCategories))}
      schoolId={companyId} 
    />
  );
}
`;
fs.writeFileSync('app/admin/[slug]/library-suppliers/page.tsx', supPage, 'utf8');

// 8. library-suppliers-categories/page.tsx
const supCatPage = `import CategoryManagerClient from "./CategoryManagerClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibrarySuppliersCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const categoriesRaw = await prisma.librarySupplierCategory.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  });

  const initialCategories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    phone: "N/A",
    category: c.name,
    contact: "",
    leadTime: "7 Days",
    status: "Active",
    reliability: 100,
  }));

  return (
    <CategoryManagerClient 
      initialCategories={JSON.parse(JSON.stringify(initialCategories))} 
      schoolId={companyId} 
    />
  );
}
`;
fs.writeFileSync('app/admin/[slug]/library-suppliers-categories/page.tsx', supCatPage, 'utf8');

console.log('All 8 library Server Component page.tsx files converted to direct Prisma queries successfully!');
