import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind } from 'lucide-react';
import axios from 'axios';
import '../styles/Weather.css';

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      // Using OpenWeatherMap API (Free tier) - Manila coordinates
      const API_KEY = 'demo'; // In production, use environment variable
      const city = 'Manila';
      
      // For demo purposes, using mock data
      // In production: const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
      
      // Mock weather data
      setTimeout(() => {
        setWeather({
          temp: 28,
          description: 'Partly Cloudy',
          humidity: 75,
          windSpeed: 12,
          city: 'Manila'
        });
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('Unable to fetch weather');
      setLoading(false);
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return <Cloud />;
    const desc = weather.description.toLowerCase();
    if (desc.includes('rain')) return <CloudRain size={32} />;
    if (desc.includes('cloud')) return <Cloud size={32} />;
    return <Sun size={32} />;
  };

  if (loading) {
    return (
      <div className="weather-widget">
        <div className="weather-loading">Loading weather...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget">
        <div className="weather-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <div className="weather-header">
        <span className="weather-title">Weather</span>
        <span className="weather-location">{weather.city}</span>
      </div>
      
      <div className="weather-content">
        <div className="weather-icon">
          {getWeatherIcon()}
        </div>
        <div className="weather-temp">{weather.temp}°C</div>
        <div className="weather-desc">{weather.description}</div>
      </div>

      <div className="weather-details">
        <div className="weather-detail-item">
          <Wind size={16} />
          <span>{weather.windSpeed} km/h</span>
        </div>
        <div className="weather-detail-item">
          <Cloud size={16} />
          <span>{weather.humidity}% humidity</span>
        </div>
      </div>
    </div>
  );
};

export default Weather;
