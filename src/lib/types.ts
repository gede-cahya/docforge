export type ProviderType = 'ollama' | 'openai-compatible';

export interface LLMProvider {
  id: string;
  type: ProviderType;
  name: string;
  baseUrl: string;
  apiKey?: string;
  model: string;
}

export type DocumentType = 'prd' | 'psd';

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  inputs: Record<string, string>;
  providerId?: string;
}

export interface FormField {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
}
