export interface Garment {
  id: string;
  imageUrl: string;
  name: string;
  category: 'top' | 'bottom' | 'full-body' | 'accessory';
}

export enum AppState {
  CAPTURE = 'CAPTURE',
  SELECT_GARMENT = 'SELECT_GARMENT',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

export interface ComparisonView {
  originalUser: string;
  garment: string;
  generated: string;
}