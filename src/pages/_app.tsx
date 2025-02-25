import type { AppProps } from 'next/app';
import { ContextProvider } from '../contexts/ContextProvider';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { getSession } from 'next-auth/react';
import AdminDash from './admin';
import AgentDash from './agent';
import ClientDash from './clients';
import ShopPages from './shop';
import App from 'next/app';

const layoutMapping: Record<string, React.ComponentType<any>> = {
  admin: AdminDash,
  agent: AgentDash,
  client: ClientDash,
  consumer: ShopPages,
};

function MyApp({ Component, pageProps, role }: AppProps & { role: string }) {
  const Layout = layoutMapping[role] || ShopPages;

  return (
    <ContextProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Layout {...pageProps}>
        <Component {...pageProps} />
      </Layout>
    </ContextProvider>
  );
}

MyApp.getInitialProps = async (appContext: any) => {
  const appProps = await App.getInitialProps(appContext);
  const session = await getSession(appContext.ctx);
  
  return {
    ...appProps,
    role: session?.user?.role || 'consumer', // Default role if not found
  };
};

export default MyApp;
