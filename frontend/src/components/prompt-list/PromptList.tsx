import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const PromptList = () => {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      api.getPrompts()
        .then((data) => {
          setPrompts(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-6">Welcome to AI Prompt Library</h1>
        <p className="text-slate-400 mb-8 text-lg">Please login or sign up to manage your private prompt collection.</p>
        <div className="flex justify-center gap-4">
          <Link to="/login" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/20">
            Login
          </Link>
          <Link to="/signup" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all border border-slate-700">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Prompt Library</h1>
        <Link to="/add" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-all hover:scale-105">
          + Add Prompt
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map(prompt => (
          <Link to={`/prompts/${prompt.id}`} key={prompt.id} className="block w-full">
            <div className="group bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer h-full drop-shadow-md hover:drop-shadow-xl hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">{prompt.title}</h2>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${prompt.complexity > 7 ? 'bg-red-500/20 text-red-400' : prompt.complexity > 4 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                  Level {prompt.complexity}
                </span>
              </div>
              <p className="text-slate-400 text-sm line-clamp-3">
                {prompt.content.length > 50 ? `${prompt.content.substring(0, 50)}...` : prompt.content}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {prompts.length === 0 && (
        <div className="text-center text-slate-500 mt-12">No prompts found. Add one!</div>
      )}
    </div>
  );
};
