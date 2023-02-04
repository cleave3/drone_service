import { agent as request } from "supertest";
import prisma, { DroneModel, MedicationModel } from "../modules";
import app from "../server";

const fakeSerial = "fake-serial";

const longSerial = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum`;

const drone1 = {
    serialNumber: "3b3a440c-4797-4e4d-ba98-7c43077898cf",
    model: "Middleweight",
    weightLimit: 200,
    batteryCapacity: 100,
};

const drone2 = {
    serialNumber: "b5d3ce36-41a8-4f1e-8fe7-cd9571927670",
    model: "Middleweight",
    weightLimit: 400,
    batteryCapacity: 90,
};

const lowBatteryDrone = {
    serialNumber: "b5d3c736-41a8-4f1e-8fe7-cd9571927670",
    model: "Middleweight",
    weightLimit: 400,
    batteryCapacity: 20,
};

const loadedDrone = {
    serialNumber: "b5d3c736-01a8-4f1e-86e7-cd9571927670",
    state: "LOADED",
    model: "Middleweight",
    weightLimit: 400,
    batteryCapacity: 20,
};

const med1 = {
    name: "PCM",
    code: "AAA_BBB_1",
    image: "image.png",
    weight: 100,
};

const med2 = {
    name: "PCM",
    code: "AAA_BBB_2",
    image: "image.png",
    weight: 100,
};

const med3 = {
    name: "PCM",
    code: "AAA_BBB_3",
    image: "image.png",
    weight: 300,
};

beforeAll(async () => {
    await prisma.$connect();
    await DroneModel.create({ data: drone1 });
    await DroneModel.create({ data: drone2 });
    await DroneModel.create({ data: lowBatteryDrone });
    await DroneModel.create({ data: loadedDrone });
});

afterAll(async () => {
    await MedicationModel.deleteMany();
    await DroneModel.deleteMany();
    await prisma.$disconnect();
});

const BASE_URL = "/api/drones";

describe("Drone Endpoints", () => {
    it("should not register a drone when model is empty", async () => {
        const res = await request(app).post(BASE_URL).send({});
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("model is required");
    });

    it("should not register a drone when model is is incorrect", async () => {
        const res = await request(app).post(BASE_URL).send({ model: "fake" });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("model must be one of Lightweight, Middleweight, Cruiserweight, Heavyweight");
    });
    it("should not register a drone when weightLimit is empty", async () => {
        const res = await request(app).post(BASE_URL).send({ model: drone1.model });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("weightLimit is required");
    });
    it("should not register a drone when weightLimit is empty", async () => {
        const res = await request(app).post(BASE_URL).send({ model: drone1.model, weightLimit: "test" });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("weightLimit must be a number");
    });

    it("should not register a drone when weightLimit is greater that the max", async () => {
        const res = await request(app).post(BASE_URL).send({ model: drone1.model, weightLimit: 600 });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("weightLimit must be between 1 - 500gr");
    });

    it("should not register a drone when batteryCapacity is empty", async () => {
        const res = await request(app)
            .post(BASE_URL)
            .send({ model: drone1.model, weightLimit: 100, batteryCapacity: "test" });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("batteryCapacity must be a number");
    });

    it("should not register a drone when batteryCapacity is greater that the max", async () => {
        const res = await request(app)
            .post(BASE_URL)
            .send({ model: drone1.model, weightLimit: 100, batteryCapacity: 120 });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("batteryCapacity must be between 0 - 100%");
    });

    it("should not register a drone with a serial number longer than 100 characters", async () => {
        const res = await request(app)
            .post(BASE_URL)
            .send({ ...drone1, serialNumber: longSerial });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual(`serialNumber must be less than 100 characters`);
    });

    it("should not register a drone with a duplicate serial number", async () => {
        const res = await request(app).post(BASE_URL).send(drone1);
        expect(res.statusCode).toEqual(409);
        expect(res.body.message).toEqual(`A drone with the serial NO. ${drone1.serialNumber} already exist`);
    });

    it("should register a drone with a corrent parameters", async () => {
        const res = await request(app)
            .post(BASE_URL)
            .send({ ...drone1, serialNumber: "" });
        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toEqual("success");
        expect(res.body.data.model).toEqual(drone1.model);
        expect(res.body.data).toHaveProperty("model");
    });

    it("should return a list of drones", async () => {
        const res = await request(app).get(BASE_URL);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual("success");
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should return a list of available drones", async () => {
        const res = await request(app).get(`${BASE_URL}/available`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual("success");
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should not register a drone with a duplicate serial number", async () => {
        const res = await request(app).post(BASE_URL).send(drone1);
        expect(res.statusCode).toEqual(409);
        expect(res.body.message).toEqual(`A drone with the serial NO. ${drone1.serialNumber} already exist`);
    });

    it("should return a drone with the specified serial number", async () => {
        const res = await request(app).get(`${BASE_URL}/${drone1.serialNumber}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual("success");
        expect(res.body.data).toBeTruthy();
        expect(res.body.data.serialNumber).toEqual(drone1.serialNumber);
    });

    it("should return 404 when a wrong serial number is submitted", async () => {
        const res = await request(app).get(`${BASE_URL}/${fakeSerial}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual(`No drone with ${fakeSerial} was found`);
    });

    it("should return drone battery level", async () => {
        const res = await request(app).get(`${BASE_URL}/battery/${drone1.serialNumber}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual(`success`);
        expect(res.body.data).toBeTruthy();
        expect(res.body.data.batteryCapacity).toEqual(drone1.batteryCapacity);
    });

    it("should not load item if drone is less than 25%", async () => {
        const res = await request(app).patch(`${BASE_URL}/load/${lowBatteryDrone.serialNumber}`).send(med1);
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual(false);
        expect(res.body.message).toEqual(`Drone battery is too low`);
        expect(res.body.data).toBeFalsy();
    });

    it("should not load item if drone is not in idle or loading state", async () => {
        const res = await request(app).patch(`${BASE_URL}/load/${loadedDrone.serialNumber}`).send(med2);
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual(false);
        expect(res.body.message).toEqual(`Drone is no longer available for loading`);
        expect(res.body.data).toBeFalsy();
    });

    it("should not load item if weight exceed drone weight limit", async () => {
        const res = await request(app).patch(`${BASE_URL}/load/${drone1.serialNumber}`).send(med3);
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual(false);
        expect(res.body.data).toBeFalsy();
    });

    it("should not load item if name of the item does not match specifications", async () => {
        const res = await request(app)
            .patch(`${BASE_URL}/load/${drone1.serialNumber}`)
            .send({ ...med2, name: "hbjhbsh?" });
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual(false);
        expect(res.body.message).toEqual("Invalid character for name. only letters, numbers, ‘-‘, ‘_’ is allowed");
        expect(res.body.data).toBeFalsy();
    });

    it("should not load item if code of the item does not match specifications", async () => {
        const res = await request(app)
            .patch(`${BASE_URL}/load/${drone1.serialNumber}`)
            .send({ ...med2, code: "hbjhbsh?" });
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual(false);
        expect(res.body.message).toEqual(
            "Invalid character for code. only upper case letters, underscore and numbers is allowed"
        );
        expect(res.body.data).toBeFalsy();
    });

    it("should successfully add item to drone", async () => {
        const res = await request(app).patch(`${BASE_URL}/load/${drone1.serialNumber}`).send(med1);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBeTruthy();
    });

    it("should not load item if drone is will exceed max weight limit", async () => {
        const res = await request(app).patch(`${BASE_URL}/load/${drone1.serialNumber}`).send(med3);
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual(false);
    });

    it("should sucessfully set drone state to LOADING", async () => {
        const res = await request(app).patch(`${BASE_URL}/state/${drone2.serialNumber}`).send({ state: "LOADING" });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBeTruthy();
    });

    it("should set drone to the same state", async () => {
        const res = await request(app).patch(`${BASE_URL}/state/${drone1.serialNumber}`).send({ state: "LOADING" });
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual(false);
    });

    it("should set drone state when state is empty", async () => {
        const res = await request(app).patch(`${BASE_URL}/state/${drone1.serialNumber}`).send({ state: "" });
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual(false);
        expect(res.body.message).toEqual(`state is required`);
    });

    it("should set drone state when state does not match specification", async () => {
        const res = await request(app).patch(`${BASE_URL}/state/${drone1.serialNumber}`).send({ state: "test" });
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual(false);
        expect(res.body.message).toEqual(
            `state must be one of IDLE, LOADING, LOADED, DELIVERING, DELIVERED, RETURNING`
        );
    });
});
