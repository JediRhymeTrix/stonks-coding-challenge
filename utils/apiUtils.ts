import { NextApiResponse } from "next";

export const sendErrorResponse = (
    res: NextApiResponse,
    statusCode: number,
    message: string
) => {
    res.status(statusCode).json({ error: message });
};
