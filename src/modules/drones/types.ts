export type DroneInput = {
    serialNumber?: string;
    model: "Lightweight" | "Middleweight" | "Cruiserweight" | "Heavyweight";
    weightLimit: number;
    batteryCapacity?: number;
};

export type DroneState = "IDLE" | "LOADING" | "LOADED" | "DELIVERING" | "DELIVERED" | "RETURNING";

export type MedicationInput = {
    name: string;
    weight: number;
    code: string;
    image: string;
};
