// api/weather.service.ts
import { OPEN_WEATHER_API_KEY } from '@/src/env';

export async function fetchWeather(lat: number, lon: number): Promise<any> {
    if (!OPEN_WEATHER_API_KEY) throw new Error("No API Key");
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric&lang=kr`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return res.json();
}
  
  
  
  //https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}