import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from './context/AuthContext.tsx' // <--- إضافة هذا السطر

createRoot(document.getElementById("root")!).render(
  <>
    {/* <--- إضافة هذا السطر */}
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
    {/* <--- إضافة هذا السطر */}
  </>
);
