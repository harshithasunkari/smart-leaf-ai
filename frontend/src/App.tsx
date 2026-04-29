import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardHub from './pages/DashboardHub';
import SingleDetection from './pages/SingleDetection';
import MultiDetection from './pages/MultiDetection';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ManualPesticide from './pages/ManualPesticide';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Chatbot from './components/Chatbot';
import { authStore, type AuthUser } from './store/auth';
import { fetchMe } from './services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => authStore.isAuthenticated()
  );
  const [isLoginView, setIsLoginView] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [user, setUser] = React.useState<AuthUser | null>(() => authStore.getUser());

  // On mount, if token exists try to fetch user
  React.useEffect(() => {
    if (authStore.isAuthenticated() && !user) {
      fetchMe()
        .then((u) => {
          authStore.setUser(u);
          setUser(u);
          setIsAuthenticated(true);
        })
        .catch(() => {
          authStore.logout();
          setIsAuthenticated(false);
        });
    }
  }, []);

  const handleLogin = async (token: string) => {
    authStore.setToken(token);
    try {
      const u = await fetchMe();
      authStore.setUser(u);
      setUser(u);
    } catch {
      // user fetch failed — still let them in
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authStore.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsLoginView(true);
  };

  if (!isAuthenticated) {
    return isLoginView ? (
      <Login onLogin={handleLogin} toggleView={() => setIsLoginView(false)} />
    ) : (
      <Signup onLogin={handleLogin} toggleView={() => setIsLoginView(true)} />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHub user={user} />;
      case 'detection':
        return <SingleDetection />;
      case 'multi':
        return <MultiDetection />;
      case 'manual':
        return <ManualPesticide />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage onLogout={handleLogout} />;
      default:
        return <DashboardHub user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9F7] font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          user={user}
          onSettingsClick={() => setActiveTab('settings')}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Chatbot />
    </div>
  );
}