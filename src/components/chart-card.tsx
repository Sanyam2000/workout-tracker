"use client";

import { BarPoint } from "@/lib/analytics";

type ChartCardProps = {
  title: string;
  subtitle: string;
  points: BarPoint[];
  suffix?: string;
};

export function ChartCard({ title, subtitle, points, suffix = "" }: ChartCardProps) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <article className="chart-card">
      <div className="stack-small">
        <p className="section-label">{title}</p>
        <p className="section-note">{subtitle}</p>
      </div>

      {points.length ? (
        <div className="mini-chart">
          {points.map((point) => (
            <div className="mini-chart-column" key={`${point.label}-${point.value}`}>
              <div
                className="mini-chart-bar"
                style={{ height: `${Math.max((point.value / maxValue) * 100, 6)}%` }}
                title={`${point.label}: ${point.value}${suffix}`}
              />
              <strong>
                {point.value}
                {suffix}
              </strong>
              <span>{point.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">Start logging to unlock the graph.</p>
      )}
    </article>
  );
}
