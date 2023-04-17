import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Movie } from '../../types/movie';

const MovieDetails = () => {
  const [review, setReview] = useState('');
  const [movie, setMovieDetails] = useState<Movie>();

  const router = useRouter();
  const { id } = router.query;

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      const res = await fetch(`/api/movie/${id}`);
      const data = await res.json();
      setMovieDetails(data);

      const storedReview = localStorage.getItem(`review_${data.imdbID}`);
      if (storedReview) {
        setReview(storedReview);
      }
    };
    fetchMovieDetails();
  }, [id]);

  if (!movie) {
    return <div>Loading...</div>;
  }

  const handleReviewChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReview(event.target.value);
    localStorage.setItem(`review_${movie.imdbID}`, event.target.value);
  };

  return (
    <div className="movie-details">
      <button onClick={handleBack}>Back</button>
      <h1>{movie.title} ({movie.year})</h1>
      <a href={`https://www.imdb.com/title/${movie.imdbID}`} target="_blank" rel="noopener noreferrer">
        <img src={movie.posterUrl} alt={movie.title} />
      </a>
      <p>Runtime: {movie.runtime}</p>
      <p><strong>Plot:</strong> {movie.plot}</p>
      <label htmlFor="review">Review</label>
      <textarea
        value={review}
        onChange={handleReviewChange}
        placeholder="Type your review here. Changes will save as you type..."
      />
    </div>
  );
};

export default MovieDetails;
