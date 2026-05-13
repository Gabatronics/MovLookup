import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "../styles/movies.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button} from "reactstrap";
import { useNavigate } from "react-router-dom";

const missingValue = "\u2014";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return missingValue;
  }

  return value;
};

const formatPercent = (value) => {
  if (value === null || value === undefined || value === "") {
    return missingValue;
  }

  return String(value).includes("%") ? value : `${value}%`;
};

const ratingRenderer = ({ value }) => {
  if (value === null || value === undefined || value === "") {
    return missingValue;
  }

  return (
    <span className="rating-cell">
      <span className="rating-star" aria-hidden="true">{"\u2605"}</span>
      <span>{value}/10</span>
    </span>
  );
};

const metacriticRenderer = ({ value }) => {
  if (value === null || value === undefined || value === "") {
    return missingValue;
  }

  return <span className="metacritic-badge">{value}</span>;
};


export default function Movie() {

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_MOVIE_API_URL;
  const [searchInput, setSearchInput] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [sortInput, setSortInput] = useState("title");
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [previewDetails, setPreviewDetails] = useState(null);
  const [resultSummary, setResultSummary] = useState("Showing movies matching your search");
  const gridRef = useRef(null);
  const [gridApi, setGridApi] = useState(null); 

  const limit = 25;

  const columns = useMemo(() => [
    { headerName: "Title", field: "title", flex: 2, minWidth: 190, valueFormatter: ({ value }) => formatValue(value) },
    { headerName: "Year", field: "year", width: 100, valueFormatter: ({ value }) => formatValue(value) },
    { headerName: "IMDb", field: "imdbRating", width: 120, cellRenderer: ratingRenderer },
    { headerName: "IMDb ID", field: "imdbID", width: 130, valueFormatter: ({ value }) => formatValue(value) },
    { headerName: "Rotten Tomatoes", field: "rottenTomatoesRating", width: 160, valueFormatter: ({ value }) => formatPercent(value) },
    { headerName: "Metacritic", field: "metacriticRating", width: 130, cellRenderer: metacriticRenderer },
    { headerName: "Rated", field: "classification", width: 110, valueFormatter: ({ value }) => formatValue(value) },
  ], []);

  const sortMovies = useCallback((movies) => {
    return [...movies].sort((a, b) => {
      if (sortBy === "year") {
        return Number(b.year || 0) - Number(a.year || 0);
      }

      if (sortBy === "imdb") {
        return Number(b.imdbRating || 0) - Number(a.imdbRating || 0);
      }

      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }, [sortBy]);

  const loadDataSource = useCallback(async (searchQuery, yearQuery) => {
    const dataSource = {
      rowCount: undefined,
      getRows: async (params) => {
        const page = Math.floor(params.endRow / limit);
        const paramsQuery = new URLSearchParams({
          title: searchQuery,
          year: yearQuery,
          page,
        });
        const res = await fetch(`${apiUrl}/Movies/search?${paramsQuery}`);
        const json = await res.json();
        const list = sortMovies(json.data || []);
        const total = json.total || json.totalCount || json.count || json.pagination?.total;
        const firstResult = params.startRow + 1;
        const lastResult = params.startRow + list.length;
        const lastRow = list.length < limit ? params.startRow + list.length : -1;

        if (list.length === 0) {
          setResultSummary("No movies found");
        } else if (total) {
          setResultSummary(`Showing ${firstResult}\u2013${lastResult} of ${Number(total).toLocaleString()} movies`);
        } else {
          setResultSummary(`Showing ${firstResult}\u2013${lastResult} movies`);
        }

        setSelectedMovie((currentMovie) => currentMovie ?? list[0] ?? null);
        params.successCallback(list, lastRow);
      },
    };

    if (gridApi) {
      gridApi.setGridOption("datasource", dataSource); 
    }
  }, [apiUrl, gridApi, limit, sortMovies]);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  useEffect(() => {
    if (gridApi) {
      loadDataSource(search, year);
    }
  }, [gridApi, search, year, sortBy, loadDataSource]);

  useEffect(() => {
    if (!selectedMovie?.imdbID) {
      setPreviewDetails(null);
      return;
    }

    const controller = new AbortController();
    setPreviewDetails(null);

    const loadPreviewDetails = async () => {
      try {
        const res = await fetch(`${apiUrl}/movies/data/${selectedMovie.imdbID}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setPreviewDetails(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error loading movie preview:", error);
          setPreviewDetails(null);
        }
      }
    };

    loadPreviewDetails();

    return () => controller.abort();
  }, [apiUrl, selectedMovie?.imdbID]);

  const years = Array.from({ length: 100 }, (_, i) => 2025 - i); // Last 100 years
  const previewTitle = selectedMovie?.title || "Select a movie";
  const posterInitial = previewTitle.slice(0, 1).toUpperCase();
  const posterUrl = previewDetails?.poster && previewDetails.poster !== "N/A"
    ? previewDetails.poster
    : "";

  const viewDetails = () => {
    if (!selectedMovie) return;

    navigate(
      `/moviePage?title=${encodeURIComponent(
        selectedMovie.title
      )}&id=${encodeURIComponent(selectedMovie.imdbID)}`
    );
  };

  return (
    <main className="movies-page">
      <div className="movies-container">
        <section className="movies-hero" aria-labelledby="movies-title">
          <h1 id="movies-title">Search Movies</h1>
          <p>Find films by title, release year, and ratings.</p>
        </section>

        <section className="movie-search-card" aria-label="Movie search filters">
          <div className="movie-field">
            <label htmlFor="search">Movie title</label>
            <input
              aria-labelledby="search-button"
              name="search"
              id="search"
              type="search"
              placeholder="Enter movie title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="movie-field">
            <label htmlFor="year-select">Year</label>
            <select
              id="year-select"
              onChange={(e) => setYearInput(e.target.value)}
              value={yearInput}
            >
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="movie-field">
            <label htmlFor="sort-select">Sort by</label>
            <select
              id="sort-select"
              onChange={(e) => setSortInput(e.target.value)}
              value={sortInput}
            >
              <option value="title">Title (A-Z)</option>
              <option value="year">Year</option>
              <option value="imdb">IMDb rating</option>
            </select>
          </div>

          <Button
            id="search-button"
            className="movie-search-button"
            onClick={() => {
              setSelectedMovie(null);
              setSearch(searchInput);
              setYear(yearInput);
              setSortBy(sortInput);
            }}
          >
            Search
          </Button>
        </section>

        <section className="movies-content">
          <div className="movie-results-card">
            <div className="movie-results-meta">
              <span>{resultSummary}</span>
              <span>Click a row to preview</span>
            </div>

        <div
              className="ag-theme-quartz movie-table"
        >
          <AgGridReact
            ref={gridRef}
            columnDefs={columns}
            rowModelType="infinite"
            cacheBlockSize={limit}
                pagination={true}
                paginationPageSize={limit}
                rowHeight={56}
                headerHeight={48}
                rowSelection="single"
            onGridReady={onGridReady}
                onRowClicked={(row) => setSelectedMovie(row.data)}
                onRowDoubleClicked={(row) =>
                  navigate(
                    `/moviePage?title=${encodeURIComponent(
                      row.data.title
                    )}&id=${encodeURIComponent(row.data.imdbID)}`
                  )
                }
          />
        </div>
          </div>

          <aside className="movie-preview-card" aria-label="Movie detail preview">
            {posterUrl ? (
              <img
                className="movie-preview-poster"
                src={posterUrl}
                alt={`${previewTitle} poster`}
                onError={() => setPreviewDetails((details) => details ? { ...details, poster: "" } : null)}
              />
            ) : (
              <div className="movie-poster-placeholder" aria-hidden="true">
                <span>{posterInitial}</span>
              </div>
            )}

            <h2>{previewTitle}</h2>
            <p className="movie-preview-year">{formatValue(selectedMovie?.year)}</p>

            <dl className="movie-preview-list">
              <div>
                <dt>IMDb</dt>
                <dd>{selectedMovie?.imdbRating ? `${selectedMovie.imdbRating}/10` : missingValue}</dd>
              </div>
              <div>
                <dt>Rotten Tomatoes</dt>
                <dd>{formatPercent(selectedMovie?.rottenTomatoesRating)}</dd>
              </div>
              <div>
                <dt>Metacritic</dt>
                <dd>{formatValue(selectedMovie?.metacriticRating)}</dd>
              </div>
              <div>
                <dt>Rated</dt>
                <dd>{formatValue(selectedMovie?.classification)}</dd>
              </div>
              <div>
                <dt>IMDb ID</dt>
                <dd>{formatValue(selectedMovie?.imdbID)}</dd>
              </div>
            </dl>

            <p className="movie-overview">
              {previewDetails?.plot
                ? previewDetails.plot
                : selectedMovie
                  ? "A compact preview of this title. Open the details page for the full cast, ratings, poster, and movie information."
                : "Choose a movie from the results to see a quick overview here."}
            </p>

            <Button
              className="movie-detail-button"
              disabled={!selectedMovie}
              onClick={viewDetails}
            >
              View Details
            </Button>
          </aside>
        </section>
      </div>
    </main>
  );
}
