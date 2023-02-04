import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

export const DroneModel = prisma.drone;
export const MedicationModel = prisma.medication;

export default prisma;
