import { useState } from "react";
import { Container, Heading, Input, Stack, Button, Box, Text } from "@chakra-ui/react";
import { Movie } from "../types/movie";

const IndexPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [movies, setMovies] = useState<Movie[]>([]);

  const handleSearch = async () => {
    const response = await fetch(`/api/search?query=${searchQuery}`);
    const moviesData = await response.json();
    setMovies(moviesData);
  };

  return (
    <Container maxW="container.xl">
      <Heading as="h1" my="8">
        Movie Search
      </Heading>
      <Stack direction="row" spacing="4" mb="8">
        <Input
          placeholder="Enter movie name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </Stack>
      {movies.length > 0 ? (
        <Stack>
          {movies.map((movie) => (
            <Box key={movie.imdbId}>
              <Heading as="h3" size="md">
                {movie.title}
              </Heading>
              <Text>{movie.year}</Text>
            </Box>
          ))}
        </Stack>
      ) : null}
    </Container>
  );
};

export default IndexPage;

