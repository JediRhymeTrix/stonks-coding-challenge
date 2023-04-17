import { NextApiRequest, NextApiResponse } from "next";
import { sendErrorResponse } from "../../../utils/apiUtils";
import axios, { AxiosError } from "axios";
import { Movie } from "../../../types/movie";

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

// Handler for movie details API requests
const movieDetailHandler = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { id } = req.query;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
        sendErrorResponse(res, 400, "Invalid movie ID");
        return;
    }

    try {
        // Make request to RapidAPI
        const { data } = await rapidApiAxios.get("/", {
            params: {
                i: id,
                r: "json",
                plot: "full", // include plot summary
            },
        });

        // Check if the response was successful
        if (data.Response === "False") {
            sendErrorResponse(res, 404, "Movie not found");
            return;
        }

        // Format the movie details
        const movieDetail: Partial<Movie> = {
            imdbID: data.imdbID,
            title: data.Title,
            year: data.Year,
            runtime: data.Runtime,
            posterUrl: data.Poster,
            plot: data.Plot,
        };

        res.status(200).json(movieDetail);
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

export default movieDetailHandler;
