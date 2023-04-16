import { NextApiRequest, NextApiResponse } from "next";
import searchHandler from "../pages/api/search";
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
        return (
            params.s === "Avengers Endgame" &&
            params.r === "json" &&
            params.page === "1"
        );
    })
    .reply(200, {
        Response: "True",
        Search: [
            {
                imdbID: "tt4154796",
                Title: "Avengers: Endgame",
                Year: "2019",
                Poster: "https://example.com/poster.jpg",
            },
        ],
    })
    .get("/")
    .query(params => {
        return (
            params.s !== "Avengers Endgame" &&
            params.r === "json" &&
            params.page === "1"
        );
    })
    .reply(404, {
        Response: "False",
        Error: "Movie not found!",
    });

describe("searchHandler", () => {
    let req: Partial<NextApiRequest>;
    let res: Partial<NextApiResponse>;

    beforeEach(() => {
        req = {
            query: { query: "Avengers Endgame" },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should return an error response with status 400 if query is not provided", async () => {
        req.query = {};
        await searchHandler(req as NextApiRequest, res as NextApiResponse);

        expect(sendErrorResponse).toHaveBeenCalledWith(
            res,
            400,
            "Invalid search query"
        );
    });

    it("should return an error response with status 400 if query is not a string", async () => {
        // @ts-ignore
        req.query = { query: 123 };
        await searchHandler(req as NextApiRequest, res as NextApiResponse);

        expect(sendErrorResponse).toHaveBeenCalledWith(
            res,
            400,
            "Invalid search query"
        );
    });

    it("should return an error response with status 400 if query is an empty string", async () => {
        req.query = { query: "" };
        await searchHandler(req as NextApiRequest, res as NextApiResponse);

        expect(sendErrorResponse).toHaveBeenCalledWith(
            res,
            400,
            "Invalid search query"
        );
    });

    it("should return an error response with status 404 if movie is not found", async () => {
        req.query = { query: "Nonexistent Movie" };

        jest.spyOn(axios, "get").mockResolvedValue({
            data: { Response: "False" },
        });

        await searchHandler(req as NextApiRequest, res as NextApiResponse);

        expect(sendErrorResponse).toHaveBeenCalledWith(
            res,
            404,
            "Movie not found"
        );
    });

    it("should return a list of movies if search is successful", async () => {
        const response = {
            data: {
                Response: "True",
                Search: [
                    {
                        imdbID: "tt4154796",
                        Title: "Avengers: Endgame",
                        Year: "2019",
                        Poster: "https://example.com/poster.jpg",
                    },
                ],
            },
        };
        jest.spyOn(axios, "get").mockResolvedValue(response);

        await searchHandler(req as NextApiRequest, res as NextApiResponse);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            {
                imdbID: "tt4154796",
                title: "Avengers: Endgame",
                year: "2019",
                posterUrl: "https://example.com/poster.jpg",
            },
        ]);
    });

    it("should return an error response with status 500 if an error occurs", async () => {
        (axios.get as jest.Mock).mockRejectedValue(new Error("Some error"));

        await searchHandler(req as NextApiRequest, res as NextApiResponse);

        expect(sendErrorResponse).toHaveBeenCalledWith(
            res,
            500,
            "Internal server error"
        );
    });
});
