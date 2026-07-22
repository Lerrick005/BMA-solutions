import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './routes';
import ChatWidget from './components/common/ChatWidget';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import toast from 'react-hot-toast';

function App() {
  useEffect(() => {
    toast.success('🚀 Welcome to BMA Solutions CRM!', {
      duration: 3000,
      icon: '👋',
      style: {
        background: '#16a34a',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
      },
    });
  }, []);

  return (
    <ThemeProvider>
      <ChatProvider>
        <RouterProvider router={router} />
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
            },
            success: {
              duration: 4000,
              iconTheme: {
                primary: '#16a34a',
                secondary: '#fff',
              },
              style: {
                background: '#f0fdf4',
                border: '1px solid #16a34a',
                color: '#166534',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: '#fef2f2',
                border: '1px solid #ef4444',
                color: '#991b1b',
              },
            },
          }}
        />
        
        <ChatWidget />
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;