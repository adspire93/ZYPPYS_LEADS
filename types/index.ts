export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  industry: string;
  companySize: string;
  location: string;
  website: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
  estimatedValue: number;
  requirements: string;
}

export interface Comment {
  id: string;
  leadId: string;
  text: string;
  timestamp: number;
  author: string;
}

export interface LeadStatus {
  leadId: string;
  status: 'new' | 'contacted' | 'in_progress' | 'won' | 'lost';
  lastUpdated: number;
}

export interface LeadData extends Lead {
  status: LeadStatus['status'];
  comments: Comment[];
}
