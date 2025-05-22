import { createContext, useContext } from "react";

type AdminContextType = {
  id: string;
};

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdminId = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdminId must be used within AdminContext.Provider");
  return context;
};
