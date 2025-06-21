import { config } from 'dotenv';
config();

import '@/ai/flows/yield-prediction.ts';
import '@/ai/flows/crop-recommendation.ts';
import '@/ai/flows/diagnose-crop-disease.ts';
import '@/ai/flows/predict-crop-price-flow.ts';
import '@/ai/flows/farming-calendar-flow.ts';
import '@/ai/flows/validate-search-topic-flow.ts';
