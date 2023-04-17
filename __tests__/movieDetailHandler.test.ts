import { NextApiRequest, NextApiResponse } from "next";
import movieDetailHandler from "../pages/api/movie/[id]";
import { sendErrorResponse } from "../utils/apiUtils";
import axios from "axios";
import nock from "nock";

jest.mock("../utils/apiUtils", () => ({
    sendErrorResponse: jest.fn(),
}));

// Mock the external API using Nock
const mockApi = nock("https://movie-database-alternative.p.rapidapi.com")
    .get("/")
    .query(params => {
        return params.i === "tt4154796" && params.r === "json";
    })
    .reply(200, {
        Response: "True",
        imdbID: "tt4154796",
        Title: "Avengers: Endgame",
        Year: "2019",
        Poster: "https://example.com/poster.jpg",
        Plot: "Plot summary goes here.",
    })
    .get("/")
    .query(params => {
        return params.i !== "tt4154796" && params.r === "json";
    })
    .reply(404, {
        Response: "False",
        Error: "Movie not found!",
    });

describe("movieDetailHandler", () => {
    let req: Partial<NextApiRequest>;
    let res: Partial<NextApiResponse>;

    beforeEach(() => {
        req = {
            query: { id: "tt4154796" },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should return an error response with status 400 if id is not provided", async () => {
        req.query = {};
        await movieDetailHandler(req as NextApiRequest, res as NextApiResponse);

        expect(sendErrorResponse).toHaveBeenCalledWith(
            res,
            400,
            "Invalid movie ID"
        );
    });

    it("should return an error response with status 400 if id is not a string", async () => {
        // @ts-ignore
        req.query = { id: 123 };
        await movieDetailHandler(req as NextApiRequest, res as NextApiResponse);

        expect(sendErrorResponse).toHaveBeenCalledWith(
            res,
            400,
            "Invalid movie ID"
        );
    });

    it("should return an error response with status 400 if id is an empty string", async () => {
        req.query = { id: "" };
        await movieDetailHandler(req as NextApiRequest, res as NextApiResponse);

        expect(sendErrorResponse).toHaveBeenCalledWith(
            res,
            400,
            "Invalid movie ID"
        );
    });

    it("should return an error response with status 404 if movie is not found", async () => {
        req.query = { id: "Nonexistent Movie" };

        jest.spyOn(axios, "get").mockResolvedValue({
            data: { Response: "False" },
        });

        await movieDetailHandler(req as NextApiRequest, res as NextApiResponse);

        expect(sendErrorResponse).toHaveBeenCalledWith(
            res,
            404,
            "Movie not found"
        );
    });

    it("should return the movie details if search is successful", async () => {
        const response = {
            data: {
                Response: "True",
                imdbID: "tt4154796",
                Title: "Avengers: Endgame",
                Year: "2019",
                Poster: "https://example.com/poster.jpg",
                Plot: "Plot summary goes here.",
            },
        };
        jest.spyOn(axios, "get").mockResolvedValue(response);

        await movieDetailHandler(req as NextApiRequest, res as NextApiResponse);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            imdbID: "tt4154796",
            title: "Avengers: Endgame",
            year: "2019",
            posterUrl: "https://example.com/poster.jpg",
            plot: "Plot summary goes here.",
        });
    });

    it("should return an error response with status 500 if an error occurs", async () => {
        (axios.get as jest.Mock).mockRejectedValue(new Error("Some error"));

        await movieDetailHandler(req as NextApiRequest, res as NextApiResponse);

        expect(sendErrorResponse).toHaveBeenCalledWith(
            res,
            500,
            "Internal server error"
        );
    });
});
