"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { ChartCard } from "@/components/chart-card";
import { getCalorieTrend, getLatestCalories, getWeeklyAverageCalories } from "@/lib/analytics";
import { getInitialData, getTodayDate, saveData } from "@/lib/storage";
import { createId, formatDate } from "@/lib/utils";
import { CalorieEntry, WorkoutData } from "@/types/workout";

export function NutritionDashboard() {
  const [data, setData] = useState<WorkoutData>(() => getInitialData());
  const [calorieDraft, setCalorieDraft] = useState({
    date: getTodayDate(),
    calories: "2200",
    protein: "160",
    carbs: "240",
    fats: "65",
    fiber: "28",
  });

  useEffect(() => {
    saveData(data);
  }, [data]);

  const calorieTrend = useMemo(() => getCalorieTrend(data.calorieEntries), [data.calorieEntries]);
  const latestCalories = useMemo(() => getLatestCalories(data.calorieEntries), [data.calorieEntries]);
  const weeklyAverageCalories = useMemo(() => getWeeklyAverageCalories(data.calorieEntries), [data.calorieEntries]);

  function handleCalorieSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const entry: CalorieEntry = {
      id: createId("calories"),
      date: calorieDraft.date,
      calories: Number(calorieDraft.calories),
      protein: Number(calorieDraft.protein),
      carbs: Number(calorieDraft.carbs),
      fats: Number(calorieDraft.fats),
      fiber: Number(calorieDraft.fiber),
    };

    setData((current) => ({
      ...current,
      calorieEntries: [...current.calorieEntries, entry].sort((first, second) => second.date.localeCompare(first.date)),
    }));
  }

  return (
    <main className="shell stack-xl">
      <section className="hero slim-hero">
        <div className="stack-small">
          <p className="eyebrow">Nutrition</p>
          <h1>Keep calories and macros together without crowding the workout flow.</h1>
        </div>
        <p className="hero-copy">This dashboard is only for food tracking, so it stays fast and easy to maintain.</p>
      </section>

      <section className="review-metrics">
        <article className="panel metric-panel">
          <p className="section-label">Latest</p>
          <h2>{latestCalories ? latestCalories.calories : "--"}</h2>
          <p className="section-note">{latestCalories ? formatDate(latestCalories.date) : "No calorie entry yet"}</p>
        </article>
        <article className="panel metric-panel">
          <p className="section-label">Average</p>
          <h2>{weeklyAverageCalories || "--"}</h2>
          <p className="section-note">Last 7 nutrition entries</p>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel stack-large">
          <div className="stack-small">
            <p className="section-label">Calorie entry</p>
            <h2>Log nutrition in one place</h2>
          </div>

          <form className="stack-medium" onSubmit={handleCalorieSubmit}>
            <div className="field-grid two-up">
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={calorieDraft.date}
                  onChange={(event) => setCalorieDraft((current) => ({ ...current, date: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Calories</span>
                <input
                  inputMode="numeric"
                  min="0"
                  step="1"
                  type="number"
                  value={calorieDraft.calories}
                  onChange={(event) => setCalorieDraft((current) => ({ ...current, calories: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-grid macro-grid">
              <label className="field">
                <span>Protein</span>
                <input
                  inputMode="numeric"
                  min="0"
                  step="1"
                  type="number"
                  value={calorieDraft.protein}
                  onChange={(event) => setCalorieDraft((current) => ({ ...current, protein: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Carbs</span>
                <input
                  inputMode="numeric"
                  min="0"
                  step="1"
                  type="number"
                  value={calorieDraft.carbs}
                  onChange={(event) => setCalorieDraft((current) => ({ ...current, carbs: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Fats</span>
                <input
                  inputMode="numeric"
                  min="0"
                  step="1"
                  type="number"
                  value={calorieDraft.fats}
                  onChange={(event) => setCalorieDraft((current) => ({ ...current, fats: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Fibre</span>
                <input
                  inputMode="numeric"
                  min="0"
                  step="1"
                  type="number"
                  value={calorieDraft.fiber}
                  onChange={(event) => setCalorieDraft((current) => ({ ...current, fiber: event.target.value }))}
                />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Save calories
            </button>
          </form>
        </article>

        <article className="panel stack-large">
          <div className="stack-small">
            <p className="section-label">Review</p>
            <h2>Recent nutrition trend</h2>
          </div>
          <ChartCard title="Calories" subtitle="Last 7 entries" points={calorieTrend} />
          <div className="recent-list compact-list">
            {data.calorieEntries.slice(0, 6).map((entry) => (
              <div className="recent-item static-item" key={entry.id}>
                <div>
                  <strong>{entry.calories} kcal</strong>
                  <p>
                    {formatDate(entry.date)} • P {entry.protein} • C {entry.carbs} • F {entry.fats} • Fi {entry.fiber}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link className="text-link" href="/">
            Back to home
          </Link>
        </article>
      </section>
    </main>
  );
}
