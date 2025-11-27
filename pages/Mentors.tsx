import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Search, MapPin, Briefcase, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Mentors: React.FC = () => {
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await api.getMentors();
        setMentors(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleBook = (mentorId: string) => {
    navigate(`/booking/${mentorId}`);
  };

  if (loading) {
    return <div className="text-center py-10">جاري تحميل قائمة الموجهين...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ابحث عن موجهك</h1>
        <p className="text-gray-500 mt-2">استعرض قائمة الخبراء واحجز جلسة استشارية.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.length === 0 ? (
           <p className="text-gray-500 col-span-3 text-center py-10 bg-white rounded-lg shadow-sm">لا يوجد موجهين مسجلين حالياً. كن أول المنضمين!</p>
        ) : (
          mentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 flex flex-col items-center text-center flex-grow">
                <img 
                  src={mentor.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.name}`} 
                  alt={mentor.name} 
                  className="w-24 h-24 rounded-full border-4 border-primary-50 mb-4 object-cover"
                />
                <h3 className="text-lg font-bold text-gray-900">{mentor.name}</h3>
                <p className="text-primary-600 text-sm font-medium mb-2">Mentor</p>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4">{mentor.bio || "لا توجد نبذة تعريفية."}</p>
                
                {mentor.skills && mentor.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mt-auto">
                    {mentor.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <button 
                  onClick={() => handleBook(mentor.id)}
                  className="w-full bg-white border border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CalendarIcon size={18} />
                  احجز جلسة
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Mentors;
