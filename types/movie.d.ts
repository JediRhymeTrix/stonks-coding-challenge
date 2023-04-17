interface Movie {
    id: number;
    title: string;
    year: string;
    runtime: string;
    genres: string[];
    director: string;
    actors: string;
    plot: string;
    posterUrl: string;
    imdbRating: string;
    imdbID: string;
    isBookmarked: boolean;
}

interface MovieSearchResult {
    imdbID: string;
    title: string;
    posterUrl: string;
}

export type { Movie, MovieSearchResult };
