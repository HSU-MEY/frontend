// api/weather.service.ts
import { OPEN_WEATHER_API_KEY } from '@/src/env';

export async function fetchWeather(lat: number, lon: number): Promise<any> {
    if (!OPEN_WEATHER_API_KEY) {
        console.error("OpenWeather API Key is missing.");
        throw new Error("No API Key");
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric&lang=kr`;
    //console.log("Requesting Weather API:", url);

    try {
        const res = await fetch(url);
        //console.log("Weather API Response Status:", res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Weather API Error Response Body:", errorText);
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        //console.log("Weather API Success Response Body:", data);
        return data;
    } catch (error) {
        console.error("Fetch failed for Weather API:", error);
        throw error;
    }
}
  
  
  
  //https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}