import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session, Task, MentorAvailability } from '../types';
import { api } from '../services/api';
import { Calendar, CheckSquare, Clock, Video, Plus, User as UserIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'tasks' | 'availability'>('sessions');
  const navigate = useNavigate();

  // Availability State (Mentor only)
  const [myAvailability, setMyAvailability] = useState<MentorAvailability[]>([]);
  const [newDay, setNewDay] = useState('Sunday');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');

  // Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [selectedMenteeForTask, setSelectedMenteeForTask] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      try {
        const userData = await api.getUser(session.user.id);
        setUser(userData);

        // Fetch Sessions
        const sessionData = await api.getSessions(userData.id, userData.role);
        setSessions(sessionData);

        // Fetch Tasks
        // Note: Realistically we need a better filter, but for MVP fetching all tasks related to user
        const taskData = await api.getTasks(userData.id);
        setTasks(taskData);

        if (userData.role === 'mentor') {
          const availData = await api.getAvailability(userData.id);
          setMyAvailability(availData);
        }

      } catch (e) {
        console.error("Error loading dashboard", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleAddAvailability = async () => {
    if (!user) return;
    try {
      await api.addAvailability({
        mentor_id: user.id,
        day: newDay,
        start_time: newStart,
        end_time: newEnd
      });
      // Refresh
      const availData = await api.getAvailability(user.id);
      setMyAvailability(availData);
      alert('تمت إضافة الموعد بنجاح');
    } catch (e) {
      alert('حدث خطأ');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    // For MVP, if I am a mentor, I need to know which mentee to assign to. 
    // Usually tasks are linked to sessions.
    // Simplified: Dropdown of recent mentees from sessions
    if (!selectedMenteeForTask && user?.role === 'mentor') {
        alert("اختر متدرباً");
        return;
    }
    
    try {
       await api.createTask({
           title: newTaskTitle,
           description: newTaskDesc,
           status: 'pending',
           // If mentee creates task, it's for themselves (todo list)
           // If mentor creates, assigned to selected mentee
           assigned_to: user?.role === 'mentee' ? user.id : selectedMenteeForTask, 
           session_id: 'generic' // Simplified for MVP
       });
       const taskData = await api.getTasks(user!.id);
       setTasks(taskData); // This won't show task created FOR mentee if I'm mentor immediately unless query changes
       setNewTaskTitle('');
       setNewTaskDesc('');
       alert("تمت المهمة");
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-10 text-center">جاري تحميل لوحة التحكم...</div>;
  if (!user) return null;

  // Unique mentees list for task assignment
  const uniqueMentees = Array.from(new Set(sessions.map(s => s.mentee?.id).filter(Boolean))).map(id => {
      return sessions.find(s => s.mentee?.id === id)?.mentee;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <img 
             src={user.avatar} 
             alt={user.name} 
             className="w-16 h-16 rounded-full border-2 border-primary-500"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مرحباً، {user.name}</h1>
            <p className="text-gray-500">{user.role === 'mentor' ? 'لوحة تحكم الموجه' : 'لوحة تحكم المتدرب'}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <span className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-bold">
             {user.role === 'mentor' ? `${sessions.length} جلسات قادمة` : `${tasks.filter(t => t.status !== 'completed').length} مهام معلقة`}
           </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-4 px-6 text-sm font-medium transition-colors relative ${activeTab === 'sessions' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          الجلسات
          {activeTab === 'sessions' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-4 px-6 text-sm font-medium transition-colors relative ${activeTab === 'tasks' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          المهام
          {activeTab === 'tasks' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></span>}
        </button>
        {user.role === 'mentor' && (
          <button
            onClick={() => setActiveTab('availability')}
            className={`pb-4 px-6 text-sm font-medium transition-colors relative ${activeTab === 'availability' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            أوقات العمل
            {activeTab === 'availability' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></span>}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        
        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
             {sessions.length === 0 ? (
                 <div className="text-center py-10 bg-gray-50 rounded-lg">لا توجد جلسات محجوزة حالياً.</div>
             ) : (
                 sessions.map(session => (
                    <div key={session.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                       <div className="flex items-start gap-4">
                         <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                            <Clock size={24} />
                         </div>
                         <div>
                            <h3 className="font-bold text-gray-900">جلسة توجيه مع {user.role === 'mentor' ? session.mentee?.name : session.mentor?.name}</h3>
                            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                               <Calendar size={14} /> 
                               {new Date(session.datetime).toLocaleDateString('ar-EG')} - {new Date(session.datetime).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${session.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                               {session.status === 'pending' ? 'قيد الانتظار' : session.status}
                            </span>
                         </div>
                       </div>
                       
                       <div className="flex gap-3">
                          {session.link && (
                              <a href={session.link} target="_blank" rel="noreferrer" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-700">
                                 <Video size={16} /> دخول الجلسة
                              </a>
                          )}
                          {user.role === 'mentor' && session.status === 'pending' && (
                              <button 
                                onClick={async () => {
                                    await api.updateSessionStatus(session.id, 'confirmed');
                                    // simplistic reload
                                    window.location.reload();
                                }}
                                className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-100"
                              >
                                تأكيد
                              </button>
                          )}
                       </div>
                    </div>
                 ))
             )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="grid md:grid-cols-2 gap-8">
             {/* Tasks List */}
             <div className="space-y-4">
                <h3 className="font-bold text-gray-700 mb-2">قائمة المهام</h3>
                {tasks.length === 0 ? <p className="text-gray-400 text-sm">لا توجد مهام.</p> : (
                    tasks.map(task => (
                        <div key={task.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-3">
                            <button 
                                onClick={async () => {
                                    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                                    await api.updateTaskStatus(task.id, newStatus);
                                    window.location.reload(); 
                                }}
                                className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}
                            >
                                {task.status === 'completed' && <CheckSquare size={14} />}
                            </button>
                            <div>
                                <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</h4>
                                <p className="text-sm text-gray-500">{task.description}</p>
                            </div>
                        </div>
                    ))
                )}
             </div>

             {/* Create Task Form */}
             <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit">
                <h3 className="font-bold text-gray-900 mb-4">إضافة مهمة جديدة</h3>
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">عنوان المهمة</label>
                        <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">التفاصيل</label>
                        <textarea className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows={3} value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)}></textarea>
                    </div>
                    
                    {user.role === 'mentor' && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700">تعيين لمتدرب</label>
                           <select 
                             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                             value={selectedMenteeForTask}
                             onChange={e => setSelectedMenteeForTask(e.target.value)}
                           >
                              <option value="">اختر متدرب...</option>
                              {uniqueMentees.map(m => m && (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                           </select>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700">
                        إضافة المهمة
                    </button>
                </form>
             </div>
          </div>
        )}

        {/* Availability Tab (Mentor Only) */}
        {activeTab === 'availability' && user.role === 'mentor' && (
           <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-4">
                   <h3 className="font-bold text-gray-700">مواعيدك الحالية</h3>
                   {myAvailability.map(slot => (
                       <div key={slot.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between">
                           <span className="font-bold">{slot.day}</span>
                           <span className="text-gray-600">{slot.start_time} - {slot.end_time}</span>
                       </div>
                   ))}
               </div>
               
               <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit">
                  <h3 className="font-bold text-gray-900 mb-4">إضافة موعد جديد</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700">اليوم</label>
                          <select value={newDay} onChange={e => setNewDay(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                  <option key={d} value={d}>{d}</option>
                              ))}
                          </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700">من</label>
                              <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">إلى</label>
                              <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                          </div>
                      </div>
                      <button onClick={handleAddAvailability} className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 flex items-center justify-center gap-2">
                          <Plus size={18} /> إضافة
                      </button>
                  </div>
               </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
