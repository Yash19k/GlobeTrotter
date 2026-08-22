import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyTripsPage } from '@/pages/trips/MyTripsPage';
import { CreateTripPage } from '@/pages/trips/CreateTripPage';
import { TripDetailPage } from '@/pages/trips/TripDetailPage';
import { EditTripPage } from '@/pages/trips/EditTripPage';
import { DiscoverPage } from '@/pages/discovery/DiscoverPage';
import { ItineraryBuilderPage } from '@/pages/itinerary/ItineraryBuilderPage';
import { BudgetPage } from '@/pages/budget/BudgetPage';
import { CalendarTimelinePage } from '@/pages/calendar/CalendarTimelinePage';

export function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Application Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <MyTripsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/new"
          element={
            <ProtectedRoute>
              <CreateTripPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute>
              <TripDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id/edit"
          element={
            <ProtectedRoute>
              <EditTripPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id/itinerary"
          element={
            <ProtectedRoute>
              <ItineraryBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id/budget"
          element={
            <ProtectedRoute>
              <BudgetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id/calendar"
          element={
            <ProtectedRoute>
              <CalendarTimelinePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <DiscoverPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
