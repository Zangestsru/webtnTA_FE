import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context';
import { ProtectedRoute, Navbar } from './components';
import { LoginPage, RegisterPage, DashboardPage, ExamPage, ResultPage, ForgotPasswordPage, ProfilePage } from './pages';
import { AdminLayout, AdminDashboardPage, QuestionBankPage, ExamManagementPage, UserManagementPage, DocumentImportPage } from './pages/admin';
import './index.css';

/**
 * Main application component with routing.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <DashboardPage />
                  </main>
                </>
              } />
              <Route path="/exam/:examId/start" element={
                <div className="bg-white min-h-screen">
                  <ExamPage />
                </div>
              } />
              <Route path="/result/:submissionId" element={
                <>
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ResultPage />
                  </main>
                </>
              } />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboardPage />} />
              <Route path="questions" element={<QuestionBankPage />} />
              <Route path="exams" element={<ExamManagementPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="import" element={<DocumentImportPage />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
