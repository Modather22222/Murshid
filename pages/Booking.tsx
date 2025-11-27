import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User, MentorAvailability } from '../types';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

const Booking: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<User | null>(null);
  const [availability, setAvailability] = useState<MentorAvailability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<MentorAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!mentorId) return;
      try {
        const mentorData = await api.getUser(mentorId);
        setMentor(mentorData);
        
        const availData = await api.getAvailability(mentorId);
        setAvailability(availData);

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
           const userData = await api.getUser(session.user.id);
           setCurrentUser(userData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mentorId]);

  const handleBooking = async () => {
    if (!selectedSlot || !selectedDate || !currentUser || !mentor) return;
    setBookingLoading(true);
    
    try {
      // Combine date and time to ISO string
      const dateTime = new Date(`${selectedDate}T${selectedSlot.start_time}`).toISOString();
      const sessionLink = `https://meet.google.com/new`; // MVP: Generic link

      await api.bookSession({
        mentor_id: mentor.id,
        mentee_id: currentUser.id,
        datetime: dateTime,
        link: sessionLink,
        status: 'pending'
      });

      alert('تم إرسال طلب الحجز بنجاح!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('فشل الحجز، يرجى المحاولة مرة أخرى.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Helper to get next 7 days dates for specific weekday
  const getNextDatesForDay = (dayName: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = days.indexOf(dayName); // Assuming English DB names
    if (targetDayIndex === -1) return [];

    const dates = [];
    const today = new Date();
    
    for(let i=0; i<14; i++) { // Look ahead 2 weeks
       const d = new Date();
       d.setDate(today.getDate() + i);
       if (d.getDay() === targetDayIndex) {
         dates.push(d.toISOString().split('T')[0]);
       }
    }
    return dates;
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (!mentor) return <div className="p-8 text-center">الموجه غير موجود</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary-600 p-6 text-white text-center">
        <h2 className="text-2xl font-bold">حجز جلسة مع {mentor.name}</h2>
        <p className="opacity-90 mt-2">اختر الوقت المناسب لك من المواعيد المتاحة</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Step 1: Available Slots */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-primary-600" />
            1. اختر الموعد المتاح
          </h3>
          
          {availability.length === 0 ? (
            <div className="text-gray-500 bg-gray-50 p-4 rounded text-center">
              لم يقم هذا الموجه بإضافة مواعيد متاحة بعد.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availability.map((slot) => (
                <div 
                  key={slot.id}
                  onClick={() => { setSelectedSlot(slot); setSelectedDate(''); }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedSlot?.id === slot.id ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'hover:border-primary-300'}`}
                >
                  <p className="font-bold text-gray-800">{slot.day}</p>
                  <p className="text-sm text-gray-600">{slot.start_time} - {slot.end_time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Select Specific Date */}
        {selectedSlot && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="text-primary-600" />
              2. اختر التاريخ
            </h3>
            <div className="flex flex-wrap gap-3">
              {getNextDatesForDay(selectedSlot.day).map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium ${selectedDate === date ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {selectedDate && (
           <div className="border-t pt-6">
             <div className="bg-gray-50 p-4 rounded-lg mb-4">
               <h4 className="font-bold text-gray-900 mb-2">تفاصيل الحجز:</h4>
               <ul className="text-sm text-gray-700 space-y-1">
                 <li>الموجه: {mentor.name}</li>
                 <li>التاريخ: {selectedDate}</li>
                 <li>الوقت: {selectedSlot?.start_time}</li>
               </ul>
             </div>
             
             <button
              onClick={handleBooking}
              disabled={bookingLoading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
             >
               {bookingLoading ? 'جاري الحجز...' : (
                 <>
                   <CheckCircle size={20} />
                   تأكيد الحجز
                 </>
               )}
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
