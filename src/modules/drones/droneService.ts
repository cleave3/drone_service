import { Drone, Medication } from "@prisma/client";
import { DroneModel, MedicationModel } from "..";
import { genUUID, throwError, trimWhiteSpaces } from "../../utils";
import { NEXT_STATE_MAP } from "../../utils/constants";
import { DroneInput, DroneState, MedicationInput } from "./types";

export default class DroneService {
    static async registerDrone(data: DroneInput): Promise<Drone> {
        let serialNumber = trimWhiteSpaces(data?.serialNumber);

        if (serialNumber) {
            const droneExist = await DroneModel.findUnique({ where: { serialNumber } });

            if (droneExist) throwError(`A drone with the serial NO. ${serialNumber} already exist`, 409);
        }

        const drone = await DroneModel.create({
            data: {
                ...data,
                serialNumber: trimWhiteSpaces(serialNumber) || genUUID(),
                weightLimit: Number(data.weightLimit),
                batteryCapacity: Number(data.batteryCapacity || 100),
            },
        });

        return drone;
    }

    static async getDrones(state?: DroneState, model?: DroneInput["model"]): Promise<Drone[]> {
        let query: any = {};
        if (state) query.state = { equals: state };
        if (model) query.model = { equals: model };

        const result = await DroneModel.findMany({
            where: { ...query },
            include: {
                items: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return result;
    }

    static async getDroneBySerialNumber(serialNumber: string): Promise<Drone & { items: Medication[] }> {
        const result = await DroneModel.findUnique({
            where: { serialNumber },
            include: {
                items: true,
            },
        });

        if (!result) throwError(`No drone with ${serialNumber} was found`, 404);

        return result;
    }

    static async checkBatteryLevel(serialNumber: string): Promise<{ batteryCapacity: number }> {
        const drone = await this.getDroneBySerialNumber(serialNumber);

        return { batteryCapacity: drone.batteryCapacity };
    }

    static async checkAvailableDroneForLoading(): Promise<Drone[]> {
        const result = await DroneModel.findMany({
            where: { state: { in: ["IDLE", "LOADING"] } },
        });

        return result;
    }

    static async loadItemToDrone(serialNumber: string, data: MedicationInput): Promise<string> {
        const drone = await this.getDroneBySerialNumber(serialNumber);

        if (!["IDLE", "LOADING"].includes(drone.state)) {
            throwError(`Drone is no longer available for loading`);
        }

        if (drone.batteryCapacity < 25) throwError(`Drone battery is too low`);

        const itemWeight = Number(data.weight);

        let currentLoadWeight = 0;

        for (let i = 0; i < drone.items.length; i++) {
            const item = drone.items[i];
            currentLoadWeight += item.weight;
        }

        const newWeight = currentLoadWeight + itemWeight;

        const availableWeight = drone.weightLimit - currentLoadWeight;

        if (newWeight > drone.weightLimit) {
            throwError(`Drone weight limit exceeded. This drone can only take additional ${availableWeight}gr`);
        }

        await MedicationModel.create({ data: { ...data, weight: Number(data.weight), droneSerial: serialNumber } });

        let droneState = "LOADING";

        if (newWeight === drone.weightLimit) droneState = "LOADED";

        await DroneModel.update({
            where: { serialNumber },
            data: { state: droneState },
        });

        return `Item added successfully. current load weight = ${newWeight}. Weight Limit = ${drone.weightLimit}`;
    }

    static async updateDroneState(serialNumber: string, state: DroneState): Promise<Drone> {
        const drone = await this.getDroneBySerialNumber(serialNumber);

        if (NEXT_STATE_MAP[drone?.state] !== state) {
            throwError(
                `Wrong state transition. can't move from ${drone?.state} => ${state}. Should be ${drone?.state} => ${
                    NEXT_STATE_MAP[drone?.state]
                }`
            );
        }

        if (state === "LOADED" && drone.items.length < 1) {
            throwError(`Drone is empty, cannot be marked as LOADED`);
        }

        const update = await DroneModel.update({
            where: { serialNumber },
            data: { state: state },
        });

        if (state === "DELIVERED") {
            await MedicationModel.deleteMany({
                where: { droneSerial: { equals: serialNumber } },
            });
        }

        return update;
    }
}
