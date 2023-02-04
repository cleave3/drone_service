import { NextFunction, Request, Response } from "express";
import { badRequest } from "../utils";

export default (schema: (args: Request) => void) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema(req);
        next();
    } catch ({ code, message }) {
        return badRequest(res, code, message);
    }
}