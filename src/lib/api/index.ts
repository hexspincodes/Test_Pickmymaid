import axios, { isAxiosError, type AxiosRequestConfig } from 'axios'
import type { FeaturedJob, ApiMaid, ApiBlog, ApiBlogDetail } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.backendpickmymaid.site/api'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Thrown when the request never reached the server — timeout, dropped
// connection, DNS failure, etc. Common on flaky mobile data networks.
export class NetworkError extends Error {
  constructor(message = 'Network error. Please check your connection and try again.') {
    super(message)
    this.name = 'NetworkError'
  }
}

const REQUEST_TIMEOUT_MS = 20000

// Every request goes straight to the live API — no Next.js fetch cache, no
// ISR. withCredentials keeps the session cookie flowing on both the client
// and (Next's Node runtime) the server.
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
})

async function requestOnce<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const res = await client.request<T>({ url: path, ...config })
    return res.data
  } catch (err) {
    if (isAxiosError(err)) {
      if (err.response) {
        const body = err.response.data as { message?: string } | undefined
        const message = body?.message ?? `API error: ${err.response.status}`
        throw new ApiError(message, err.response.status)
      }
      if (err.code === 'ECONNABORTED') {
        throw new NetworkError('Request timed out. Please check your connection and try again.')
      }
      throw new NetworkError()
    }
    throw err
  }
}

// Mobile data networks in the UAE frequently drop or stall individual
// requests. A network-level failure (not an HTTP error response) is
// retried once after a short delay before giving up.
async function request<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    return await requestOnce<T>(path, config)
  } catch (err) {
    if (err instanceof NetworkError) {
      await new Promise((r) => setTimeout(r, 1200))
      return await requestOnce<T>(path, config)
    }
    throw err
  }
}

export const api = {
  get: <T>(path: string, config?: AxiosRequestConfig) =>
    request<T>(path, { method: 'GET', ...config }),
  post: <T>(path: string, body: unknown, config?: AxiosRequestConfig) =>
    request<T>(path, { method: 'POST', data: body, ...config }),
}

export async function getFeaturedJobs(): Promise<{ data: FeaturedJob[] }> {
  return api.get<{ data: FeaturedJob[] }>('/v1/job/featured')
}

export interface SearchJobsParams {
  q?: string
  service?: string
  nationality?: string
  location?: string
  religion?: string
  language?: string
  page?: number
  limit?: number
}

export interface SearchJobsResponse {
  data: FeaturedJob[]
  total: number
  page: number
  limit: number
}

export async function searchJobs(params: SearchJobsParams): Promise<SearchJobsResponse> {
  const query = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '') query.set(key, String(val))
  }
  return api.get<SearchJobsResponse>(`/v1/job/search?${query.toString()}`)
}

export interface FindMaidsParams {
  page?: number
  option?: string
  location?: string
  country?: string
  availability?: string
  skills?: string
  ageFrom?: number
  ageTo?: number
  nationality?: string
  salary?: string
  salaryFrom?: number
  salaryTo?: number
  service?: string
  visa?: string
  religion?: string
  searchParams?: string
  sort?: string
}

export interface FindMaidsResponse {
  data: {
    maids: ApiMaid[]
    count: number
  }
}

export interface MaidDetailResponse {
  data: {
    jobApplication: ApiMaid
  }
}

export async function getMaid(id: string): Promise<MaidDetailResponse> {
  return api.post<MaidDetailResponse>(`/v1/job/id`, { id })
}

export interface WishlistResponse {
  data: { favorites: ApiMaid[] }
}

export async function getWishlist(userId: string): Promise<WishlistResponse> {
  return api.get<WishlistResponse>(`/v1/job/wishlist?user_id=${encodeURIComponent(userId)}`)
}

export interface RegisterBody {
  first_name: string
  last_name: string
  email: string
  password: string
  emirate_of_residence: string
  position_required: string
  phone?: string
}

export interface RegisterResponse {
  status: string
  statusCode: number
  message: string
}

// Registration no longer creates the account directly — it emails a 6-digit
// OTP to confirm the address. The account is only created once that OTP is
// confirmed via verifyRegistrationOtp.
export async function registerCustomer(body: RegisterBody): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/v1/auth/customer/register', body)
}

export interface VerifyRegistrationOtpBody {
  email: string
  otp: string
}

export interface VerifyRegistrationOtpResponse {
  status: string
  statusCode: number
  message: string
  data: {
    _id: string
    first_name: string
    email: string
    type: string
    profile: string
    accountId: string
  }
}

export async function verifyRegistrationOtp(body: VerifyRegistrationOtpBody): Promise<VerifyRegistrationOtpResponse> {
  return api.post<VerifyRegistrationOtpResponse>('/v1/auth/customer/verify-otp', body)
}

export interface VerifyAuthUser {
  _id: string
  user_id: string
  first_name: string
  last_name?: string
  email: string
  phone: string
  profile: string
  is_blocked: boolean
  createdAt: string
}

export interface VerifyAuthResponse {
  status: string
  statusCode: number
  message: string
  data: { user: VerifyAuthUser; message: string }
}

export interface LoginBody { email: string; password: string }
export interface LoginResponse {
  status: string
  statusCode: number
  message: string
  data: { user_id: string; name?: string }
}

export async function loginCustomer(body: LoginBody): Promise<LoginResponse> {
  return api.post<LoginResponse>('/v2/auth/local', body)
}

export async function verifyAuth(): Promise<VerifyAuthResponse> {
  return request<VerifyAuthResponse>('/v2/auth/login/success')
}

export interface ForgotPasswordBody {
  email: string
}

export async function forgotPassword(body: ForgotPasswordBody): Promise<void> {
  await api.post<unknown>('/v1/auth/customer/forget-password', body)
}

export interface ResetPasswordBody {
  password: string
  confirm_password: string
}

export async function resetPassword(token: string, body: ResetPasswordBody): Promise<void> {
  await request<unknown>('/v1/auth/customer/reset-password', {
    method: 'POST',
    headers: { Authorization: token },
    data: body,
  })
}

export async function logoutUser(): Promise<void> {
  await request<unknown>('/v2/auth/logout', { method: 'GET' })
}

export interface ToggleWishlistBody {
  maidId: string
  user_id: string
}

export interface ToggleWishlistResponse {
  status: string
  message: string
}

export async function toggleWishlist(body: ToggleWishlistBody): Promise<ToggleWishlistResponse> {
  return api.post<ToggleWishlistResponse>('/v1/job/toggle-wishlist', body)
}

export interface ContactBody {
  name: string
  email: string
  subject: string
  message: string
  mobile: string
}

export async function createContact(body: ContactBody): Promise<void> {
  await api.post<unknown>('/v1/contact/', body)
}

export interface CreatePaymentResponse {
  status: string
  statusCode: number
  message: string
  data: { ref: string; payment_url: string }
}

export async function createPayment(type: 0 | 1 | 2): Promise<CreatePaymentResponse> {
  return api.post<CreatePaymentResponse>('/v2/payment/create-payment', { type })
}

export interface GetBlogsResponse {
  status: string
  statusCode: number
  message: string
  data: {
    blogs: ApiBlog[],
    total_counts: number
  }
}

export async function getBlogs(page: number = 1): Promise<GetBlogsResponse> {
  return api.get<GetBlogsResponse>(`/v1/blog/page/${page}`)
}

export interface GetBlogDetailResponse {
  status: string
  statusCode: number
  message: string
  data: { blog: ApiBlogDetail }
}

export async function getBlogBySlug(slug: string): Promise<GetBlogDetailResponse> {
  return api.get<GetBlogDetailResponse>(`/v1/blog/id/${slug}`)
}

export interface PaymentDetailsResponse {
  status: string
  statusCode: number
  message: string
  data: {
    user: {
      status: number       // 1 = active subscription
      type: 0 | 1 | 2     // 0 = basic, 1 = standard, 2 = premium
    }
  }
}

export async function getPaymentDetails(): Promise<PaymentDetailsResponse> {
  return api.get<PaymentDetailsResponse>('/v1/payment/payment-details')
}

export interface AcknowledgePaymentResponse {
  status: string
  statusCode: number
  message: string
  data: {
    status: 0 | 1 | 2
    type: 0 | 1 | 2
    expiryDate: string
    ref: string
    paymentDate: string
  }
}

export async function acknowledgePayment(ref: string): Promise<AcknowledgePaymentResponse> {
  return api.post<AcknowledgePaymentResponse>(`/v2/payment/acknowledge/${ref}`, {})
}

export function trackCategoryUsage(category: string, maidId: string, userId?: string | null): void {
  const body: { category: string; maid_id: string; user_id?: string } = { category, maid_id: maidId }
  if (userId) body.user_id = userId
  api.post<unknown>('/v1/analytics/category-usage', body).catch(() => {})
}

export async function findMaids(params: FindMaidsParams = {}): Promise<FindMaidsResponse> {
  const { page = 1, ...rest } = params
  const query = new URLSearchParams()
  for (const [key, val] of Object.entries(rest)) {
    if (val !== undefined && val !== '') query.set(key, String(val))
  }
  const qs = query.toString()
  return api.get<FindMaidsResponse>(`/v2/maids/find/${page}${qs ? `?${qs}` : ''}`)
}
