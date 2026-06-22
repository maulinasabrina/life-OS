import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ProtectedRoute } from '@/shared/layouts/ProtectedRoute';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { TasksPage } from '@/pages/tasks/TasksPage';
import { HabitsPage } from '@/pages/habits/HabitsPage';
import { RecurringTasksPage } from '@/pages/recurring-tasks/RecurringTasksPage';
import { JournalListPage } from '@/pages/journal/JournalListPage';
import { JournalNewPage } from '@/pages/journal/JournalNewPage';
import { JournalEntryPage } from '@/pages/journal/JournalEntryPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/recurring" element={<RecurringTasksPage />} />
            <Route path="/journal" element={<JournalListPage />} />
            <Route path="/journal/new" element={<JournalNewPage />} />
            <Route path="/journal/:id" element={<JournalEntryPage />} />
            <Route path="/habits" element={<HabitsPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
