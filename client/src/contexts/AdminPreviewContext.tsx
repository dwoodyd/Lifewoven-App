import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "lifewoven_preview_as_user";

interface AdminPreviewContextType {
  previewAsUser: boolean;
  togglePreview: () => void;
}

const AdminPreviewContext = createContext<AdminPreviewContextType>({
  previewAsUser: false,
  togglePreview: () => {},
});

export function AdminPreviewProvider({ children }: { children: ReactNode }) {
  const [previewAsUser, setPreviewAsUser] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, previewAsUser ? "1" : "0");
  }, [previewAsUser]);

  function togglePreview() {
    setPreviewAsUser(v => !v);
  }

  return (
    <AdminPreviewContext.Provider value={{ previewAsUser, togglePreview }}>
      {children}
    </AdminPreviewContext.Provider>
  );
}

export function useAdminPreview() {
  return useContext(AdminPreviewContext);
}
