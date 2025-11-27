export type Role = 'mentor' | 'mentee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio?: string;
  skills?: string[]; // stored as text[] in DB
  avatar?: string;
}

export interface MentorAvailability {
  id: string;
  mentor_id: string;
  day: string; // e.g., "Monday"
  start_time: string; // "14:00"
  end_time: string; // "15:00"
}

export interface Session {
  id: string;
  mentor_id: string;
  mentee_id: string;
  datetime: string; // ISO string
  link?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  mentor?: User; // Join
  mentee?: User; // Join
}

export interface Task {
  id: string;
  session_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to: string; // user id
}

export interface Review {
  id: string;
  mentor_id: string;
  mentee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}
