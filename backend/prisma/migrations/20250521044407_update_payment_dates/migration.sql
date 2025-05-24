-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payment_date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_start_date" DATETIME,
    "payment_months" INTEGER,
    "payment_dates" TEXT NOT NULL DEFAULT '[]',
    "user_id" INTEGER NOT NULL,
    "package_id" INTEGER NOT NULL,
    CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_payments" ("amount", "id", "package_id", "payment_date", "payment_months", "payment_start_date", "status", "user_id") SELECT "amount", "id", "package_id", "payment_date", "payment_months", "payment_start_date", "status", "user_id" FROM "payments";
DROP TABLE "payments";
ALTER TABLE "new_payments" RENAME TO "payments";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
