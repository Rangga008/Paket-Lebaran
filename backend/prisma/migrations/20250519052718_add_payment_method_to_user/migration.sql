-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "payment_method" TEXT NOT NULL DEFAULT 'DAILY',
    "reseller_id" INTEGER,
    "package_id" INTEGER,
    CONSTRAINT "users_reseller_id_fkey" FOREIGN KEY ("reseller_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("id", "name", "package_id", "password", "phone", "reseller_id", "role", "username") SELECT "id", "name", "package_id", "password", "phone", "reseller_id", "role", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
