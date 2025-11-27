import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Role } from '../types';

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [verifyStep, setVerifyStep] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('mentee');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
    setMode(newMode);
    setVerifyStep(false);
    setError(null);
  }, [searchParams]);

  const createProfile = async (userId: string) => {
    const userProfile = {
      id: userId,
      email: email,
      name: name,
      role: role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      skills: [],
      bio: '',
    };

    const { error: profileError } = await supabase
      .from('users')
      .insert([userProfile]);

    if (profileError) {
       console.error("Profile creation error:", profileError);
       // If it's a duplicate key error, we can ignore it (user might have tried to register, got stuck, then verified)
       if (profileError.code !== '23505') {
           throw new Error(`فشل إنشاء الملف الشخصي: ${profileError.message}`);
       }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role }
        }
      });

      if (authError) throw authError;

      if (authData.session) {
        // Email confirmation is disabled in Supabase, or auto-confirmed
        await createProfile(authData.user!.id);
        navigate('/dashboard');
      } else if (authData.user) {
        // User created but session is null -> Email confirmation required
        setVerifyStep(true);
        setError(null); // Clear any previous errors
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      if (error) throw error;

      if (data.session) {
        await createProfile(data.user.id);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const currentSubmitHandler = () => {
      if (mode === 'login') return handleLogin;
      if (verifyStep) return handleVerify;
      return handleRegister;
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {mode === 'login' ? 'تسجيل الدخول' : (verifyStep ? 'تفعيل الحساب' : 'إنشاء حساب جديد')}
        </h2>
        
        {!verifyStep && (
            <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'login' ? (
                <>
                ليس لديك حساب؟{' '}
                <button onClick={() => setMode('register')} className="font-medium text-primary-600 hover:text-primary-500">
                    سجل الآن
                </button>
                </>
            ) : (
                <>
                لديك حساب بالفعل؟{' '}
                <button onClick={() => setMode('login')} className="font-medium text-primary-600 hover:text-primary-500">
                    سجل دخولك
                </button>
                </>
            )}
            </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={currentSubmitHandler()}>
            
            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            {verifyStep && !error && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-sm">
                    تم إرسال رمز التحقق إلى {email}
                </div>
            )}

            {/* Verification OTP Input */}
            {mode === 'register' && verifyStep && (
                <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                        رمز التحقق
                    </label>
                    <div className="mt-1">
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center tracking-widest text-lg"
                            placeholder="123456"
                        />
                    </div>
                </div>
            )}

            {/* Standard Inputs (Login or Register Init) */}
            {(!verifyStep) && (
                <>
                    {mode === 'register' && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            الاسم الكامل
                            </label>
                            <div className="mt-1">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                            </div>
                        </div>
                    )}

                    <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        البريد الإلكتروني
                    </label>
                    <div className="mt-1">
                        <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>
                    </div>

                    <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        كلمة المرور
                    </label>
                    <div className="mt-1">
                        <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete={mode === 'login' ? "current-password" : "new-password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                            نوع الحساب
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('mentee')}
                                className={`flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium ${
                                role === 'mentee'
                                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                متدرب (Mentee)
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('mentor')}
                                className={`flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium ${
                                role === 'mentor'
                                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                موجه (Mentor)
                            </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'جاري التحميل...' : (
                    mode === 'login' ? 'دخول' : (verifyStep ? 'تأكيد الرمز' : 'إنشاء حساب')
                )}
              </button>
            </div>
            
            {verifyStep && (
                <div className="text-center">
                    <button type="button" onClick={() => setVerifyStep(false)} className="text-sm text-gray-500 hover:text-gray-700">
                        العودة
                    </button>
                </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;