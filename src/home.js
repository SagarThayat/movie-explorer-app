// Home.js – with YouTube + TMDb trailer fallback support

import React, { useEffect, useState } from 'react';
import './App.css';
import MovieCard from './component/MovieCard';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY;
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const [movies, setMovies] = useState([]);
    const [recentSearches, setRecentSearches] = useState(() => {
        return JSON.parse(localStorage.getItem('recentSearches')) || [];
    });
    const [theme, setTheme] = useState('dark');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchTrendingMovies();
    }, []);

    useEffect(() => {
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }, [recentSearches]);

    const fetchTrendingMovies = async () => {
        const res = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        const result = await enrichMovies(data.results);
        setMovies(result);
        setTotalPages(1);
    };

    const searchMovies = async (pageNumber = 1) => {
        if (!searchTerm.trim()) return;

        if (!recentSearches.includes(searchTerm)) {
            const updated = [searchTerm, ...recentSearches.filter(t => t !== searchTerm)].slice(0, 5);
            setRecentSearches(updated);
        }

        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${searchTerm}&page=${pageNumber}`);
        const data = await res.json();
        const result = await enrichMovies(data.results);

        setMovies(result);
        setPage(pageNumber);
        setTotalPages(data.total_pages);
    };

    const enrichMovies = async (movies) => {
        return await Promise.all(movies.map(async (movie) => {
            const trailerUrl = await fetchTrailer(movie.title, movie.id);
            const extraRating = await fetchOMDbRating(movie.title);

            return {
                id: movie.id,
                title: movie.title,
                overview: movie.overview,
                rating: movie.vote_average,
                poster_path: movie.poster_path,
                trailerUrl,
                extraRating
            };
        }));
    };

    const fetchTrailer = async (title, tmdbId) => {
        try {
            const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(title + ' official trailer')}&key=${YOUTUBE_API_KEY}&type=video&maxResults=1`);
            const ytData = await ytRes.json();
            if (ytData.items?.[0]?.id?.videoId) {
                return `https://www.youtube.com/embed/${ytData.items[0].id.videoId}`;
            }
        } catch (err) {
            console.warn("YouTube trailer fetch failed:", err);
        }

        try {
            const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}`);
            const tmdbData = await tmdbRes.json();
            const fallbackTrailer = tmdbData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            return fallbackTrailer ? `https://www.youtube.com/embed/${fallbackTrailer.key}` : null;
        } catch (err) {
            console.warn("TMDb trailer fallback failed:", err);
            return null;
        }
    };

    const fetchOMDbRating = async (title) => {
        try {
            const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}`);
            const data = await res.json();
            return data.imdbRating || 'N/A';
        } catch {
            return 'N/A';
        }
    };

    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    const handlePageChange = (next) => {
        const newPage = next ? page + 1 : page - 1;
        if (newPage >= 1 && newPage <= totalPages) {
            searchMovies(newPage);
        }
    };

    return (
        <div className={`App ${theme}`}>
            <header className="App-header">
                <h1>🎬 Movie Explorer</h1>
                <div className="controls">
                    <input
                        type="text"
                        placeholder="Search movie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={() => searchMovies(1)} className="search-btn">Search</button>
                    <button onClick={toggleTheme} className="toggle-btn">
                        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                </div>

                {recentSearches.length > 0 && (
                    <div className="recent">
                        <h3>Recent Searches</h3>
                        <button className="clear-btn" onClick={() => setRecentSearches([])}>🗑️ Clear</button>
                        <div className="recent-tags">
                            {recentSearches.map((term, i) => (
                                <span key={i} onClick={() => { setSearchTerm(term); searchMovies(1); }}>{term}</span>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            <div className="movie-list">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))
                ) : (
                    <p>No movies found</p>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => handlePageChange(false)} disabled={page === 1}>◀ Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button onClick={() => handlePageChange(true)} disabled={page === totalPages}>Next ▶</button>
                </div>
            )}
        </div>
    );
}

export default Home;
