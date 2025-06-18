import { config } from 'dotenv';
config();

import '@/ai/flows/yield-prediction.ts';
import '@/ai/flows/crop-recommendation.ts';
import '@/ai/flows/diagnose-crop-disease.ts';
