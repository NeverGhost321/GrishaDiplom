-- CreateTable
CREATE TABLE "Cpu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "socket" TEXT NOT NULL,
    "cores" INTEGER NOT NULL,
    "threads" INTEGER NOT NULL,
    "baseClockGhz" REAL NOT NULL,
    "boostClockGhz" REAL NOT NULL,
    "tdpWatts" INTEGER NOT NULL,
    "integratedGraphics" BOOLEAN NOT NULL,
    "generation" TEXT NOT NULL,
    "price" INTEGER NOT NULL
);

CREATE TABLE "Motherboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "socket" TEXT NOT NULL,
    "chipset" TEXT NOT NULL,
    "supportedCpuGenerations" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL,
    "maxRamGb" INTEGER NOT NULL,
    "maxRamFrequency" INTEGER NOT NULL,
    "ramSlots" INTEGER NOT NULL,
    "pcieVersion" TEXT NOT NULL,
    "m2Slots" INTEGER NOT NULL,
    "sataPorts" INTEGER NOT NULL,
    "formFactor" TEXT NOT NULL,
    "vrmQualityScore" INTEGER NOT NULL,
    "biosVersion" TEXT NOT NULL,
    "price" INTEGER NOT NULL
);

CREATE TABLE "Ram" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL,
    "capacityGb" INTEGER NOT NULL,
    "sticks" INTEGER NOT NULL,
    "frequencyMhz" INTEGER NOT NULL,
    "cl" INTEGER NOT NULL,
    "voltage" REAL NOT NULL,
    "rgb" BOOLEAN NOT NULL,
    "price" INTEGER NOT NULL
);

CREATE TABLE "Gpu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "chipset" TEXT NOT NULL,
    "vramGb" INTEGER NOT NULL,
    "lengthMm" INTEGER NOT NULL,
    "powerDrawWatts" INTEGER NOT NULL,
    "recommendedPsuWatts" INTEGER NOT NULL,
    "pcieInterface" TEXT NOT NULL,
    "price" INTEGER NOT NULL
);

CREATE TABLE "Psu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "wattage" INTEGER NOT NULL,
    "efficiencyRating" TEXT NOT NULL,
    "has12Vhpwr" BOOLEAN NOT NULL,
    "pcie8PinCount" INTEGER NOT NULL,
    "atxVersion" TEXT NOT NULL,
    "modular" BOOLEAN NOT NULL,
    "price" INTEGER NOT NULL
);

CREATE TABLE "Storage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "interface" TEXT NOT NULL,
    "capacityGb" INTEGER NOT NULL,
    "readSpeedMBs" INTEGER NOT NULL,
    "writeSpeedMBs" INTEGER NOT NULL,
    "formFactor" TEXT NOT NULL,
    "price" INTEGER NOT NULL
);

CREATE TABLE "PcCase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "formFactor" TEXT NOT NULL,
    "supportedMotherboardFormFactors" TEXT NOT NULL,
    "maxGpuLengthMm" INTEGER NOT NULL,
    "maxCpuCoolerHeightMm" INTEGER NOT NULL,
    "radiatorSupport" TEXT NOT NULL,
    "fanCountIncluded" INTEGER NOT NULL,
    "airflowScore" INTEGER NOT NULL,
    "price" INTEGER NOT NULL
);

CREATE TABLE "Cooler" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "supportedSockets" TEXT NOT NULL,
    "tdpRatingWatts" INTEGER NOT NULL,
    "heightMm" INTEGER NOT NULL,
    "radiatorSizeMm" INTEGER NOT NULL,
    "noiseLevelDb" INTEGER NOT NULL,
    "price" INTEGER NOT NULL
);

CREATE TABLE "Build" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cpuId" INTEGER NOT NULL,
    "motherboardId" INTEGER NOT NULL,
    "ramId" INTEGER NOT NULL,
    "gpuId" INTEGER NOT NULL,
    "psuId" INTEGER NOT NULL,
    "storageId" INTEGER NOT NULL,
    "caseId" INTEGER NOT NULL,
    "coolerId" INTEGER NOT NULL,
    CONSTRAINT "Build_cpuId_fkey" FOREIGN KEY ("cpuId") REFERENCES "Cpu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_motherboardId_fkey" FOREIGN KEY ("motherboardId") REFERENCES "Motherboard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_ramId_fkey" FOREIGN KEY ("ramId") REFERENCES "Ram" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_gpuId_fkey" FOREIGN KEY ("gpuId") REFERENCES "Gpu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_psuId_fkey" FOREIGN KEY ("psuId") REFERENCES "Psu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "PcCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_coolerId_fkey" FOREIGN KEY ("coolerId") REFERENCES "Cooler" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
