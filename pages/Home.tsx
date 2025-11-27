import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Award, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-16 py-10">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
          طوّر مسارك المهني مع <br/>
          <span className="text-primary-600">أفضل الخبراء السودانيين</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600">
          منصة "مرشد" تربطك بموجهين محترفين في مجالات البرمجة، التصميم، وإدارة المنتجات لمساعدتك على الوصول لأهدافك.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/mentors" className="bg-primary-600 text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-primary-700 shadow-lg transition-transform hover:-translate-y-1 flex items-center gap-2">
            تصفح الموجهين <ArrowRight size={20} className="rtl:rotate-180" />
          </Link>
          <Link to="/auth?mode=register" className="bg-white text-primary-600 border-2 border-primary-100 px-8 py-3 rounded-full text-lg font-bold hover:bg-primary-50 shadow-md transition-transform hover:-translate-y-1">
             انضم كموجه
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
          <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary-600">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold">شبكة خبراء</h3>
          <p className="text-gray-500">نخبة من المهندسين والمبرمجين السودانيين العاملين في كبرى الشركات.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
          <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary-600">
            <Calendar size={32} />
          </div>
          <h3 className="text-xl font-bold">جلسات مرنة</h3>
          <p className="text-gray-500">احجز جلسات فردية في الأوقات التي تناسبك عبر Google Meet.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
          <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary-600">
            <Award size={32} />
          </div>
          <h3 className="text-xl font-bold">تطور مستمر</h3>
          <p className="text-gray-500">نظام مهام ومتابعة دقيقة لضمان تحقيقك لأقصى استفادة من التوجيه.</p>
        </div>
      </div>

      {/* Stats or Trust */}
      <div className="bg-primary-900 rounded-3xl p-10 text-center text-white space-y-4">
        <h2 className="text-3xl font-bold">جاهز لتبدأ رحلتك؟</h2>
        <p className="text-primary-100">انضم لمئات المتدربين والموجهين اليوم.</p>
        <Link to="/auth?mode=register" className="inline-block bg-white text-primary-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 mt-4">
          سجل مجاناً
        </Link>
      </div>
    </div>
  );
};

export default Home;
