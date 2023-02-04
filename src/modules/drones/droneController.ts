import { Request, Response } from "express";
import { badRequest, successResponse } from "../../utils";
import DroneService from "./droneService";
import { DroneInput, DroneState } from "./types";

export default class DroneController {
    static async register({ body }: Request, res: Response) {
        try {
            const result = await DroneService.registerDrone(body);
            return successResponse(res, 201, result);
        } catch ({ message, code }) {
            return badRequest(res, code, message);
        }
    }

    static async getDrones({ query: { model, state } }: Request, res: Response) {
        try {
            const result = await DroneService.getDrones(state as DroneState, model as DroneInput["model"]);
            return successResponse(res, 200, result);
        } catch ({ message, code }) {
            return badRequest(res, code, message);
        }
    }

    static async getDroneBySerialNumber({ params: { serialNumber } }: Request, res: Response) {
        try {
            const result = await DroneService.getDroneBySerialNumber(serialNumber);
            return successResponse(res, 200, result);
        } catch ({ message, code }) {
            return badRequest(res, code, message);
        }
    }

    static async getAvailableDrones(_: Request, res: Response) {
        try {
            const result = await DroneService.checkAvailableDroneForLoading();
            return successResponse(res, 200, result);
        } catch ({ message, code }) {
            return badRequest(res, code, message);
        }
    }

    static async checkDroneBatteryLevel({ params: { serialNumber } }: Request, res: Response) {
        try {
            const result = await DroneService.checkBatteryLevel(serialNumber);
            return successResponse(res, 200, result);
        } catch ({ message, code }) {
            return badRequest(res, code, message);
        }
    }

    static async loadDrone({ params: { serialNumber }, body }: Request, res: Response) {
        try {
            const result = await DroneService.loadItemToDrone(serialNumber, body);
            return successResponse(res, 200, null, result);
        } catch ({ message, code }) {
            return badRequest(res, code, message);
        }
    }

    static async updateDroneState({ params: { serialNumber }, body: { state } }: Request, res: Response) {
        try {
            const result = await DroneService.updateDroneState(serialNumber, state);
            return successResponse(res, 200, result);
        } catch ({ message, code }) {
            return badRequest(res, code, message);
        }
    }
}
