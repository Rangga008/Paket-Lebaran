-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_packages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "payment_method" TEXT,
    "payment_amount" REAL NOT NULL
);
INSERT INTO "new_packages" ("description", "id", "name", "payment_amount", "payment_method") SELECT "description", "id", "name", "payment_amount", "payment_method" FROM "packages";
DROP TABLE "packages";
ALTER TABLE "new_packages" RENAME TO "packages";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
