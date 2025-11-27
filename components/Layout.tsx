import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { LogOut, User as UserIcon, Calendar, CheckSquare, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        setUser(data);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      setUser(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">مرشد</span>
                <span className="mr-2 text-sm text-gray-500 hidden sm:block">| Mentorship</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:text-primary-600'}`}
                  >
                   لوحة التحكم
                  </Link>
                  {user.role === 'mentee' && (
                     <Link 
                     to="/mentors" 
                     className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/mentors') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:text-primary-600'}`}
                   >
                    الموجهين
                   </Link>
                  )}
                  <div className="flex items-center gap-2 mr-4 border-r pr-4">
                     <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                     <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-1" title="تسجيل خروج">
                        <LogOut size={20} />
                     </button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/auth?mode=login" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                    تسجيل الدخول
                  </Link>
                  <Link to="/auth?mode=register" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-shadow shadow-md">
                    انضم إلينا
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Murshid Platform. Built for Sudan.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
