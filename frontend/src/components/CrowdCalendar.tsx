import React from "react";
import { ForecastDay } from "../api";

interface Props {
  forecast: ForecastDay[];
  onSelectDay: (day: ForecastDay) => void;
  selectedDate: string | null;
}

const COLOR: Record<string, string> = {
  very_low: "#bbf7d0",
  low:      "#d9f99d",
  moderate: "#fef08a",
  high:     "#fed7aa",
  very_high:"#fecaca",
};

const BORDER: Record<string, string> = {
  very_low: "#16a34a",
  low:      "#65a30d",
  moderate: "#ca8a04",
  high:     "#ea580c",
  very_high:"#dc2626",
};

const LEGEND = [
  { cat: "very_low",  label: "Very Low"  },
  { cat: "low",       label: "Low"       },
  { cat: "moderate",  label: "Moderate"  },
  { cat: "high",      label: "High"      },
  { cat: "very_high", label: "Very High / Unviable Season" },
];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function CrowdCalendar({ forecast, onSelectDay, selectedDate }: Props) {
  const map = new Map(forecast.map((d) => [d.date, d]));

  const todayStr = new Date().toISOString().split("T")[0];

  const now = new Date();
  const months = Array.from({ length: 3 }, (_, i) => ({
    year:  new Date(now.getFullYear(), now.getMonth() + i, 1).getFullYear(),
    month: new Date(now.getFullYear(), now.getMonth() + i, 1).getMonth(),
  }));

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {LEGEND.map(({ cat, label }) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 13, height: 13, borderRadius: 3,
              backgroundColor: COLOR[cat],
              border: `1.5px solid ${BORDER[cat]}`,
            }} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
          </div>
        ))}
      </div>

      {months.map(({ year, month }) => {
        const firstDow = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells: (number | null)[] = [
          ...Array(firstDow).fill(null),
          ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ];

        return (
          <div key={`${year}-${month}`} style={{ marginBottom: 32 }}>
            <div style={{ fontWeight: 600, color: "#374151", marginBottom: 10 }}>
              {MONTH_NAMES[month]} {year}
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              gap: 3, marginBottom: 4,
            }}>
              {DAY_NAMES.map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
                  {d}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
              {cells.map((day, idx) => {
                if (!day) return <div key={`e-${idx}`} />;

                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const data = map.get(dateStr);
                const isPast = dateStr < todayStr;
                const isSelected = selectedDate === dateStr;

                if (!data || isPast) {
                  return (
                    <div key={dateStr} style={{
                      height: 42, borderRadius: 6,
                      backgroundColor: isPast ? "#f3f4f6" : "#e5e7eb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: "#d1d5db",
                    }}>
                      {day}
                    </div>
                  );
                }

                return (
                  <div
                    key={dateStr}
                    onClick={() => onSelectDay(data)}
                    style={{
                      height: 42, borderRadius: 6,
                      backgroundColor: COLOR[data.category],
                      border: isSelected
                        ? `2.5px solid ${BORDER[data.category]}`
                        : `1px solid ${BORDER[data.category]}44`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                      transform: isSelected ? "scale(1.05)" : "scale(1)",
                      transition: "transform 0.1s",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1f2937" }}>
                      {day}
                    </span>
                    <span style={{ fontSize: 9, color: "#374151" }}>
                      {data.crowd_index.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}