import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const missingValue = "\u2014";

const parseRating = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const rating = Number(String(value).replace("%", ""));
  return Number.isFinite(rating) ? rating : null;
};

const formatRating = (value, suffix = "") => {
  const rating = parseRating(value);

  if (rating === null) {
    return missingValue;
  }

  return `${rating.toFixed(1)}${suffix}`;
};

const getTopMovies = (movies, field) => {
  return [...movies]
    .filter((movie) => parseRating(movie[field]) !== null)
    .sort((a, b) => parseRating(b[field]) - parseRating(a[field]))
    .slice(0, 10);
};

export default function Home() {
  const apiUrl = import.meta.env.VITE_MOVIE_API_URL;
  const navigate = useNavigate();
  const imdbCarouselRef = useRef(null);
  const rottenTomatoesCarouselRef = useRef(null);
  const metacriticCarouselRef = useRef(null);
  const [topMovies, setTopMovies] = useState({
    imdb: [],
    rottenTomatoes: [],
    metacritic: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTopMovies = async () => {
      try {
        const pages = [1, 2, 3];
        const searchResults = await Promise.all(
          pages.map((page) => {
            const query = new URLSearchParams({
              title: "",
              year: "",
              page,
            });

            return fetch(`${apiUrl}/Movies/search?${query}`).then((res) => res.json());
          })
        );

        const movies = searchResults.flatMap((result) => result.data || []);
        const imdbTop = getTopMovies(movies, "imdbRating");
        const rottenTomatoesTop = getTopMovies(movies, "rottenTomatoesRating");
        const metacriticTop = getTopMovies(movies, "metacriticRating");
        const uniqueTopMovies = [...new Map(
          [...imdbTop, ...rottenTomatoesTop, ...metacriticTop].map((movie) => [movie.imdbID, movie])
        ).values()];

        const posterMap = new Map(
          await Promise.all(
            uniqueTopMovies.map(async (movie) => {
            try {
              const res = await fetch(`${apiUrl}/movies/data/${movie.imdbID}`);
              const detail = await res.json();
                return [movie.imdbID, detail.poster];
            } catch {
                return [movie.imdbID, ""];
            }
          })
          )
        );

        const addPoster = (movie) => ({
          ...movie,
          poster: posterMap.get(movie.imdbID),
        });

        setTopMovies({
          imdb: imdbTop.map(addPoster),
          rottenTomatoes: rottenTomatoesTop.map(addPoster),
          metacritic: metacriticTop.map(addPoster),
        });
      } catch (error) {
        console.error("Error loading top rated movies:", error);
        setError("Top rated movies are unavailable right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTopMovies();
  }, [apiUrl]);

  const scrollMovies = (ref, direction) => {
    ref.current?.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

  const openMovie = (movie) => {
    navigate(
      `/moviePage?title=${encodeURIComponent(movie.title)}&id=${encodeURIComponent(movie.imdbID)}`
    );
  };

  const sections = [
    {
      id: "imdb",
      title: "Top 10 IMDb rated movies",
      description: "Browse the highest IMDb rated films from the movie catalogue.",
      movies: topMovies.imdb,
      ratingField: "imdbRating",
      suffix: "",
      ref: imdbCarouselRef,
    },
    {
      id: "rotten-tomatoes",
      title: "Top 10 Rotten Tomatoes rated movies",
      description: "Discover films with the strongest Rotten Tomatoes scores.",
      movies: topMovies.rottenTomatoes,
      ratingField: "rottenTomatoesRating",
      suffix: "%",
      ref: rottenTomatoesCarouselRef,
    },
    {
      id: "metacritic",
      title: "Top 10 Metacritic rated movies",
      description: "Explore the top scoring films by Metacritic rating.",
      movies: topMovies.metacritic,
      ratingField: "metacriticRating",
      suffix: "",
      ref: metacriticCarouselRef,
    },
  ];

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>MovLookup</h1>
          <p>Search for movie details, ratings, cast, and critic scores.</p>
        </div>
      </section>

      {sections.map((section) => (
        <section className="top-rated-section" aria-labelledby={`${section.id}-title`} key={section.id}>
          <div className="top-rated-header">
            <div>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <p>{section.description}</p>
            </div>

            <div className="top-rated-controls" aria-label={`${section.title} carousel controls`}>
              <button type="button" onClick={() => scrollMovies(section.ref, -1)} aria-label={`Scroll ${section.title} left`}>
                <ChevronLeft size={24} />
              </button>
              <button type="button" onClick={() => scrollMovies(section.ref, 1)} aria-label={`Scroll ${section.title} right`}>
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {isLoading && <p className="top-rated-status">Loading top rated movies...</p>}
          {error && <p className="top-rated-status">{error}</p>}

          {!isLoading && !error && (
            <div className="top-rated-carousel" ref={section.ref}>
              {section.movies.map((movie, index) => (
                <article
                  className="top-movie-card"
                  key={`${section.id}-${movie.imdbID}`}
                  onClick={() => openMovie(movie)}
                >
                  <div className="top-movie-poster">
                    <span className="top-movie-rank">#{index + 1}</span>
                    {movie.poster && movie.poster !== "N/A" ? (
                      <img src={movie.poster} alt={`${movie.title} poster`} />
                    ) : (
                      <div className="top-movie-placeholder">
                        {movie.title?.slice(0, 1).toUpperCase() || "M"}
                      </div>
                    )}
                  </div>

                  <div className="top-movie-info">
                    <div className="top-movie-rating">
                      <Star aria-hidden="true" size={18} fill="currentColor" />
                      <span>{formatRating(movie[section.ratingField], section.suffix)}</span>
                    </div>
                    <h3>{movie.title}</h3>
                    <p>{movie.year || missingValue}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ))}
    </main>
  );
}
