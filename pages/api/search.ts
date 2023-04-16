import { NextApiRequest, NextApiResponse } from "next";
import { sendErrorResponse } from "../../utils/apiUtils";
import axios, { AxiosError } from "axios";
import { MovieSearchResult } from "../../types/movie";

// Use dotenv to load environment variables from .env file
require("dotenv").config({
    path: ".env.local",
});

// Extract environment variables
const { RAPIDAPI_HOST, RAPIDAPI_KEY } = process.env;

// Ensure required environment variables are set
if (!RAPIDAPI_HOST || !RAPIDAPI_KEY) {
    console.error("Missing environment variables");
    process.exit(1);
}

// Axios instance for making requests to RapidAPI
const rapidApiAxios = axios.create({
    baseURL: "https://movie-database-alternative.p.rapidapi.com/",
    headers: {
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "X-RapidAPI-Key": RAPIDAPI_KEY,
    },
});

// Handler for search API requests
const searchHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req.query;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
        sendErrorResponse(res, 400, "Invalid search query");
        return;
    }

    try {
        // Make request to RapidAPI
        const { data } = await rapidApiAxios.get("/", {
            params: {
                s: query,
                r: "json",
                page: "1",
            },
        });

        // Check if the response was successful
        if (data.Response === "False") {
            sendErrorResponse(res, 404, "Movie not found");
            return;
        }

        // Parse and format the search results
        const searchResults: MovieSearchResult[] = data.Search.map(
            (result: any) => ({
                imdbID: result.imdbID,
                title: result.Title,
                year: result.Year,
                posterUrl: result.Poster,
            })
        );

        res.status(200).json(searchResults);
    } catch (error) {
        console.log(error);
        // Handle errors
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;

            console.error(
                `Error ${axiosError.response?.status} - ${axiosError.response?.statusText}`
            );

            if (axiosError.response?.status === 404) {
                sendErrorResponse(res, 404, "Movie not found");
                return;
            }
        } else {
            console.error(error);
        }

        sendErrorResponse(res, 500, "Internal server error");
    }
};

export default searchHandler;
