import { useState } from "react";
import {
  Container,
  Heading,
  Input,
  Stack,
  Button,
  Box,
  Text,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { SearchIcon, StarIcon } from "@chakra-ui/icons";
import { Movie } from "../types/movie";
import debounce from "lodash/debounce";

const IndexPage = () => {
  // initialize state variables
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  // search function that handles the API call and bookmarks
  const searchMovies = async (query: string) => {
    setLoading(true);
    const response = await fetch(`/api/search?query=${query}`);
    const moviesData = await response.json();
    const bookmarks = Object.keys(localStorage)
      .filter((key) => key.startsWith("bookmark_"))
      .map((key) => ({
        imdbID: key.split("_")[1],
        isBookmarked: localStorage.getItem(key) === "1",
      }));
    const moviesWithBookmark = Array.isArray(moviesData)
      ? moviesData.map((movie: Movie) => {
        // Check if the movie is already bookmarked
        const bookmark = bookmarks.find((b) => b.imdbID === movie.imdbID);
        const isBookmarked = bookmark ? bookmark.isBookmarked : false;
        return {
          ...movie,
          isBookmarked,
        };
      })
      : [];
    setMovies(moviesWithBookmark);
    setLoading(false);
  };


  // debounce the search function to reduce API calls
  const debouncedSearchMovies = debounce(searchMovies, 500);

  // handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 3) {
      debouncedSearchMovies(e.target.value);
    } else {
      setMovies([]);
    }
  };

  // handle enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      debouncedSearchMovies.cancel();
      searchMovies(searchQuery);
    }
  };

  // handle search button click
  const handleSearch = () => {
    debouncedSearchMovies.cancel();
    searchMovies(searchQuery);
  };

  const toggleBookmark = (imdbID: string) => {
    const updatedMovies = movies.map((movie) => {
      if (movie.imdbID === imdbID) {
        const isBookmarked = !movie.isBookmarked;
        localStorage.setItem(`bookmark_${imdbID}`, isBookmarked ? "1" : "0");
        return {
          ...movie,
          isBookmarked,
        };
      }
      return movie;
    });
    setMovies(updatedMovies);
  };


  return (
    <Container maxW="container.xl">
      {/* search heading */}
      <Center mb="10">
        <Heading as="h1" fontSize="6xl">
          Movie Search
        </Heading>
      </Center>

      {/* search input and button */}
      <Stack direction="row" spacing="4" mb="10">
        <Input
          placeholder="Enter movie name"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          size="lg"
          fontSize="xl"
          fontWeight="bold"
          rounded="none"
          borderWidth="0"
          boxShadow="md"
          focusBorderColor="purple.500"
        />
        <Button
          leftIcon={<SearchIcon />}
          onClick={handleSearch}
          isLoading={loading}
          size="lg"
          fontSize="xl"
          fontWeight="bold"
          rounded="none"
          colorScheme="purple"
          boxShadow="md"
          _hover={{ bg: "purple.500" }}
        >
          Search
        </Button>
      </Stack>

      {/* loading spinner */}
      {loading && (
        <Center>
          <Spinner size="xl" color="purple.500" />
        </Center>
      )}

      {/* display search results */}
      {!loading && movies.length > 0 ? (
        <Stack>
          {movies.map((movie) => (
            <Box key={movie.imdbID}>
              <Heading as="h3" size="md">
                {movie.title}
              </Heading>
              <Text>{movie.year}</Text>
              <Button
                size="sm"
                onClick={() => toggleBookmark(movie.imdbID)}
                colorScheme={movie.isBookmarked ? "green" : "gray"}
                leftIcon={<StarIcon color={movie.isBookmarked ? "green.500" : "gray.500"} />}
              >
                {movie.isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>

            </Box>
          ))}
          {/* button to quickly reset bookmarks */}
          <Button onClick={() => {
            localStorage.clear();
            setMovies([]);
          }}>
            Reset
          </Button>
        </Stack>
      ) : null}
    </Container>
  );
};

export default IndexPage;
