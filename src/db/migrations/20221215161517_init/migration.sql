-- CreateTable
CREATE TABLE "Drone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serialNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'Middleweight',
    "weightLimit" INTEGER NOT NULL,
    "batteryCapacity" INTEGER NOT NULL DEFAULT 100,
    "state" TEXT NOT NULL DEFAULT 'IDLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "droneSerial" TEXT NOT NULL,
    CONSTRAINT "Medication_droneSerial_fkey" FOREIGN KEY ("droneSerial") REFERENCES "Drone" ("serialNumber") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Drone_serialNumber_key" ON "Drone"("serialNumber");
