import { useCallback, useEffect, useMemo, useState } from 'react';
import { Droplets, LocateFixed, RefreshCcw, Search, Thermometer, Wind } from 'lucide-react';
import { fetchWeatherByCity, fetchWeatherByCoords, getWeatherIconUrl } from '../../services/weatherApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ForecastDisplay from './ForecastDisplay';

const DEFAULT_CITY = import.meta.env.VITE_DEFAULT_WEATHER_CITY || 'Manila';

const formatCondition = (conditionText) => {
  if (!conditionText) return 'Unknown';

  return conditionText
    .split(' ')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
};

const WeatherWidget = () => {
  const [searchText, setSearchText] = useState(DEFAULT_CITY);
  const [lastQuery, setLastQuery] = useState(DEFAULT_CITY);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleRequestError = useCallback((requestError) => {
    const fallbackMessage = 'Unable to load weather data right now.';
    const incomingMessage = requestError?.message || fallbackMessage;

    setError(incomingMessage);

    if (requestError?.code === 'rate_limited') {
      if (requestError.retryAfter) {
        setNotice(`API limit reached. Try again in roughly ${requestError.retryAfter} seconds.`);
      } else {
        setNotice('API limit reached. Please retry shortly.');
      }
    } else {
      setNotice('');
    }
  }, []);

  const loadWeatherByCity = useCallback(
    async (cityName) => {
      const normalizedCity = cityName.trim();

      if (!normalizedCity) {
        setError('Please enter a valid city name.');
        return;
      }

      setIsLoading(true);
      setError('');
      setNotice('');

      try {
        const responseData = await fetchWeatherByCity(normalizedCity);
        setWeatherData(responseData);
        setSearchText(responseData.current.city);
        setLastQuery(normalizedCity);
      } catch (requestError) {
        handleRequestError(requestError);
      } finally {
        setIsLoading(false);
      }
    },
    [handleRequestError],
  );

  useEffect(() => {
    loadWeatherByCity(DEFAULT_CITY);
  }, [loadWeatherByCity]);

  const handleSubmit = (event) => {
    event.preventDefault();
    loadWeatherByCity(searchText);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setNotice('Try searching by city name instead.');
      return;
    }

    setError('');
    setNotice('');
    setIsGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setIsLoading(true);

        try {
          const responseData = await fetchWeatherByCoords(coords.latitude, coords.longitude);
          setWeatherData(responseData);
          setSearchText(responseData.current.city);
          setLastQuery(responseData.current.city);
        } catch (requestError) {
          handleRequestError(requestError);
        } finally {
          setIsGeoLoading(false);
          setIsLoading(false);
        }
      },
      (locationError) => {
        setIsGeoLoading(false);
        setError('Unable to access your location.');
        setNotice(locationError.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  const weatherThemeClass = useMemo(() => {
    const visualType = weatherData?.current?.visualType || 'cloudy';
    return `weather-widget weather-${visualType}`;
  }, [weatherData]);

  return (
    <section className={weatherThemeClass}>
      <div className="weather-widget-header">
        <h2>Weather Forecast</h2>
        <button
          type="button"
          className="weather-refresh-btn"
          onClick={() => loadWeatherByCity(lastQuery || searchText || DEFAULT_CITY)}
          disabled={isLoading || isGeoLoading}
          aria-label="Refresh weather"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      <form className="weather-search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search city"
          aria-label="Search city weather"
        />

        <button type="submit" className="weather-action-btn" disabled={isLoading}>
          <Search size={16} />
        </button>

        <button
          type="button"
          className="weather-action-btn"
          onClick={handleUseLocation}
          disabled={isGeoLoading}
          aria-label="Use current location"
        >
          <LocateFixed size={16} />
        </button>
      </form>

      {error ? (
        <div className="weather-inline-error" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      {notice ? <p className="weather-helper-text">{notice}</p> : null}

      {isLoading ? (
        <LoadingSpinner label="Loading weather details..." />
      ) : weatherData ? (
        <>
          <div className="weather-current">
            <div className="weather-main">
              <img
                src={getWeatherIconUrl(weatherData.current.icon)}
                alt={weatherData.current.condition}
                width="72"
                height="72"
              />
              <div>
                <h3>
                  {weatherData.current.city}
                  {weatherData.current.country ? `, ${weatherData.current.country}` : ''}
                </h3>
                <p className="weather-condition">{formatCondition(weatherData.current.condition)}</p>
              </div>
            </div>

            <div className="weather-temperature">
              <Thermometer size={20} />
              <strong>{weatherData.current.temperature}°C</strong>
            </div>
          </div>

          <div className="weather-metrics">
            <div>
              <Droplets size={16} />
              <span>Humidity: {weatherData.current.humidity}%</span>
            </div>
            <div>
              <Wind size={16} />
              <span>Wind: {weatherData.current.windSpeed} km/h</span>
            </div>
          </div>

          <ForecastDisplay forecast={weatherData.forecast} isLoading={isLoading} />
        </>
      ) : (
        <p className="weather-helper-text">No weather data available for this query.</p>
      )}
    </section>
  );
};

export default WeatherWidget;
