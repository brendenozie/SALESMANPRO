import type { AppProps, AppContext } from 'next/app';
import App from 'next/app';
import { ContextProvider } from '../contexts/ContextProvider';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { getSession } from 'next-auth/react';
import AdminDash from './admin';
import AgentDash from './agent';
import ClientDash from './clients';
import ShopIndexPage from './shop'; // Make sure this is a layout component that renders children
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Define role-based layout mapping
const layoutMapping: Record<string, React.ComponentType<any>> = {
  admin: AdminDash,
  agent: AgentDash,
  client: ClientDash,
  consumer: ShopIndexPage,
};

// Role-based route access
const roleRoutes: Record<string, string> = {
  admin: '/admin',
  agent: '/agents',
  client: '/clients',
  consumer: '/shop',
};

interface CustomAppProps extends AppProps {
  role: string;
}

function MyApp({ Component, pageProps, role }: CustomAppProps) {
  const Layout = layoutMapping[role] ?? ShopIndexPage;
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return; // wait for the router

    const allowedBaseRoute = roleRoutes[role] || '/shop';

    // Allow sub-paths under the allowed route (e.g. /shop/product/...)
    if (!router.asPath.startsWith(allowedBaseRoute)) {
      router.push(allowedBaseRoute);
    }
  }, [role, router.asPath, router.isReady]);

  return (
    <ContextProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ContextProvider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  const session = await getSession(appContext.ctx);

  return {
    ...appProps,
    role: session?.user?.role ?? 'consumer',
  };
};

export default MyApp;
