import prisma from "../modules";
import { agent as request } from "supertest";
import app from "../server";

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("App Entry", () => {
    it("Should return a status code of 200", async () => {
        const res = await request(app).get("/api");
        expect(res.statusCode).toEqual(200);
    });

    it("Should return a status code of 404 when route does not exist", async () => {
        const res = await request(app).get("/api/bad-route");
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty("message", "Route Not found");
    });
});
