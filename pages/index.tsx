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
import { SearchIcon } from "@chakra-ui/icons";
import { Movie } from "../types/movie";
import debounce from "lodash/debounce";

const IndexPage = () => {
  // initialize state variables
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  // debounce the handleSearch function to reduce API calls
  const debouncedHandleSearch = debounce(async () => {
    setLoading(true);
    const response = await fetch(`/api/search?query=${searchQuery}`);
    const moviesData = await response.json();
    setMovies(moviesData);
    setLoading(false);
  }, 500);

  // handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 3) {
      debouncedHandleSearch();
    } else {
      setMovies([]);
    }
  };

  // handle enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // handle search button click
  const handleSearch = async () => {
    setLoading(true);
    const response = await fetch(`/api/search?query=${searchQuery}`);
    const moviesData = await response.json();
    setMovies(moviesData);
    setLoading(false);
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
            <Box
              key={movie.imdbId}
              p="5"
              rounded="md"
              boxShadow="md"
              _hover={{ bg: "gray.100" }}
            >
              <Heading as="h3" size="md">
                {movie.title}
              </Heading>
              <Text color="gray.500">{movie.year}</Text>
            </Box>
          ))}
        </Stack>
      ) : null}
    </Container>
  );
};

export default IndexPage;
