// MovieCard.js – updated to display OMDb IMDb rating if available

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

function MovieCard({ movie }) {
    const navigate = useNavigate();

    return (
        <div className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)} style={{ cursor: 'pointer' }}>
            <h2>{movie.title}</h2>

            {movie.poster_path && (
                <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    alt={movie.title}
                />
            )}

            <p><strong>TMDb Rating:</strong> ⭐ {movie.rating}</p>

            {movie.extraRating && movie.extraRating !== 'N/A' && (
                <p><strong>IMDb Rating:</strong> 🎬 {movie.extraRating}</p>
            )}

            <p className="overview">{movie.overview || 'No description available.'}</p>

            {movie.trailerUrl ? (
                <iframe
                    src={movie.trailerUrl}
                    title={`${movie.title} Trailer`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            ) : (
                <p className="no-trailer">🚫 No trailer available</p>
            )}
        </div>
    );
}

export default MovieCard;
