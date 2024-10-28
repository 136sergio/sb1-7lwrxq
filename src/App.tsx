import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CalendarRange, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import MenuPage from './pages/DietsPage';
import AddWeeklyMenuPage from './pages/AddWeeklyMenuPage';
import EditWeeklyMenuPage from './pages/EditWeeklyMenuPage';
import ViewWeeklyMenuPage from './pages/ViewWeeklyMenuPage';
import RecipesPage from './pages/RecipesPage';
import AddRecipePage from './pages/AddRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminRecipes from './pages/AdminRecipes';
import AdminMenus from './pages/AdminMenus';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { useRecipes, useWeeklyMenus } from './hooks/useSupabase';
import { AuthRedirect } from './components/AuthRedirect';

const HomePage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { recipes, refreshRecipes } = useRecipes();
  const { menus, refreshMenus } = useWeeklyMenus();
  const location = useLocation();

  useEffect(() => {
    refreshRecipes();
    refreshMenus();
  }, [location.pathname, refreshRecipes, refreshMenus]);

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          to="/menus" 
          className="bg-white rounded-lg shadow-md p-6 transition-transform duration-200 hover:scale-105 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center flex-grow">
              <CalendarRange className="h-8 w-8 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-2xl md:text-3xl font-bold text-gray-800 break-words">Menús</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-500 ml-2">{menus.length}</span>
          </div>
          <h3 className="text-gray-600 font-medium text-sm md:text-base">Planifica tus comidas</h3>
        </Link>
        <Link 
          to="/recipes" 
          className="bg-white rounded-lg shadow-md p-6 transition-transform duration-200 hover:scale-105 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center flex-grow">
              <BookOpen className="h-8 w-8 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-2xl md:text-3xl font-bold text-gray-800 break-words">Recetas</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-500 ml-2">{recipes.length}</span>
          </div>
          <h3 className="text-gray-600 font-medium text-sm md:text-base">Gestiona tus recetas</h3>
        </Link>
      </div>
      {isAdmin && (
        <Link 
          to="/admin"
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Panel de Administración
        </Link>
      )}
    </main>
  );
};

const App: React.FC = () => {
  const { user, isAdmin } = useAuth();

  return (
    <Router>
      <AuthRedirect />
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
        <Header />
        <Routes>
          <Route path="/login" element={!user ? <LoginForm /> : <Navigate to="/" />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />

          <Route path="/menus" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
          <Route path="/add-weekly-menu" element={<ProtectedRoute><AddWeeklyMenuPage /></ProtectedRoute>} />
          <Route path="/edit-weekly-menu/:id" element={<ProtectedRoute><EditWeeklyMenuPage /></ProtectedRoute>} />
          <Route path="/view-weekly-menu/:id" element={<ProtectedRoute><ViewWeeklyMenuPage /></ProtectedRoute>} />
          <Route path="/recipes" element={<ProtectedRoute><RecipesPage /></ProtectedRoute>} />
          <Route path="/add-recipe" element={<ProtectedRoute><AddRecipePage /></ProtectedRoute>} />
          <Route path="/edit-recipe/:id" element={<ProtectedRoute><EditRecipePage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/recipes" element={<AdminRoute><AdminRecipes /></AdminRoute>} />
          <Route path="/admin/menus" element={<AdminRoute><AdminMenus /></AdminRoute>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;