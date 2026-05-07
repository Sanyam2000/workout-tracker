"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { ChartCard } from "@/components/chart-card";
import { getBodyWeightTrend, getLatestWeight } from "@/lib/analytics";
import { getInitialData, getTodayDate, saveData } from "@/lib/storage";
import { createId, formatDate } from "@/lib/utils";
import { BodyEntry, BodyMeasurementEntry, WorkoutData } from "@/types/workout";

export function BodyDashboard() {
  const [data, setData] = useState<WorkoutData>(() => getInitialData());
  const [bodyDraft, setBodyDraft] = useState({ date: getTodayDate(), weight: "72.5", bodyFat: "" });
  const [measurementDraft, setMeasurementDraft] = useState({
    date: getTodayDate(),
    chest: "",
    waist: "",
    biceps: "",
    thighs: "",
    calves: "",
  });

  useEffect(() => {
    saveData(data);
  }, [data]);

  const bodyTrend = useMemo(() => getBodyWeightTrend(data.bodyEntries), [data.bodyEntries]);
  const latestWeight = useMemo(() => getLatestWeight(data.bodyEntries), [data.bodyEntries]);

  function handleBodySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const entry: BodyEntry = {
      id: createId("body"),
      date: bodyDraft.date,
      weight: Number(bodyDraft.weight),
      bodyFat: bodyDraft.bodyFat ? Number(bodyDraft.bodyFat) : undefined,
    };

    setData((current) => ({
      ...current,
      bodyEntries: [...current.bodyEntries, entry].sort((first, second) => second.date.localeCompare(first.date)),
    }));
  }

  function handleMeasurementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const entry: BodyMeasurementEntry = {
      id: createId("measurement"),
      date: measurementDraft.date,
      chest: measurementDraft.chest ? Number(measurementDraft.chest) : undefined,
      waist: measurementDraft.waist ? Number(measurementDraft.waist) : undefined,
      biceps: measurementDraft.biceps ? Number(measurementDraft.biceps) : undefined,
      thighs: measurementDraft.thighs ? Number(measurementDraft.thighs) : undefined,
      calves: measurementDraft.calves ? Number(measurementDraft.calves) : undefined,
    };

    setData((current) => ({
      ...current,
      measurementEntries: [...current.measurementEntries, entry].sort((first, second) =>
        second.date.localeCompare(first.date),
      ),
    }));
  }

  return (
    <main className="shell stack-xl">
      <section className="hero slim-hero">
        <div className="stack-small">
          <p className="eyebrow">Body</p>
          <h1>Weight and measurements have their own dashboard now.</h1>
        </div>
        <p className="hero-copy">
          This keeps body tracking separate from workout logging while still making the review process straightforward.
        </p>
      </section>

      <section className="review-metrics">
        <article className="panel metric-panel">
          <p className="section-label">Latest Weight</p>
          <h2>{latestWeight ? `${latestWeight.weight} kg` : "--"}</h2>
          <p className="section-note">{latestWeight ? formatDate(latestWeight.date) : "No body entry yet"}</p>
        </article>
        <article className="panel metric-panel">
          <p className="section-label">Measurements</p>
          <h2>{data.measurementEntries.length}</h2>
          <p className="section-note">Body measurement check-ins</p>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel stack-large">
          <div className="stack-small">
            <p className="section-label">Weight entry</p>
            <h2>Track weight and body fat</h2>
          </div>

          <form className="stack-medium" onSubmit={handleBodySubmit}>
            <div className="field-grid three-up">
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={bodyDraft.date}
                  onChange={(event) => setBodyDraft((current) => ({ ...current, date: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Weight</span>
                <input
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  type="number"
                  value={bodyDraft.weight}
                  onChange={(event) => setBodyDraft((current) => ({ ...current, weight: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Body fat %</span>
                <input
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  type="number"
                  value={bodyDraft.bodyFat}
                  onChange={(event) => setBodyDraft((current) => ({ ...current, bodyFat: event.target.value }))}
                />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Save body entry
            </button>
          </form>
        </article>

        <article className="panel stack-large">
          <div className="stack-small">
            <p className="section-label">Weight Review</p>
            <h2>Recent trend</h2>
          </div>
          <ChartCard title="Body Weight" subtitle="Last 7 weigh-ins" points={bodyTrend} suffix="kg" />
          <div className="recent-list compact-list">
            {data.bodyEntries.slice(0, 6).map((entry) => (
              <div className="recent-item static-item" key={entry.id}>
                <div>
                  <strong>{entry.weight} kg</strong>
                  <p>
                    {formatDate(entry.date)}
                    {entry.bodyFat !== undefined ? ` • ${entry.bodyFat}% body fat` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel stack-large">
        <div className="stack-small">
          <p className="section-label">Measurements</p>
          <h2>Track chest, arms, calves and more</h2>
        </div>

        <form className="stack-medium" onSubmit={handleMeasurementSubmit}>
          <div className="field-grid measurement-grid">
            <label className="field">
              <span>Date</span>
              <input
                type="date"
                value={measurementDraft.date}
                onChange={(event) => setMeasurementDraft((current) => ({ ...current, date: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Chest</span>
              <input
                inputMode="decimal"
                min="0"
                step="0.1"
                type="number"
                value={measurementDraft.chest}
                onChange={(event) => setMeasurementDraft((current) => ({ ...current, chest: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Waist</span>
              <input
                inputMode="decimal"
                min="0"
                step="0.1"
                type="number"
                value={measurementDraft.waist}
                onChange={(event) => setMeasurementDraft((current) => ({ ...current, waist: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Biceps</span>
              <input
                inputMode="decimal"
                min="0"
                step="0.1"
                type="number"
                value={measurementDraft.biceps}
                onChange={(event) => setMeasurementDraft((current) => ({ ...current, biceps: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Thighs</span>
              <input
                inputMode="decimal"
                min="0"
                step="0.1"
                type="number"
                value={measurementDraft.thighs}
                onChange={(event) => setMeasurementDraft((current) => ({ ...current, thighs: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Calves</span>
              <input
                inputMode="decimal"
                min="0"
                step="0.1"
                type="number"
                value={measurementDraft.calves}
                onChange={(event) => setMeasurementDraft((current) => ({ ...current, calves: event.target.value }))}
              />
            </label>
          </div>
          <button className="primary-button" type="submit">
            Save measurements
          </button>
        </form>

        <div className="recent-list compact-list">
          {data.measurementEntries.slice(0, 6).map((entry) => (
            <div className="recent-item static-item" key={entry.id}>
              <div>
                <strong>{formatDate(entry.date)}</strong>
                <p>
                  C {entry.chest ?? "--"} • W {entry.waist ?? "--"} • B {entry.biceps ?? "--"} • T {entry.thighs ?? "--"} • Ca {entry.calves ?? "--"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Link className="text-link" href="/">
          Back to home
        </Link>
      </section>
    </main>
  );
}
