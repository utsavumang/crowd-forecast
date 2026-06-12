import React from "react";
import { Destination } from "../api";

interface Props {
  destinations: Destination[];
  selected: string;
  onSelect: (id: string) => void;
  loading: boolean;
}

export function DestinationSelector({ destinations, selected, onSelect, loading }: Props) {
  return (
    <div style={{ marginBottom: 28 }}>
      <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151" }}>
        Destination
      </label>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        disabled={loading}
        style={{
          padding: "10px 16px",
          fontSize: 15,
          borderRadius: 8,
          border: "1px solid #d1d5db",
          backgroundColor: "#fff",
          cursor: loading ? "wait" : "pointer",
          minWidth: 240,
          color: "#111",
        }}
      >
        {destinations.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}, {d.state}
          </option>
        ))}
      </select>
    </div>
  );
}