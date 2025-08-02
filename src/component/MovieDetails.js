import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_KEY = 'b71630fc8117d6ca094c0dc6b81a1e55';

function MovieDetails() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);

    useEffect(() => {
        const fetchMovie = async () => {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=videos`);
            const data = await res.json();
            setMovie(data);
        };

        const fetchCast = async () => {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`);
            const data = await res.json();
            setCast(data.cast.slice(0, 10)); // top 10 cast members
        };

        fetchMovie();
        fetchCast();
    }, [id]);

    if (!movie) return <p>Loading movie details...</p>;

    const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    return (
        <div className="movie-details">
            <h1>{movie.title}</h1>
            <img src={`https://image.tmdb.org/t/p/w400${movie.poster_path}`} alt={movie.title} />
            <p><strong>Overview:</strong> {movie.overview}</p>
            <p><strong>Genres:</strong> {movie.genres.map(g => g.name).join(', ')}</p>
            <p><strong>Release Date:</strong> {movie.release_date}</p>
            <p><strong>Runtime:</strong> {movie.runtime} min</p>

            <h2>🎭 Cast</h2>
            <ul>
                {cast.map(actor => (
                    <li key={actor.cast_id}>
                        {actor.name} as <em>{actor.character}</em>
                    </li>
                ))}
            </ul>

            {trailer ? (
                <div>
                    <h3>🎬 Trailer</h3>
                    <iframe
                        width="560"
                        height="315"
                        src={`https://www.youtube.com/embed/${trailer.key}`}
                        frameBorder="0"
                        allowFullScreen
                        title="Trailer"
                    ></iframe>
                </div>
            ) : (
                <p>🚫 No trailer available</p>
            )}
        </div>
    );
}

export default MovieDetails;
