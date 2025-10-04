// app/providers.tsx
"use client";

import { ReactNode } from "react";
import { ContextProvider } from "@/contexts/ContextProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

type Props = {
  children: ReactNode;
  session?: any;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
};

export default function Providers({ children, session, theme }: Props) {
  const defaultTheme = {
    primaryColor: theme?.primaryColor || "#f97316",
    secondaryColor: theme?.secondaryColor || "#3b82f6",
  };

  return (
    <SessionProvider session={session}>
      <ContextProvider>
        <ThemeProvider theme={defaultTheme}>
          <Toaster position="top-right" reverseOrder={false} />
          {children}
        </ThemeProvider>
      </ContextProvider>
    </SessionProvider>
  );
}
