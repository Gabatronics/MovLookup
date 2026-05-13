
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/moviePage.css";
import imdbIcon from "../assets/imdb.png";
import metacriticIcon from "../assets/metacritic.png";
import rottenTomatoesIcon from "../assets/Rotten_Tomatoes.svg.png";

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

const formatRuntime = (value) => {
  if (!value) return missingValue;
  return String(value).includes("min") ? value : `${value} min`;
};

const formatBoxOffice = (value) => {
  if (value === null || value === undefined || value === "" || value === "N/A") {
    return missingValue;
  }

  return String(value).startsWith("$") ? value : `$${value}`;
};

const getRating = (ratings, label) => {
  return ratings?.find((rating) =>
    rating.source?.toLowerCase().includes(label.toLowerCase())
  )?.value;
};

export default function Book() {
    const apiUrl = import.meta.env.VITE_MOVIE_API_URL;

    const [rowData, setRowData] = useState([]);
    
    const [movieInfo, setMovieInfo] = useState({
      year: "",
      runtime: "",
      genre: [],
      country: "",
      boxOffice: "",
      plot: "",
      rating: [],
      poster: ""
    });

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const title = searchParams.get("title");
    const navigate = useNavigate();

    // render info for state variables
    useEffect(() => {
      fetch(`${apiUrl}/movies/data/${id}`)
        .then(res => res.json())
        .then(data => {
          setMovieInfo(prev => ({
            ...prev,
            year: data.year,
            runtime: data.runtime,
            genre: data.genres,
            country: data.country,
            boxOffice: data.boxoffice,
            plot: data.plot,
            rating: data.ratings,
            poster: data.poster
          }));        
          return data.principals}) 

        .then(works =>
          works.map(book => {
            return {
              role: book.category,
              name: book.name,
              characters: book.characters, 
              id: book.id
            };
          })
        )
        .then(books => setRowData(books));
      }, [apiUrl, id])

      const checkLogin = () => {
        const localToken = localStorage.getItem("refreshToken");
        return Boolean(localToken);
      }

      const imdbRating = getRating(movieInfo.rating, "internet movie database");
      const rottenTomatoesRating = getRating(movieInfo.rating, "rotten tomatoes");
      const metacriticRating = getRating(movieInfo.rating, "metacritic");
      const overview = movieInfo.plot || "No overview available for this movie.";
      const imdbMovieUrl = id ? `https://www.imdb.com/title/${id}/` : "";
      const metadata = [
        formatValue(movieInfo.year),
        formatRuntime(movieInfo.runtime),
        formatList(movieInfo.genre),
      ].filter((item) => item !== missingValue).join(" · ");

  return (
    <main className="movie-detail-page">
      <div className="movie-detail-container">
        <button className="movie-back-link" type="button" onClick={() => navigate("/movies")}>
          <span aria-hidden="true">{"\u2190"}</span> Back to Movies
        </button>

        <section className="movie-hero-card">
          <div className="movie-poster-frame">
            {movieInfo.poster ? (
              <img src={movieInfo.poster} alt={`${title} poster`} />
            ) : (
              <div className="movie-poster-fallback">
                <span>{title?.slice(0, 1).toUpperCase() || "M"}</span>
              </div>
            )}
          </div>

          <div className="movie-hero-content">
            <h1>{formatValue(title)}</h1>
            <p className="movie-metadata">{metadata || missingValue}</p>
            <p className="movie-country">{formatList(movieInfo.country)}</p>

            <div className="movie-rating-grid" aria-label="Movie ratings">
              <article className="movie-rating-card">
                <img src={imdbIcon} alt="" />
                <div>
                  <strong>{imdbRating ? `${imdbRating}/10` : missingValue}</strong>
                  <span>IMDb</span>
                </div>
              </article>

              <article className="movie-rating-card">
                <img src={rottenTomatoesIcon} alt="" />
                <div>
                  <strong>{rottenTomatoesRating ? `${rottenTomatoesRating}%` : missingValue}</strong>
                  <span>Rotten Tomatoes</span>
                </div>
              </article>

              <article className="movie-rating-card">
                <img src={metacriticIcon} alt="" />
                <div>
                  <strong>{metacriticRating ? `${metacriticRating}/100` : missingValue}</strong>
                  <span>Metacritic</span>
                </div>
              </article>
            </div>

            <section className="movie-overview-section">
              <h2>Overview</h2>
              <p>{overview}</p>
            </section>

            {imdbMovieUrl && (
              <a className="movie-imdb-button" href={imdbMovieUrl} target="_blank" rel="noreferrer">
                View on IMDb
              </a>
            )}
          </div>
        </section>

        <section className="movie-lower-grid">
          <div className="movie-cast-card">
            <h2>Cast & Crew</h2>
            <div className="movie-cast-table-wrap">
              <table className="movie-cast-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Name</th>
                    <th>Character</th>
                    <th>IMDb ID</th>
                  </tr>
                </thead>
                <tbody>
                  {rowData.length ? (
                    rowData.map((person) => (
                      <tr
                        key={`${person.id}-${person.role}-${person.name}`}
                        onClick={() => {
                          if (checkLogin()) {
                            navigate(`/individual?id=${person.id}`);
                          }
                        }}
                      >
                        <td>{formatValue(person.role)}</td>
                        <td>{formatValue(person.name)}</td>
                        <td>{formatList(person.characters)}</td>
                        <td>
                          {person.id ? (
                            <a
                              href={`https://www.imdb.com/name/${person.id}/`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {person.id}
                            </a>
                          ) : (
                            missingValue
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No cast or crew data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="movie-facts-card">
            <h2>Quick Facts</h2>
            <dl>
              <div>
                <dt>Released</dt>
                <dd>{formatValue(movieInfo.year)}</dd>
              </div>
              <div>
                <dt>Runtime</dt>
                <dd>{formatRuntime(movieInfo.runtime)}</dd>
              </div>
              <div>
                <dt>Genre</dt>
                <dd>{formatList(movieInfo.genre)}</dd>
              </div>
              <div>
                <dt>Country</dt>
                <dd>{formatList(movieInfo.country)}</dd>
              </div>
              <div>
                <dt>Box Office</dt>
                <dd>{formatBoxOffice(movieInfo.boxOffice)}</dd>
              </div>
            </dl>
          </aside>
        </section>
      </div>
    </main>
  );
}
