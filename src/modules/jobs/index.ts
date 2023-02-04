import { DroneModel, MedicationModel } from "..";
import { logEvent } from "../../utils";
import { BATTERY_REDUCTION_RATE, NEXT_STATE_MAP } from "../../utils/constants";
import DroneService from "../drones/droneService";

export default class Jobs {
    protected static async chargeDroneBattery(serialNumber: string) {
        const { batteryCapacity } = await DroneService.checkBatteryLevel(serialNumber);
        const newLevel = batteryCapacity + BATTERY_REDUCTION_RATE;

        if (batteryCapacity < 100) {
            await DroneModel.update({
                where: { serialNumber },
                data: { batteryCapacity: newLevel },
            });
        }
    }

    protected static async dischargeDroneBattery(serialNumber: string) {
        const { batteryCapacity } = await DroneService.checkBatteryLevel(serialNumber);
        const newLevel = batteryCapacity - BATTERY_REDUCTION_RATE;

        if (newLevel >= 0) {
            await DroneModel.update({
                where: { serialNumber },
                data: { batteryCapacity: newLevel },
            });
        }
    }

    protected static async updateDroneState(serialNumber: string, currentState: string) {
        const nextState = NEXT_STATE_MAP[currentState];

        await DroneModel.update({
            where: { serialNumber },
            data: { state: nextState },
        });

        if (nextState === "DELIVERED") {
            await MedicationModel.deleteMany({
                where: { droneSerial: { equals: serialNumber } },
            });
        }
    }

    static async backgroundTask() {
        const drones = await DroneModel.findMany();

        for (let i = 0; i < drones.length; i++) {
            const { state, serialNumber, batteryCapacity } = drones[i];

            let payload: Record<string, any> = {};

            payload["Serial Number"] = serialNumber;
            payload["Battery Level"] = batteryCapacity;
            payload["Drone State"] = state;
            payload["Description"] = ``;
            
            if (state === "IDLE") {
                // charge battery
                this.chargeDroneBattery(serialNumber);
                payload["Description"] += `Drone is IDLE. Battery Charging....`;
            }
            
            if (!["IDLE", "LOADING"].includes(state)) {
                // deplete battery
                this.dischargeDroneBattery(serialNumber);
                payload["Description"] += `Drone state = ${state}. Battery is depleting....\n`;
                
                // update drone state
                this.updateDroneState(serialNumber, state);
                payload["Description"] += `Drone state was updated from ${state} => ${NEXT_STATE_MAP[state]}.`;
            }
            
            payload["TimeStamp"] = new Date().toISOString();

            // log Event
            logEvent(payload);
        }
    }
}
