import { createContext, useContext, ReactNode } from "react";

type Theme = {
  primaryColor: string;
  secondaryColor: string;
};

const ThemeContext = createContext<Theme>({
  primaryColor: "#f97316",
  secondaryColor: "#3b82f6",
});

export const ThemeProvider = ({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
