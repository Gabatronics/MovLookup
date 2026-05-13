# MovLookup

[Live project](https://mov-lookup.vercel.app)

MovLookup is a React movie discovery app built for searching, comparing, and exploring movie data. The app gives users a fast way to browse films, inspect detailed ratings, view cast and crew information, and explore actor/crew analytics through charts.

## Project Highlights

- Built a responsive React single-page application with Vite and React Router.
- Integrated a remote movie API for search results, movie details, people lookup, authentication, and token refresh flows.
- Implemented an interactive movie search table with AG Grid, server-backed pagination, filtering, sorting, and row preview details.
- Designed top-rated movie carousels for IMDb, Rotten Tomatoes, and Metacritic rankings.
- Added detailed movie pages with posters, ratings, overview, box office data, cast/crew tables, and IMDb links.
- Added authenticated people lookup with credit history, role breakdowns, and rating analytics using Chart.js.
- Created login, registration, logout, and local token handling for protected API routes.

## Tech Stack

- React 19
- Vite
- React Router
- AG Grid
- Chart.js and react-chartjs-2
- Bootstrap / Reactstrap
- Lucide React icons
- Vercel deployment

## Features

### Movie Discovery

Users can search movies by title and year, sort results by title, year, or IMDb rating, and preview selected movies directly beside the results table.

### Movie Details

Each movie page displays key metadata, poster artwork, IMDb, Rotten Tomatoes, and Metacritic ratings, plot overview, quick facts, cast and crew credits, and external IMDb links.

### People Analytics

Logged-in users can search for people by IMDb ID and view their credits, role categories, average ratings, rating distribution, and top-rated works.

### Authentication

The app supports registration, login, logout, bearer token storage, refresh token handling, and protected people lookup requests.

## Getting Started

### Prerequisites

- Node.js
- npm
- Access to the movie API used by the project

### Installation

```bash
npm install
```

Create a `.env` file in the project root:

```bash
VITE_MOVIE_API_URL=https://moviesapi-production-ea55.up.railway.app
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment Notes

This project is deployed on Vercel. Because Vite exposes client-side environment variables at build time, the API URL must be configured in Vercel as:

```bash
VITE_MOVIE_API_URL=https://moviesapi-production-ea55.up.railway.app
```

After changing this value in Vercel, redeploy the project so the production bundle receives the updated API URL.

## Project Structure

```text
src/
  assets/       Image assets and rating icons
  components/   Header, navigation, and footer
  pages/        Home, movies, movie details, people lookup, login, and register pages
  styles/       Page-specific CSS
```

## What I Focused On

This project demonstrates practical frontend engineering skills: API integration, authenticated requests, data-heavy UI design, client-side routing, responsive layouts, reusable formatting helpers, and production deployment with environment configuration.
