export interface Destination {
  id: string;
  name: string;
  state: string;
}

export interface ForecastDay {
  date: string;
  crowd_index: number;
  category: "very_low" | "low" | "moderate" | "high" | "very_high";
  confidence: number;
}

export interface ForecastResponse {
  destination_id: string;
  destination_name: string;
  state: string;
  forecast: ForecastDay[];
  generated_at: string;
}

export async function getDestinations(): Promise<Destination[]> {
  const res = await fetch("/api/destinations");
  if (!res.ok) throw new Error("Failed to fetch destinations");
  return res.json();
}

export async function getForecast(id: string): Promise<ForecastResponse> {
  const res = await fetch(`/api/forecast/${id}`);
  if (!res.ok) throw new Error("Failed to fetch forecast");
  return res.json();
}