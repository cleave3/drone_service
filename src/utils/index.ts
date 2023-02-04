import fs from "fs";
import { randomUUID } from "crypto";
import { Response } from "express";

const handleCode = (code: number) => {
    if (code > 500 || !code) return 500;

    return code;
};

export const successResponse = (res: Response, code: number, data: any = null, message = "success") => {
    code = handleCode(code);
    return res.status(code).json({ status: true, code, message, data });
};

export const badRequest = (res: Response, code: number, message: string) => {
    code = handleCode(code);
    return res.status(code).json({ status: false, code, message, data: null });
};

export const throwError = (message: string, code = 400) => {
    throw { code, message };
};

export const genUUID = () => randomUUID();

export const trimWhiteSpaces = (str: string = "") => {
    return str?.replaceAll(/\s/g, "");
};

export const logEvent = (data: Record<string, string>) => {
    let result = "";

    for (const [key, value] of Object.entries(data)) {
        result += `${key}:  ${value},\n`;
    }

    result += `--------\n`

    console.log(JSON.stringify(data));

    fs.appendFileSync("events_log.txt", result, { encoding: "utf8" });
};
