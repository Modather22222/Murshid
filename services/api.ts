import { supabase } from '../lib/supabase';
import { User, Session, Task, MentorAvailability } from '../types';

export const api = {
  // Users
  getMentors: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'mentor');
    if (error) throw error;
    return data as User[];
  },

  getUser: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as User;
  },

  updateProfile: async (id: string, updates: Partial<User>) => {
    const { error } = await supabase
      .from('users')
      .upsert({ id, ...updates });
    if (error) throw error;
  },

  // Availability
  getAvailability: async (mentorId: string) => {
    const { data, error } = await supabase
      .from('mentors_availability')
      .select('*')
      .eq('mentor_id', mentorId);
    if (error) throw error;
    return data as MentorAvailability[];
  },

  addAvailability: async (availability: Partial<MentorAvailability>) => {
     const { error } = await supabase
      .from('mentors_availability')
      .insert(availability);
    if (error) throw error;
  },

  // Sessions
  bookSession: async (session: Partial<Session>) => {
    const { error } = await supabase
      .from('sessions')
      .insert(session);
    if (error) throw error;
  },

  getSessions: async (userId: string, role: 'mentor' | 'mentee') => {
    const column = role === 'mentor' ? 'mentor_id' : 'mentee_id';
    const otherRelation = role === 'mentor' ? 'mentee:mentee_id(*)' : 'mentor:mentor_id(*)';

    const { data, error } = await supabase
      .from('sessions')
      .select(`*, ${otherRelation}`)
      .eq(column, userId)
      .order('datetime', { ascending: true });
    
    if (error) throw error;
    return data as Session[];
  },

  updateSessionStatus: async (sessionId: string, status: Session['status']) => {
    const { error } = await supabase
      .from('sessions')
      .update({ status })
      .eq('id', sessionId);
    if (error) throw error;
  },

  // Tasks
  getTasks: async (userId: string) => {
    // Ideally we filter by sessions related to the user, but for MVP let's get tasks assigned to user or created by user if mentor
    // Simplified: Tasks assigned_to the user (mentee) or tasks for sessions where user is mentor
    // For MVP efficiency: Just get tasks assigned to me
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId);
    if (error) throw error;
    return data as Task[];
  },

  createTask: async (task: Partial<Task>) => {
    const { error } = await supabase
      .from('tasks')
      .insert(task);
    if (error) throw error;
  },
  
  updateTaskStatus: async (taskId: string, status: Task['status']) => {
      const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);
    if (error) throw error;
  }
};
