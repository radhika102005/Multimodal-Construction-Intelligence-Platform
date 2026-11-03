
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { AlertBanner } from '../components/AlertBanner';
import { apiService, registerConnectivityListener } from '../services/api';
import { HealthStatus } from '../types';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isBackendAwake, setIsBackendAwake] = useState(true);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check initial health
    apiService.getHealth()
      .then((data) => {
        setHealth(data);
        setIsBackendAwake(true);
      })
      .catch(() => {
        setIsBackendAwake(false);
        setBackendMessage(
          "Connecting to Render backend... (Free instance may spin down after inactivity; initial cold-start takes ~25-45 seconds)."
        );
      });

    // Listen to network interceptor notifications
    const unregister = registerConnectivityListener((isAwake, message) => {
      setIsBackendAwake(isAwake);
      if (message) setBackendMessage(message);
    });

    return () => unregister();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        aiConfigured={health?.ai_configured ?? false}
      />

      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {!isBackendAwake && backendMessage && (
          <div className="p-4 sm:px-8 pb-0">
            <AlertBanner
              type="warning"
              title="Backend Server Cold Start"
              message={backendMessage}
            />
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
