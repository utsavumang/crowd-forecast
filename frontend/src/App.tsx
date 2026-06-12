import React, { useEffect, useState } from "react";
import {
  Destination, ForecastDay, ForecastResponse,
  getDestinations, getForecast,
} from "./api";
import { DestinationSelector } from "./components/DestinationSelector";
import { CrowdCalendar } from "./components/CrowdCalendar";
import { ForecastDetail } from "./components/ForecastDetail";

export default function App() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDest, setSelectedDest]  = useState<string>("manali");
  const [forecast, setForecast]          = useState<ForecastResponse | null>(null);
  const [selectedDay, setSelectedDay]    = useState<ForecastDay | null>(null);
  const [loading, setLoading]            = useState(false);
  const [error, setError]                = useState<string | null>(null);

  useEffect(() => {
    getDestinations()
      .then((data) => {
        setDestinations(data);
        if (data.length > 0) setSelectedDest(data[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedDest) return;
    setLoading(true);
    setForecast(null);
    setSelectedDay(null);
    setError(null);

    getForecast(selectedDest)
      .then((data) => { setForecast(data); setLoading(false); })
      .catch((e)   => { setError(e.message); setLoading(false); });
  }, [selectedDest]);

  return (
    <div style={{
      maxWidth: 1000, margin: "0 auto", padding: "36px 24px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#111", letterSpacing: -0.5 }}>
          Crowd Forecast
        </div>
      </div>

      <DestinationSelector
        destinations={destinations}
        selected={selectedDest}
        onSelect={setSelectedDest}
        loading={loading}
      />

      {error && (
        <div style={{
          padding: 16, borderRadius: 8, backgroundColor: "#fef2f2",
          color: "#dc2626", marginBottom: 24, fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: 16, marginBottom: 8 }}>Building forecast...</div>
          <div style={{ fontSize: 13 }}>
            Fetching Google Trends + training the model. First load takes a while.
          </div>
        </div>
      )}

      {forecast && !loading && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 40,
          alignItems: "start",
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#111", marginBottom: 20 }}>
              {forecast.destination_name}, {forecast.state}
            </div>
            <CrowdCalendar
              forecast={forecast.forecast}
              onSelectDay={setSelectedDay}
              selectedDate={selectedDay?.date ?? null}
            />
          </div>

          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ fontWeight: 600, color: "#374151", marginBottom: 12 }}>
              Day Detail
            </div>
            <ForecastDetail day={selectedDay} />
          </div>
        </div>
      )}

      <div style={{
        marginTop: 48, paddingTop: 20, borderTop: "1px solid #e5e7eb",
        fontSize: 12, color: "#d1d5db",
      }}>
        Basic Crowd Forecaster with Google Trends + Prophet
      </div>
    </div>
  );
}