/*
  Warnings:

  - Added the required column `userId` to the `Build` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables

INSERT OR IGNORE INTO "User" ("id","email","passwordHash","name","createdAt","updatedAt","role")
VALUES (1,'system@nexus.local','system','SYSTEM',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'ADMIN');

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Build" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "cpuId" INTEGER NOT NULL,
    "motherboardId" INTEGER NOT NULL,
    "ramId" INTEGER NOT NULL,
    "gpuId" INTEGER NOT NULL,
    "psuId" INTEGER NOT NULL,
    "storageId" INTEGER NOT NULL,
    "caseId" INTEGER NOT NULL,
    "coolerId" INTEGER NOT NULL,
    CONSTRAINT "Build_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Build_cpuId_fkey" FOREIGN KEY ("cpuId") REFERENCES "Cpu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_motherboardId_fkey" FOREIGN KEY ("motherboardId") REFERENCES "Motherboard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_ramId_fkey" FOREIGN KEY ("ramId") REFERENCES "Ram" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_gpuId_fkey" FOREIGN KEY ("gpuId") REFERENCES "Gpu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_psuId_fkey" FOREIGN KEY ("psuId") REFERENCES "Psu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "PcCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Build_coolerId_fkey" FOREIGN KEY ("coolerId") REFERENCES "Cooler" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Build" ("budget", "caseId", "coolerId", "cpuId", "createdAt", "gpuId", "id", "motherboardId", "name", "psuId", "ramId", "storageId", "totalPrice", "userId") SELECT "budget", "caseId", "coolerId", "cpuId", "createdAt", "gpuId", "id", "motherboardId", "name", "psuId", "ramId", "storageId", "totalPrice", 1 FROM "Build";
DROP TABLE "Build";
ALTER TABLE "new_Build" RENAME TO "Build";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
