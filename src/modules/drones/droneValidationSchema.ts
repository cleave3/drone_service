import { Request } from "express";
import { throwError, trimWhiteSpaces } from "../../utils";
import { DroneInput, DroneState, MedicationInput } from "./types";

export const registerDrone = ({
    body: { model, weightLimit, batteryCapacity, serialNumber },
}: Request<any, any, DroneInput>) => {
    if (!model) throwError("model is required");
    if (!/^(Lightweight|Middleweight|Cruiserweight|Heavyweight)$/.test(model)) {
        throwError("model must be one of Lightweight, Middleweight, Cruiserweight, Heavyweight");
    }

    if (!weightLimit) throwError("weightLimit is required");
    if (isNaN(Number(weightLimit))) throwError("weightLimit must be a number");
    if (Number(weightLimit) < 1 || Number(weightLimit) > 500) throwError("weightLimit must be between 1 - 500gr");

    if (trimWhiteSpaces(serialNumber) && trimWhiteSpaces(serialNumber).length > 100) {
        throwError("serialNumber must be less than 100 characters");
    }

    if (batteryCapacity && isNaN(Number(batteryCapacity))) throwError("batteryCapacity must be a number");
    if (batteryCapacity && (Number(batteryCapacity) > 100 || Number(batteryCapacity) < 0)) {
        throwError("batteryCapacity must be between 0 - 100%");
    }
};

export const loadDrone = ({ body: { code, image, name, weight } }: Request<any, any, MedicationInput>) => {
    if (!name) throwError("name is required");
    if (!/^[a-zA-Z0-9\-_]*$/.test(name)) {
        throwError("Invalid character for name. only letters, numbers, ‘-‘, ‘_’ is allowed");
    }
    if (!code) throwError("code is required");
    if (!/^[A-Z0-9_]*$/.test(code)) {
        throwError("Invalid character for code. only upper case letters, underscore and numbers is allowed");
    }
    if (!image) throwError("image is required");
    if (!weight) throwError("weight is required");
    if (isNaN(Number(weight))) throwError("weight must be a number");
    if (Number(weight) < 1 || Number(weight) > 500) throwError("weight must be between 0 - 500gr");
};

export const updateDroneState = ({ body: { state } }: Request<any, any, { state: DroneState }>) => {
    if (!state) throwError("state is required");
    if (!/^(IDLE|LOADING|LOADED|DELIVERING|DELIVERED|RETURNING)$/.test(state)) {
        throwError("state must be one of IDLE, LOADING, LOADED, DELIVERING, DELIVERED, RETURNING");
    }
};
