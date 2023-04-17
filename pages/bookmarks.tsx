import { useState, useEffect } from "react";
import { Box, Text, IconButton } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { Bookmark } from "../types/index";
import { useRouter } from "next/router";

interface Props {
  toggleBookmark: (imdbID: string, removed?: boolean) => void;
}

const Bookmarks = ({ toggleBookmark }: Props) => {
  // initialize state variables
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Get all the bookmarks from localStorage
    const bookmarkKeys = Object.keys(localStorage).filter(key =>
      key.startsWith("bookmark_")
    );

    const bookmarks = bookmarkKeys.map(key => ({
      imdbID: key.split("_")[1],
      title: localStorage.getItem(`title_${key.split("_")[1]}`),
      year: localStorage.getItem(`year_${key.split("_")[1]}`),
    }));

    setBookmarks(bookmarks);
  }, [bookmarks]);

  const handleRemoveBookmark = (imdbID: string) => {
    localStorage.removeItem(`bookmark_${imdbID}`);
    localStorage.removeItem(`title_${imdbID}`);
    localStorage.removeItem(`year_${imdbID}`);

    setBookmarks(prevBookmarks =>
      prevBookmarks.filter(bookmark => bookmark.imdbID !== imdbID)
    );

    toggleBookmark(imdbID, true);
  };

  // navigate to movie details page
  const onBookmarkClick = (imdbID: string) => {
    console.log('onBookmarkClick', imdbID);
    // router.push(`/movie/${imdbID}`); // TODO: check why this isn't rendering the new page
    window.location.href = `/movie/${imdbID}`; // ! temporary hack
  }

  return (
    <Box>
      {bookmarks.length > 0 ? (
        bookmarks.map(movie => (
          <Box key={movie.imdbID} className="movie">
            <Text
              className="movie-title text-clickable"
              onClick={() => onBookmarkClick(movie.imdbID)}
            >
              {movie.title}
            </Text>
            <Text className="movie-year">{movie.year}</Text>
            <Box className="movie-bookmark">
              <IconButton
                aria-label="Remove from bookmarks"
                icon={<CloseIcon />}
                onClick={() => handleRemoveBookmark(movie.imdbID)}
              />
              <Text fontSize="xs" fontWeight="bold" color="gray.500" ml="1">
                Remove from bookmarks
              </Text>
            </Box>
          </Box>
        ))
      ) : (
          <Text color="lightgray">No bookmarks added</Text>
      )}
    </Box>
  );
};

export default Bookmarks;
