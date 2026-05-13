import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Award, BarChart3, Clapperboard, Search, Star, UserRound } from "lucide-react";
import "../styles/individual.css";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const missingValue = "\u2014";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "" || value === "N/A") {
    return missingValue;
  }

  return value;
};

const formatList = (value) => {
  if (!value) return missingValue;
  if (Array.isArray(value)) return value.length ? value.join(", ") : missingValue;
  return value;
};

const formatRating = (value) => {
  const rating = Number(value);
  return Number.isFinite(rating) ? rating.toFixed(1) : missingValue;
};

export default function Person() {
  const apiUrl = import.meta.env.VITE_MOVIE_API_URL;
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("id") || "");
  const [submittedSearch, setSubmittedSearch] = useState(searchParams.get("id") || "");
  const [rowData, setRowData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [person, setPerson] = useState({
    name: "",
    year: "",
    death: "",
  });

  const refresh = useCallback(async () => {
    const localToken = localStorage.getItem("refreshToken");
    const url = `${apiUrl}/user/refresh`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: localToken }),
    });
    const json = await res.json();

    localStorage.setItem("token", json.bearerToken.token);
    localStorage.setItem("refreshToken", json.refreshToken.token);
  }, [apiUrl]);

  const personGrid = useCallback(async (personId, hasRetried = false) => {
    if (!personId) return;

    setIsLoading(true);
    setError("");

    try {
      const localToken = localStorage.getItem("token");
      const url = `${apiUrl}/people/${personId}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localToken}`,
        },
      });

      if (res.status === 401 && !hasRetried) {
        await refresh();
        await personGrid(personId, true);
        return;
      }

      if (!res.ok) {
        throw new Error("Unable to load person details.");
      }

      const data = await res.json();
      setPerson({
        name: data.name || "",
        year: data.birthYear || "",
        death: data.deathYear || "",
      });

      setRowData(
        (data.roles || []).map((role) => ({
          role: role.category,
          movie: role.movieName,
          characters: role.characters,
          rating: role.imdbRating,
        }))
      );
    } catch (error) {
      console.error("Error loading person:", error);
      setError(error.message || "Unable to load person details.");
      setRowData([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, refresh]);

  useEffect(() => {
    personGrid(submittedSearch);
  }, [submittedSearch, personGrid]);

  const analytics = useMemo(() => {
    const ratedRows = rowData.filter((row) => Number.isFinite(Number(row.rating)));
    const totalCredits = rowData.length;
    const averageRating = ratedRows.length
      ? ratedRows.reduce((total, row) => total + Number(row.rating), 0) / ratedRows.length
      : 0;
    const bestRated = ratedRows.reduce((best, row) => (
      !best || Number(row.rating) > Number(best.rating) ? row : best
    ), null);

    const roleCounts = rowData.reduce((counts, row) => {
      const role = row.role || "Unknown";
      counts[role] = (counts[role] || 0) + 1;
      return counts;
    }, {});

    const ratingBins = Array(10).fill(0);
    ratedRows.forEach((row) => {
      const rating = Math.max(0, Math.min(9, Math.floor(Number(row.rating))));
      ratingBins[rating] += 1;
    });

    const topRatedWorks = [...ratedRows]
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 5);

    return {
      totalCredits,
      averageRating,
      bestRated,
      roleCounts,
      ratingBins,
      topRatedWorks,
    };
  }, [rowData]);

  const ratingDistributionData = {
    labels: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", "9-10"],
    datasets: [
      {
        label: "Movies",
        data: analytics.ratingBins,
        backgroundColor: "rgba(37, 99, 235, 0.72)",
        borderRadius: 8,
      },
    ],
  };

  const roleBreakdownData = {
    labels: Object.keys(analytics.roleCounts),
    datasets: [
      {
        data: Object.values(analytics.roleCounts),
        backgroundColor: ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"],
        borderColor: "#ffffff",
        borderWidth: 3,
      },
    ],
  };

  const topRatedData = {
    labels: analytics.topRatedWorks.map((row) => row.movie),
    datasets: [
      {
        label: "IMDb rating",
        data: analytics.topRatedWorks.map((row) => Number(row.rating)),
        backgroundColor: "rgba(245, 158, 11, 0.78)",
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  const horizontalChartOptions = {
    ...chartOptions,
    indexAxis: "y",
    scales: {
      x: {
        beginAtZero: true,
        max: 10,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmittedSearch(search);
  };

  return (
    <main className="individual-page">
      <div className="individual-container">
        <section className="individual-hero-card">
          <div className="individual-avatar" aria-hidden="true">
            <UserRound size={54} />
          </div>
          <div className="individual-hero-content">
            <p className="individual-eyebrow">People lookup</p>
            <h1>{person.name || "Search People"}</h1>
            <p className="individual-life">
              {person.year ? `${person.year} - ${person.death || "Present"}` : "Enter an IMDb person ID to view credits and analytics."}
            </p>
          </div>
        </section>

        <form className="individual-search-card" onSubmit={handleSubmit}>
          <div className="individual-search-field">
            <label htmlFor="person-search">Person IMDb ID</label>
            <div>
              <Search aria-hidden="true" size={20} />
              <input
                id="person-search"
                name="search"
                type="search"
                placeholder="Example: nm0000138"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <button type="submit">Search</button>
        </form>

        {error && <p className="individual-message">{error}</p>}

        <section className="individual-stat-grid" aria-label="Person analytics summary">
          <article className="individual-stat-card">
            <Clapperboard aria-hidden="true" />
            <div>
              <span>Total credits</span>
              <strong>{analytics.totalCredits}</strong>
            </div>
          </article>
          <article className="individual-stat-card">
            <Star aria-hidden="true" />
            <div>
              <span>Average IMDb</span>
              <strong>{analytics.averageRating ? analytics.averageRating.toFixed(1) : missingValue}</strong>
            </div>
          </article>
          <article className="individual-stat-card">
            <Award aria-hidden="true" />
            <div>
              <span>Best rated</span>
              <strong>{formatRating(analytics.bestRated?.rating)}</strong>
            </div>
          </article>
          <article className="individual-stat-card">
            <BarChart3 aria-hidden="true" />
            <div>
              <span>Role types</span>
              <strong>{Object.keys(analytics.roleCounts).length}</strong>
            </div>
          </article>
        </section>

        <section className="individual-analytics-grid">
          <article className="individual-chart-card">
            <h2>IMDb Rating Distribution</h2>
            <div className="individual-chart">
              <Bar data={ratingDistributionData} options={chartOptions} />
            </div>
          </article>

          <article className="individual-chart-card">
            <h2>Role Breakdown</h2>
            <div className="individual-chart">
              <Doughnut data={roleBreakdownData} options={doughnutOptions} />
            </div>
          </article>

          <article className="individual-chart-card individual-chart-card-wide">
            <h2>Top Rated Credits</h2>
            <div className="individual-chart">
              <Bar data={topRatedData} options={horizontalChartOptions} />
            </div>
          </article>
        </section>

        <section className="individual-credits-card">
          <div className="individual-section-header">
            <div>
              <h2>Credits</h2>
              <p>{isLoading ? "Loading credits..." : `${analytics.totalCredits} credits found`}</p>
            </div>
          </div>

          <div className="individual-table-wrap">
            <table className="individual-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Movie</th>
                  <th>Characters</th>
                  <th>IMDb Rating</th>
                </tr>
              </thead>
              <tbody>
                {rowData.length ? (
                  rowData.map((row, index) => (
                    <tr key={`${row.movie}-${row.role}-${index}`}>
                      <td>{formatValue(row.role)}</td>
                      <td>{formatValue(row.movie)}</td>
                      <td>{formatList(row.characters)}</td>
                      <td>{formatRating(row.rating)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      {isLoading ? "Loading credits..." : "No credits available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
