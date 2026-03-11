import { getWeatherIconUrl } from '../../services/weatherApi';
import { LoadingSkeleton } from '../common/LoadingSpinner';

const formatCondition = (conditionText) => {
  if (!conditionText) return 'Unknown';
  return conditionText
    .split(' ')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
};

const ForecastDisplay = ({ forecast, isLoading }) => {
  if (isLoading) {
    return <LoadingSkeleton lines={5} className="forecast-loading" />;
  }

  if (!forecast?.length) {
    return <p className="weather-helper-text">5-day forecast is currently unavailable.</p>;
  }

  return (
    <div className="forecast-grid" aria-label="5 day weather forecast">
      {forecast.map((entry) => (
        <article key={entry.dateISO} className="forecast-card">
          <p className="forecast-day">{entry.dayLabel}</p>
          <p className="forecast-date">{entry.dateLabel}</p>
          <img
            src={getWeatherIconUrl(entry.icon)}
            alt={entry.condition}
            width="56"
            height="56"
            loading="lazy"
          />
          <p className="forecast-temp">
            {entry.maxTemp}° / {entry.minTemp}°
          </p>
          <p className="forecast-condition">{formatCondition(entry.condition)}</p>
        </article>
      ))}
    </div>
  );
};

export default ForecastDisplay;
