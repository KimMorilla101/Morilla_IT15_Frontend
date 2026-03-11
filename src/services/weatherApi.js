const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHER_ICON_BASE_URL = 'https://openweathermap.org/img/wn';
const OPENMETEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const OPENMETEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OPENMETEO_REVERSE_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/reverse';
const WEATHER_TIMEOUT_MS = 12000;
const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const HAS_OPENWEATHER_KEY = Boolean(WEATHER_API_KEY);

export class WeatherApiError extends Error {
  constructor(message, status = 500, code = 'weather_api_error', retryAfter = null) {
    super(message);
    this.name = 'WeatherApiError';
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

const withTimeout = async (promise, timeoutMs) => {
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new WeatherApiError('Weather request timed out. Please retry.', 408, 'timeout'));
    }, timeoutMs);

    promise.finally(() => clearTimeout(timeoutId));
  });

  return Promise.race([promise, timeoutPromise]);
};

const resolveVisualTypeFromOpenWeatherCode = (weatherCode) => {
  if (weatherCode >= 200 && weatherCode < 300) return 'storm';
  if (weatherCode >= 300 && weatherCode < 600) return 'rain';
  if (weatherCode >= 600 && weatherCode < 700) return 'snow';
  if (weatherCode >= 700 && weatherCode < 800) return 'mist';
  if (weatherCode === 800) return 'sunny';
  return 'cloudy';
};

const mapOpenMeteoCode = (weatherCode, isDaytime = true) => {
  const code = Number(weatherCode);
  const clearIcon = isDaytime ? '01d' : '01n';
  const fewCloudsIcon = isDaytime ? '02d' : '02n';

  if (code === 0) {
    return {
      condition: 'Clear sky',
      icon: clearIcon,
      visualType: 'sunny',
    };
  }

  if (code === 1) {
    return {
      condition: 'Mainly clear',
      icon: fewCloudsIcon,
      visualType: 'cloudy',
    };
  }

  if (code === 2) {
    return {
      condition: 'Partly cloudy',
      icon: '03d',
      visualType: 'cloudy',
    };
  }

  if (code === 3) {
    return {
      condition: 'Overcast',
      icon: '04d',
      visualType: 'cloudy',
    };
  }

  if (code === 45 || code === 48) {
    return {
      condition: 'Foggy',
      icon: '50d',
      visualType: 'mist',
    };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      condition: 'Drizzle',
      icon: '09d',
      visualType: 'rain',
    };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return {
      condition: 'Rain showers',
      icon: '10d',
      visualType: 'rain',
    };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      condition: 'Snow',
      icon: '13d',
      visualType: 'snow',
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      condition: 'Thunderstorm',
      icon: '11d',
      visualType: 'storm',
    };
  }

  return {
    condition: 'Cloudy',
    icon: '03d',
    visualType: 'cloudy',
  };
};

const toForecastDay = (entry) => {
  const date = new Date(entry.dt * 1000);
  const weatherInfo = entry.weather?.[0] || {};

  return {
    dateISO: date.toISOString(),
    dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
    dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    minTemp: Math.round(entry.main?.temp_min || 0),
    maxTemp: Math.round(entry.main?.temp_max || 0),
    condition: weatherInfo.description || 'No description',
    icon: weatherInfo.icon || '01d',
    weatherCode: weatherInfo.id || 800,
    visualType: resolveVisualTypeFromOpenWeatherCode(weatherInfo.id || 800),
  };
};

const normalizeForecast = (forecastList = []) => {
  const groupedByDate = forecastList.reduce((accumulator, item) => {
    const [dateKey, timeKey] = item.dt_txt.split(' ');
    const hour = Number(timeKey.slice(0, 2));
    const selected = accumulator.get(dateKey);

    if (!selected) {
      accumulator.set(dateKey, item);
      return accumulator;
    }

    const selectedHour = Number(selected.dt_txt.split(' ')[1].slice(0, 2));
    const selectedDistance = Math.abs(selectedHour - 12);
    const currentDistance = Math.abs(hour - 12);

    if (currentDistance < selectedDistance) {
      accumulator.set(dateKey, item);
    }

    return accumulator;
  }, new Map());

  return Array.from(groupedByDate.values()).slice(0, 5).map(toForecastDay);
};

const normalizeCurrentWeather = (payload) => {
  const weatherInfo = payload.weather?.[0] || {};

  return {
    city: payload.name,
    country: payload.sys?.country || '',
    temperature: Math.round(payload.main?.temp || 0),
    humidity: payload.main?.humidity || 0,
    windSpeed: Math.round((payload.wind?.speed || 0) * 3.6),
    condition: weatherInfo.description || 'No description',
    icon: weatherInfo.icon || '01d',
    weatherCode: weatherInfo.id || 800,
    visualType: resolveVisualTypeFromOpenWeatherCode(weatherInfo.id || 800),
    observedAtISO: payload.dt ? new Date(payload.dt * 1000).toISOString() : new Date().toISOString(),
  };
};

const parseWeatherResponse = async (response, fallbackMessage = 'Unable to fetch weather data.') => {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get('Retry-After')) || null;
      throw new WeatherApiError(
        'Weather service rate limit reached. Please try again shortly.',
        429,
        'rate_limited',
        retryAfter,
      );
    }

    throw new WeatherApiError(
      payload?.message || payload?.reason || fallbackMessage,
      response.status,
      'request_failed',
    );
  }

  return payload || {};
};

const fetchWeatherRequest = async (url, fallbackMessage) => {
  const request = fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const response = await withTimeout(request, WEATHER_TIMEOUT_MS);
  return parseWeatherResponse(response, fallbackMessage);
};

const fetchOpenWeatherEndpoint = async (endpoint, params) => {
  const url = new URL(`${OPENWEATHER_BASE_URL}/${endpoint}`);
  Object.entries({ ...params, appid: WEATHER_API_KEY, units: 'metric' }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return fetchWeatherRequest(url.toString(), 'Unable to fetch weather data from OpenWeather.');
};

const fetchOpenWeatherBundle = async (params) => {
  const [currentWeather, forecastWeather] = await Promise.all([
    fetchOpenWeatherEndpoint('weather', params),
    fetchOpenWeatherEndpoint('forecast', params),
  ]);

  return {
    current: normalizeCurrentWeather(currentWeather),
    forecast: normalizeForecast(forecastWeather.list),
  };
};

const fetchOpenMeteoLocationByCity = async (cityName) => {
  const url = new URL(OPENMETEO_GEOCODING_URL);
  url.searchParams.set('name', cityName);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const payload = await fetchWeatherRequest(url.toString(), 'Unable to resolve city location for weather.');
  const bestMatch = payload.results?.[0];

  if (!bestMatch) {
    throw new WeatherApiError(`No weather location found for "${cityName}".`, 404, 'location_not_found');
  }

  return {
    latitude: bestMatch.latitude,
    longitude: bestMatch.longitude,
    city: bestMatch.name,
    country: bestMatch.country_code || bestMatch.country || '',
  };
};

const fetchOpenMeteoLocationByCoords = async (latitude, longitude) => {
  const url = new URL(OPENMETEO_REVERSE_GEOCODING_URL);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  try {
    const payload = await fetchWeatherRequest(url.toString(), 'Unable to determine city from your location.');
    const bestMatch = payload.results?.[0];

    if (!bestMatch) {
      return {
        city: 'Current Location',
        country: '',
      };
    }

    return {
      city: bestMatch.name || 'Current Location',
      country: bestMatch.country_code || bestMatch.country || '',
    };
  } catch {
    return {
      city: 'Current Location',
      country: '',
    };
  }
};

const fetchOpenMeteoForecast = async (latitude, longitude) => {
  const url = new URL(OPENMETEO_FORECAST_URL);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
  );
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min');
  url.searchParams.set('forecast_days', '5');
  url.searchParams.set('timezone', 'auto');

  return fetchWeatherRequest(url.toString(), 'Unable to fetch weather data from Open-Meteo.');
};

const normalizeOpenMeteoBundle = (payload, locationMeta) => {
  const current = payload.current || {};
  const daily = payload.daily || {};
  const dates = daily.time || [];
  const maxTemps = daily.temperature_2m_max || [];
  const minTemps = daily.temperature_2m_min || [];
  const weatherCodes = daily.weather_code || [];

  const currentMeta = mapOpenMeteoCode(current.weather_code, current.is_day !== 0);

  const forecast = dates.slice(0, 5).map((dateString, index) => {
    const dailyMeta = mapOpenMeteoCode(weatherCodes[index], true);
    const date = new Date(`${dateString}T12:00:00`);

    return {
      dateISO: date.toISOString(),
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minTemp: Math.round(minTemps[index] || 0),
      maxTemp: Math.round(maxTemps[index] || 0),
      condition: dailyMeta.condition,
      icon: dailyMeta.icon,
      weatherCode: Number(weatherCodes[index] || 0),
      visualType: dailyMeta.visualType,
    };
  });

  const observedDate = current.time ? new Date(current.time) : new Date();

  return {
    current: {
      city: locationMeta.city || 'Selected Location',
      country: locationMeta.country || '',
      temperature: Math.round(current.temperature_2m || 0),
      humidity: Math.round(current.relative_humidity_2m || 0),
      windSpeed: Math.round(current.wind_speed_10m || 0),
      condition: currentMeta.condition,
      icon: currentMeta.icon,
      weatherCode: Number(current.weather_code || 0),
      visualType: currentMeta.visualType,
      observedAtISO: observedDate.toISOString(),
    },
    forecast,
  };
};

const shouldFallbackToOpenMeteo = (error) => {
  if (!(error instanceof WeatherApiError)) {
    return true;
  }

  return error.code !== 'validation';
};

const fetchOpenMeteoByCity = async (cityName) => {
  const locationMeta = await fetchOpenMeteoLocationByCity(cityName);
  const payload = await fetchOpenMeteoForecast(locationMeta.latitude, locationMeta.longitude);
  return normalizeOpenMeteoBundle(payload, locationMeta);
};

const fetchOpenMeteoByCoords = async (latitude, longitude) => {
  const [locationMeta, payload] = await Promise.all([
    fetchOpenMeteoLocationByCoords(latitude, longitude),
    fetchOpenMeteoForecast(latitude, longitude),
  ]);

  return normalizeOpenMeteoBundle(payload, locationMeta);
};

export const getWeatherIconUrl = (iconCode) => {
  if (!iconCode) {
    return `${OPENWEATHER_ICON_BASE_URL}/01d@2x.png`;
  }

  if (iconCode.startsWith('http://') || iconCode.startsWith('https://') || iconCode.startsWith('data:')) {
    return iconCode;
  }

  return `${OPENWEATHER_ICON_BASE_URL}/${iconCode}@2x.png`;
};

export const fetchWeatherByCity = async (cityName) => {
  const safeCityName = cityName?.trim();

  if (!safeCityName) {
    throw new WeatherApiError('Please enter a city name.', 400, 'validation');
  }

  if (HAS_OPENWEATHER_KEY) {
    try {
      return await fetchOpenWeatherBundle({ q: safeCityName });
    } catch (error) {
      if (!shouldFallbackToOpenMeteo(error)) {
        throw error;
      }
    }
  }

  return fetchOpenMeteoByCity(safeCityName);
};

export const fetchWeatherByCoords = async (latitude, longitude) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new WeatherApiError('Unable to determine your location coordinates.', 400, 'validation');
  }

  if (HAS_OPENWEATHER_KEY) {
    try {
      return await fetchOpenWeatherBundle({ lat: latitude, lon: longitude });
    } catch (error) {
      if (!shouldFallbackToOpenMeteo(error)) {
        throw error;
      }
    }
  }

  return fetchOpenMeteoByCoords(latitude, longitude);
};
