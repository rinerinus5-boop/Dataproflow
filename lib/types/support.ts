export interface SupportConversation {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  status: 'active' | 'waiting_for_human' | 'with_human' | 'ended' | 'resolved';
  assigned_agent_id: string | null;
  started_at: string;
  ended_at: string | null;
  last_message_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'ai' | 'agent' | 'system';
  sender_id: string | null;
  content: string;
  message_type: 'text' | 'file' | 'form' | 'booking' | 'rating';
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  conversation_id: string | null;
  user_id: string | null;
  ticket_number: string;
  subject: string;
  help_type: string;
  destination: string | null;
  data_source: string | null;
  user_name: string;
  user_email: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed';
  assigned_agent_id: string | null;
  meeting_link: string | null;
  meeting_scheduled_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

export interface SupportRating {
  id: string;
  conversation_id: string;
  user_id: string | null;
  rating: number;
  feedback: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  metadata?: Record<string, unknown>;
}

export interface EscalationFormData {
  helpType: string;
  destination: string;
  dataSource: string;
  name: string;
  email: string;
}

export const HELP_TYPES = [
  'Help with the queries',
  'Data is missing or incorrect',
  'Manage subscription or users',
  'Manage billing or billing',
  'Technical issue',
  'Feature request',
  'Other',
] as const;

export const DESTINATIONS = [
  'Not related to any destination',
  'Multiple destinations',
  'Google Sheets',
  'Looker Studio',
  'Power BI',
  'Excel',
] as const;

export const DATA_SOURCES = [
  'Not related to any data source',
  'Multiple data sources',
  'Instagram',
  'Facebook',
  'TikTok',
  'Google Analytics',
  'Google Ads',
] as const;

export const AI_CAPABILITIES = [
  'Connecting and authenticating data sources',
  'Required permissions and API keys',
  'Setting up and running queries',
  'Troubleshooting connection or data issues',
  'Using DataProFlow with Google Sheets, Looker Studio, and more',
  'Managing accounts, tokens, and report templates',
  'Refreshing account data and reauthenticating connections',
];
