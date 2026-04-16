import { useState, FormEvent } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export const AddPrompt = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [complexity, setComplexity] = useState(5);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) return <div className="p-8 text-center text-slate-400">Verifying session...</div>;

  if (!isAuthenticated) return <Navigate to="/login" />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setErrorMsg('');
    setLoading(true);
    
    try {
      await api.createPrompt({ title, content, complexity });
      
      navigate('/');
    } catch (err: any) {
      console.error('Failed processing prompt submission:', err);
      // Give the user some actual visual feedback instead of a jarring alert pop-up
      setErrorMsg(err.message || 'There was an issue saving your prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
      </Link>
      
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Prompt</h1>
        
        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <input 
              required 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Cinematic Sci-Fi Cityscape"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Complexity (1 = Simple, 10 = Highly Detailed)
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" max="10" 
                value={complexity}
                onChange={e => setComplexity(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <span className="font-mono text-xl font-bold w-8 text-center text-blue-400">{complexity}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Prompt Content</label>
            <textarea 
              required
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors resize-y"
              placeholder="Enter the full AI generation prompt here..."
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Save Prompt'}
          </button>
        </form>
      </div>
    </div>
  );
};
