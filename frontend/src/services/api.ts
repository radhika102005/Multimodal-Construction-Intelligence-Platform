import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  HealthStatus,
  DashboardSummary,
  SafetyAnalysisResponse,
  CrackAnalysisResponse,
  ValuationRequest,
  ValuationResponse,
  PlanningRequest,
  PlanningResponse,
  ChatRequest,
  ChatResponse,
  WeatherResponse,
  KnowledgeRequest,
  KnowledgeResponse
} from '../types';

// Resolve API base URL from environment or fallback to current origin
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

// Create centralized Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000, // 50 seconds for AI multimodal / cold starts
  headers: {
    'Accept': 'application/json',
  }
});

// Listener for backend connectivity status (useful for Render free tier sleep/wake up)
type ConnectivityListener = (isAwake: boolean, message?: string) => void;
const listeners: ConnectivityListener[] = [];

export const registerConnectivityListener = (fn: ConnectivityListener) => {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

const notifyConnectivity = (isAwake: boolean, message?: string) => {
  listeners.forEach(fn => fn(isAwake, message));
};

// Response Interceptors
apiClient.interceptors.response.use(
  (response) => {
    notifyConnectivity(true);
    return response;
  },
  (error: AxiosError) => {
    if (!error.response) {
      // Network error, likely backend sleeping or cold-start
      notifyConnectivity(
        false,
        "Backend server is waking up or temporarily unreachable (Render free instance may spin down after inactivity). Retrying..."
      );
    } else if (error.response.status >= 500) {
      notifyConnectivity(
        false,
        `Backend service responded with HTTP ${error.response.status}. Check server logs.`
      );
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // System Health
  async getHealth(): Promise<HealthStatus> {
    const res = await apiClient.get<HealthStatus>('/health');
    return res.data;
  },

  // Module 1: Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await apiClient.get<DashboardSummary>('/api/v1/dashboard/summary');
    return res.data;
  },

  // Module 2: Site Safety Monitoring
  async analyzeSafetyImage(
    file: File,
    siteName?: string,
    inspectionType?: string
  ): Promise<SafetyAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (siteName) formData.append('site_name', siteName);
    if (inspectionType) formData.append('inspection_type', inspectionType);

    const res = await apiClient.post<SafetyAnalysisResponse>('/api/v1/safety/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Module 3: Crack Detection & Structural Analysis
  async analyzeStructuralCrack(
    file: File,
    elementType: string,
    ageYears?: number,
    notes?: string
  ): Promise<CrackAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('element_type', elementType);
    if (ageYears !== undefined && ageYears !== null) formData.append('age_years', ageYears.toString());
    if (notes) formData.append('notes', notes);

    const res = await apiClient.post<CrackAnalysisResponse>('/api/v1/cracks/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Module 4: Real Estate Valuation
  async estimateValuation(data: ValuationRequest): Promise<ValuationResponse> {
    const res = await apiClient.post<ValuationResponse>('/api/v1/valuation/estimate', data);
    return res.data;
  },

  // Module 5: Construction Planning
  async generateProjectPlan(data: PlanningRequest): Promise<PlanningResponse> {
    const res = await apiClient.post<PlanningResponse>('/api/v1/planning/generate', data);
    return res.data;
  },

  // Module 6: Daily Site Assistant
  async chatAssistant(data: ChatRequest): Promise<ChatResponse> {
    const res = await apiClient.post<ChatResponse>('/api/v1/assistant/chat', data);
    return res.data;
  },

  // Module 7: Weather Advisory
  async getWeatherAdvisory(city: string): Promise<WeatherResponse> {
    const res = await apiClient.get<WeatherResponse>('/api/v1/weather', {
      params: { city }
    });
    return res.data;
  },

  // Module 8: Knowledge Assistant
  async askKnowledge(data: KnowledgeRequest): Promise<KnowledgeResponse> {
    const res = await apiClient.post<KnowledgeResponse>('/api/v1/knowledge/ask', data);
    return res.data;
  }
};
