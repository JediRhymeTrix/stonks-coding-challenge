import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Movie } from '../../types/movie';

export const getServerSideProps = async () => {
  return {
    props: {},
  }
}

const MovieDetails = () => {
  const [review, setReview] = useState('');
  const router = useRouter();
  const { id } = router.query;

  const handleBack = () => {
    router.back();
  };

  // Memoize the movie details so that we don't have to fetch them again
  const movie = useMemo<Movie>(() => {
    if (typeof window !== 'undefined') {
      const storedMovie = localStorage.getItem(`movie_${id}`);
      if (storedMovie) {
        return JSON.parse(storedMovie);
      }
    }
    return undefined;
  }, [id]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      const res = await fetch(`/api/movie/${id}`);
      const data = await res.json();
      localStorage.setItem(`movie_${id}`, JSON.stringify(data));
    };

    // only fetch details if they haven't been fetched already
    if (!movie || Object.keys(movie).length === 0) {
      fetchMovieDetails();
    }

    // fetch review from localStorage
    const storedReview = localStorage.getItem(`review_${movie.imdbID}`);
    if (storedReview) {
      setReview(storedReview);
    }

  }, [id, movie]);

  const handleReviewChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReview(event.target.value);
    localStorage.setItem(`review_${id}`, event.target.value);
  };

  if (!movie) {
    return <div>Loading...</div>;
  }

  return (
    <div className="movie-details" suppressHydrationWarning={true}>
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
