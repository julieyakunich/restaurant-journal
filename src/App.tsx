import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { AllergyCardPage } from './pages/AllergyCardPage';
import { ProfilePage } from './pages/ProfilePage';

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-400">
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
    </div>
  );
}

export default function App() {
  const authStatus = useAuthStore((s) => s.status);
  const initialize = useAuthStore((s) => s.initialize);
  const hydrate = useAppStore((s) => s.hydrate);
  const resetApp = useAppStore((s) => s.reset);

  useEffect(() => initialize(), [initialize]);

  useEffect(() => {
    if (authStatus === 'signedIn') void hydrate();
    else if (authStatus === 'signedOut') resetApp();
  }, [authStatus, hydrate, resetApp]);

  if (authStatus === 'loading') return <Splash />;

  if (authStatus === 'signedOut') {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/trips" element={<TripPlannerPage />} />
        <Route path="/allergy-card" element={<AllergyCardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
