import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  CloudRain,
  ShieldAlert
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { AlertBanner } from '../components/AlertBanner';
import { apiService } from '../services/api';
import { WeatherResponse } from '../types';

export const WeatherAdvisory: React.FC = () => {
  const [cityInput, setCityInput] = useState('Chicago');
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (targetCity: string) => {
    if (!targetCity.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getWeatherAdvisory(targetCity.trim());
      setWeatherData(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        `Could not retrieve meteorological data for '${targetCity}'. Check city name or connection.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Chicago');
  }, []);

  const popularCities = ['Chicago', 'Dubai', 'London', 'Mumbai', 'Singapore', 'New York', 'Sydney'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-construction-100 text-construction-700 rounded-lg">
              <CloudSun className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
              Weather-Aware Construction Advisory
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time meteorological monitoring powered by Open-Meteo. Evaluates concrete pouring, crane lift winds, painting, and heat safety.
          </p>
        </div>
      </div>

      {/* Search Bar & City Chips */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchWeather(cityInput);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter site city name (e.g. Dubai, London, Chicago, Mumbai)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/60"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !cityInput.trim()}
            className="px-5 py-2.5 bg-construction-500 hover:bg-construction-600 disabled:bg-slate-200 text-white font-bold rounded-xl shadow-sm transition-all text-sm flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Query Live Weather</span>
          </button>
        </form>

        <div className="flex items-center space-x-2 overflow-x-auto pt-1 text-xs">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Global Hubs:</span>
          {popularCities.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCityInput(c);
                fetchWeather(c);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Meteorological Service Notice"
          message={error}
        />
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-2xl border border-slate-200/80">
          <div className="w-10 h-10 border-4 border-construction-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">
            Querying Open-Meteo API and calculating civil engineering decision matrix...
          </p>
        </div>
      )}

      {weatherData && !loading && (
        <div className="space-y-6">
          {/* Main Weather Hero Card */}
          <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-850 text-white p-6 rounded-2xl shadow-lg border border-navy-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-construction-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Live Meteorological Station
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1">
                  {weatherData.location_name}
                </h2>
                <p className="text-xs text-slate-400">
                  Lat: {weatherData.latitude.toFixed(2)}°, Lon: {weatherData.longitude.toFixed(2)}° • {weatherData.timestamp}
                </p>
              </div>

              {/* Site Status Badge */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Civil Site Status
                  </span>
                  <StatusBadge status={weatherData.overall_site_status} size="lg" />
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Thermometer className="w-4 h-4 text-construction-400" />
                  <span>Ambient Temp</span>
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {weatherData.current.temperature.toFixed(1)}°C
                </div>
                <span className="text-[11px] text-slate-400">
                  Feels like {weatherData.current.apparent_temperature.toFixed(1)}°C
                </span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span>Humidity</span>
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {weatherData.current.relative_humidity}%
                </div>
                <span className="text-[11px] text-slate-400">
                  {weatherData.current.relative_humidity > 80 ? 'High Moisture' : 'Optimal'}
                </span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Wind className="w-4 h-4 text-teal-400" />
                  <span>Wind Speed</span>
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {weatherData.current.wind_speed.toFixed(1)} km/h
                </div>
                <span className="text-[11px] text-slate-400">
                  Gusts up to {weatherData.current.wind_gusts.toFixed(1)} km/h
                </span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <CloudRain className="w-4 h-4 text-indigo-400" />
                  <span>Conditions</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white truncate">
                  {weatherData.current.weather_description}
                </div>
                <span className="text-[11px] text-slate-400">
                  Precip: {weatherData.current.precipitation} mm
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-construction-300 font-medium">
              Primary Meteorological Alert: {weatherData.primary_weather_risk}
            </div>
          </div>

          {/* Construction Activity Advisory Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-navy-950 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-construction-500" />
              Civil Work Decision Protocols (Codal Matrix)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weatherData.construction_advisories.map((advisory, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:bg-white transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-navy-950">{advisory.activity}</h4>
                    <StatusBadge status={advisory.status} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {advisory.recommendation}
                  </p>

                  <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60">
                    Threshold: {advisory.threshold_info}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Day Outlook */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-navy-950 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-construction-500" />
              5-Day Lookahead Forecast for Site Operations
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {weatherData.forecast_days.map((day, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-center space-y-1"
                >
                  <span className="font-semibold text-slate-700 block">{day.date}</span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {day.weather_description}
                  </span>
                  <div className="text-sm font-bold text-navy-900">
                    {day.temperature_max.toFixed(0)}° / {day.temperature_min.toFixed(0)}°C
                  </div>
                  <div className="text-[10px] text-sky-600 font-medium">
                    Rain Prob: {day.precipitation_probability}%
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Wind: {day.wind_speed_max.toFixed(0)} km/h
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
