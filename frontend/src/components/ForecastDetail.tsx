import React from "react";
import { ForecastDay } from "../api";

interface Props {
  day: ForecastDay | null;
}

const BG: Record<string, string> = {
  very_low: "#16a34a",
  low:      "#65a30d",
  moderate: "#ca8a04",
  high:     "#ea580c",
  very_high:"#dc2626",
};

const ADVICE: Record<string, string> = {
  very_low: "Excellent time to visit.",
  low:      "Great time to visit.",
  moderate: "Decent time to visit.",
  high:     "Busy period.",
  very_high:"Peak crowd period / Unviable Off Season.",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(s: string) {
  const d = new Date(s + "T12:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function ForecastDetail({ day }: Props) {
  if (!day) {
    return (
      <div style={{
        padding: 24, borderRadius: 12, border: "1px dashed #d1d5db",
        color: "#9ca3af", textAlign: "center", fontSize: 14,
      }}>
        click a date on the calendar to see details.
      </div>
    );
  }

  const label = day.category.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      <div style={{ backgroundColor: BG[day.category], padding: "20px 24px" }}>
        <div style={{ color: "#fff", opacity: 0.85, fontSize: 13, marginBottom: 4 }}>
          {fmtDate(day.date)}
        </div>
        <div style={{ color: "#fff", fontSize: 26, fontWeight: 700 }}>{label}</div>
        <div style={{ color: "#fff", opacity: 0.85, fontSize: 14, marginTop: 4 }}>
          Crowd Index: {day.crowd_index} / 10
        </div>
      </div>
      <div style={{ padding: "20px 24px", backgroundColor: "#fff" }}>
        <p style={{ color: "#4b5563", lineHeight: 1.65, marginBottom: 16, fontSize: 14 }}>
          {ADVICE[day.category]}
        </p>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          Forecast confidence: {Math.round(day.confidence * 100)}%
        </div>
      </div>
    </div>
  );
}