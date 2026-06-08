import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import AppLayout from '@/layouts/AppLayout';
import '@/styles/App.css';

// ── Eagerly loaded (always needed on first paint) ──────────────────────────
import LoginPage from '@/pages/auth/LoginPage';

// ── Route-level code splitting (loaded on demand) ─────────────────────────
const Dashboard   = lazy(() => import('@/pages/dashboard/Dashboard'));
const Vacancies   = lazy(() => import('@/pages/recruitment/Vacancies'));
const Recruitment = lazy(() => import('@/pages/recruitment/Recruitment'));
const Interviews  = lazy(() => import('@/pages/recruitment/Interviews'));
const Offers      = lazy(() => import('@/pages/recruitment/Offers'));
const Employees   = lazy(() => import('@/pages/employees/Employees'));
const Attendance  = lazy(() => import('@/pages/employees/Attendance'));
const Performance = lazy(() => import('@/pages/hrops/Performance'));
const Feedback    = lazy(() => import('@/pages/hrops/Feedback'));
const Grievances  = lazy(() => import('@/pages/hrops/Grievances'));
const Exits       = lazy(() => import('@/pages/hrops/Exits'));

/** Minimal spinner shown while a lazy chunk is loading. */
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, animation: 'float 2s ease infinite' }}>⚡</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8, fontFamily: 'var(--font-body)' }}>Loading…</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"   element={<Dashboard />} />
              <Route path="vacancies"   element={<Vacancies />} />
              <Route path="recruitment" element={<Recruitment />} />
              <Route path="interviews"  element={<Interviews />} />
              <Route path="offers"      element={<Offers />} />
              <Route path="employees"   element={<Employees />} />
              <Route path="attendance"  element={<Attendance />} />
              <Route path="performance" element={<Performance />} />
              <Route path="feedback"    element={<Feedback />} />
              <Route path="grievances"  element={<Grievances />} />
              <Route path="exits"       element={<Exits />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

