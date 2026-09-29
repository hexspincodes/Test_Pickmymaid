export interface Maid {
  id: string
  name: string
  photo: string
  nationality: string
  languages: string[]
  skills: string[]
  experience: number
  rating: number
  reviewCount: number
  phoneNumber?: string
  isVerified: boolean
  availability: 'available' | 'busy' | 'unavailable'
  hourlyRate?: number
  location: string
}

export interface SearchFilters {
  location: string
  type: 'maid' | 'nanny' | 'cleaner' | 'cook' | ''
  language: string
  keywords?: string
}

export interface User {
  id: string
  email: string
  name: string
  isSubscribed: boolean
  subscriptionTier?: 'basic' | 'standard' | 'premium' | 'starter'
  profile?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface Salary {
  from: number,
  to: number
}

export interface Experience {
  experiance: number;
}

export interface JobLanguage {
  id: string
  name: string
  read: number
  write: number
  speak: number
  _id: string
}

export interface ApiMaidEmploymentHistory {
  job_description: string
  title: string
  experiance: number
  reason_leaving: string
  location: string
  _id: string
}

export interface ApiMaid {
  _id: string
  ref_number: string
  name: string
  profile: string | null
  age: number
  nationality: string
  salary: Salary
  service: string
  visa_status: string
  availability: boolean
  language: JobLanguage[]
  option: string
  employmentHistory: ApiMaidEmploymentHistory[]
  references: boolean
  date: string
  is_in_wishlist: boolean
  /* Fields present in detail responses */
  marital_status?: string
  location?: string
  current_location?: string
  religion?: string
  skills?: string[]
  education?: string
  notes?: string
  available_from?: string
  visa_expire?: string
  day_of?: string
  youtube_link?: string
  status?: number
  word_file?: string[]
  /* Contact fields — only present when request is authenticated + subscribed */
  phone?: string
  whatsapp?: string
  botim?: string
  email?: string
}

export interface ApiBlog {
  _id: string
  slug: string
  title: string
  description: string
  thumbnail: string
  content: string
  meta_title: string
  meta_description: string
  editedAt: string
}

export interface ApiBlogDetail extends ApiBlog {
  meta_keywords?: string
  og_title?: string
  og_description?: string
  canonical_url?: string
  likes: number
  isUserLiked: boolean
  comments: unknown[]
}

export interface FeaturedJob {
  _id: number | string
  name: string
  profile?: string | null
  nationality?: string
  country?: string
  employmentHistory: Experience[]
  salary: Salary
  option: string
  available_from: string
  is_new?: boolean
  // Fields present in full job objects
  service?: string
  religion?: string
  location?: string
  current_location?: string
  language?: JobLanguage[]
  skills?: string[]
  visa_status?: string
  age?: number
  ref_number?: number
  is_in_wishlist?: boolean;
  date?: string;
  youtube_link?: string;
}
