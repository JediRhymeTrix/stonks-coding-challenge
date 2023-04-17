import { useState } from "react";
import {
  Container,
  Input,
  Stack,
  Button,
  IconButton,
  Box,
  Text,
  Center,
  Spinner,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from "@chakra-ui/react";
import { SearchIcon, AddIcon, CheckIcon } from "@chakra-ui/icons";
import { Movie } from "../types/movie";
import Bookmarks from "./bookmarks";
import { Bookmark } from "../types/index";
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

  const toggleBookmark = (imdbID: string, removed?: boolean) => {
    const updatedMovies = movies.map((movie) => {
      if (movie.imdbID === imdbID) {
        const isBookmarked = !movie.isBookmarked;

        if (!removed) {
          localStorage.setItem(`bookmark_${imdbID}`, isBookmarked ? "1" : "0");
          localStorage.setItem(`title_${imdbID}`, movie.title);
          localStorage.setItem(`year_${imdbID}`, movie.year);

          // Add or remove the bookmark from the bookmarks array in local storage
          const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
          if (isBookmarked) {
            bookmarks.push({ imdbID, title: movie.title, year: movie.year });
          } else {
            const index = bookmarks.findIndex((bookmark: Bookmark) => bookmark.imdbID === imdbID);
            bookmarks.splice(index, 1);
          }
          localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        }

        return {
          ...movie,
          isBookmarked: removed ? false : isBookmarked,
        };
      }
      return movie;
    });
    setMovies(updatedMovies);
  };

  return (
    <Container maxW="container.xl">
      {/* header */}
      <Tabs isFitted>
        <TabList mb="4">
          <Tab className="tab">Search Movies</Tab>
          <Tab className="tab">Bookmarks</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {/* search input and button */}
            <Stack direction="row" spacing="4" mb="10">
              <Input
                className="search-input"
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
                className="search-button"
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
                <Spinner size="xl" />
              </Center>
            )}

            {/* movie results */}
            {!loading && (
              <>
                {movies.map((movie) => (
                  <Box key={movie.imdbID} className="movie">
                    <Text className="movie-title">{movie.title}</Text>
                    <Text className="movie-year">{movie.year}</Text>
                    <Box className="movie-bookmark">
                      <IconButton
                        aria-label={movie.isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                        icon={movie.isBookmarked ? <CheckIcon /> : <AddIcon />}
                        onClick={() => toggleBookmark(movie.imdbID)}
                      />
                      <Text fontSize="xs" fontWeight="bold" color="gray.500" ml="1">
                        {movie.isBookmarked ? "Bookmarked" : "Add to bookmarks"}
                      </Text>
                    </Box>
                  </Box>
                ))}

              </>
            )}
          </TabPanel>

          <TabPanel>
            {/* bookmarks */}
            <Bookmarks toggleBookmark={toggleBookmark} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* reset button */}
      <Button className="reset-button" onClick={() => {
        if (window.confirm('Are you sure you want to reset? This will delete ALL bookmarks, watched statuses and reviews.')) {
          localStorage.clear();
          setMovies([]);
        }
      }}>
        Reset
      </Button>

    </Container>
  );
};

export default IndexPage;
