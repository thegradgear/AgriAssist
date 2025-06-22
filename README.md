# AgriAssist - Your AI Farming Companion

This is a Next.js application built with Firebase Studio, designed to assist Indian farmers with AI-powered tools and real-time data.

## Features

- **Dashboard:** A central hub to access all features.
- **Yield Prediction:** Forecast crop yields using AI.
- **Crop Recommendation:** Get tailored crop suggestions based on soil and weather data.
- **Price Prediction:** Estimate future market prices for your crops.
- **Crop Health Analysis:** Detect crop diseases and identify pests/weeds from images.
- **Farming Calendar:** Generate a personalized schedule for farming activities.
- **Irrigation Management:** Receive optimal watering schedules.
- **Cost Calculator:** Estimate farming costs and potential profits.
- **Weather Alerts:** Get current weather information and alerts.
- **Best Practices:** Explore agricultural articles and news.

## Getting Started

To get started, explore the application structure, starting with `src/app/page.tsx` for the marketing page and `src/app/(app)/dashboard/page.tsx` for the main application dashboard.

### Environment Variables

To run this project and use all its features, you must create a file named `.env` in the `src` directory of the project. Copy the contents of `src/.env` into this new file and fill in the required API keys and configuration values.

```
src/
├── .env          <-- Create and fill this file
└── (other folders)
```

You will need to acquire API keys from the following services:

1.  **Firebase:**
    - Go to your Firebase Project Settings.
    - Under the "General" tab, find your web app configuration.
    - Copy the `apiKey`, `authDomain`, `projectId`, etc., into the `NEXT_PUBLIC_FIREBASE_*` variables in `src/.env`.

2.  **NewsAPI (for Articles & News):**
    - Go to [https://newsapi.org](https://newsapi.org) and register for a free developer account.
    - Your API key will be available on your account dashboard.
    - Copy this key to the `NEWSAPI_KEY` variable.

3.  **OpenWeatherMap (for Weather):**
    - Go to [https://openweathermap.org](https://openweathermap.org) and create a free account.
    - Navigate to the "API keys" tab in your account dashboard to find your key.
    - Copy this key to the `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY` variable.

After adding these keys to your `src/.env` file, restart your development server for the changes to take effect.
