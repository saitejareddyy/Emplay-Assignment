import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PromptList } from './components/prompt-list/PromptList';
import { PromptDetail } from './components/prompt-detail/PromptDetail';
import { AddPrompt } from './components/add-prompt/AddPrompt';
import { Login } from './components/login/Login';
import { Signup } from './components/login/Signup';
import { Sparkles, LogOut, LogIn, UserPlus } from 'lucide-react';

const Nav = () => {
  const { isAuthenticated, logout, isLoading } = useAuth();

  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-blue-400 transition-colors">
          <Sparkles className="w-6 h-6 text-blue-500" />
          Emplay Prompts
        </Link>
        <div className="flex items-center gap-4">
          {!isLoading && (
            isAuthenticated ? (
              <button onClick={logout} className="flex items-center text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="flex items-center text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
                  <LogIn className="w-4 h-4 mr-2" /> Login
                </Link>
                <Link to="/signup" className="flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow">
                  <UserPlus className="w-4 h-4 mr-2" /> Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<PromptList />} />
            <Route path="/prompts/:id" element={<PromptDetail />} />
            <Route path="/add" element={<AddPrompt />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}
