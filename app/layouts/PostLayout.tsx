// components/layouts/ServicesLayout.tsx
export default function ServicesLayout({ children, slug }:any) {
  return (
    <>
      <header className="bg-blue-600 text-white p-4">Services Navbar</header>
      <div className="container mx-auto">{children}</div>
      <footer className="mt-12 text-center">All about services for {slug}</footer>
    </>
  )
}
