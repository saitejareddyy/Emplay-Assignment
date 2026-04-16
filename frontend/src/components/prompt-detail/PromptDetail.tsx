import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Eye, ArrowLeft, Trash2 } from 'lucide-react';

export const PromptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState<any>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [errorVisible, setErrorVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (id && isAuthenticated) {
      api.getPromptById(id)
        .then(setPrompt)
        .catch((err) => {
          console.error('Prompt detail fetch error:', err);
          setErrorVisible(true);
        });
    }
  }, [id, isAuthenticated, authLoading, navigate]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      await api.deletePrompt(id!);
      navigate('/');
    }
  };

  if (authLoading || (!prompt && !errorVisible)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Loading your prompt...</p>
      </div>
    );
  }

  if (errorVisible) {
    return (
      <div className="max-w-xl mx-auto p-12 mt-10 text-center bg-slate-800/50 rounded-3xl border border-slate-700 backdrop-blur shadow-2xl">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 className="w-10 h-10 text-red-400/50" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-8">This prompt either doesn't exist or you don't have permission to view it.</p>
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold px-6 py-2 bg-blue-500/10 rounded-xl transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
      </Link>
      
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{prompt.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-slate-700 rounded-full text-slate-300">
                Complexity: {prompt.complexity}/10
              </span>
              <span className="flex items-center text-blue-400 font-medium bg-blue-500/10 px-3 py-1 rounded-full">
                <Eye className="w-4 h-4 mr-2" /> {prompt.view_count} views
              </span>
            </div>
          </div>
          
          {isAuthenticated && (
            <button 
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center shrink-0"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
          {prompt.content}
        </div>
      </div>
    </div>
  );
};
