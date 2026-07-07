export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  bio?: string;
  city?: string;
  state?: string;
  avatar_url?: string;
  interests: string[];
  relationship_goal?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  user_one: string;
  user_two: string;
  created_at: string;
}
