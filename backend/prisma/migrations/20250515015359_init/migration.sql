-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "reseller_id" INTEGER,
    "package_id" INTEGER,
    CONSTRAINT "users_reseller_id_fkey" FOREIGN KEY ("reseller_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "packages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "payment_method" TEXT NOT NULL DEFAULT 'DAILY',
    "payment_amount" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payment_date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_start_date" DATETIME,
    "payment_months" INTEGER,
    "user_id" INTEGER NOT NULL,
    "package_id" INTEGER NOT NULL,
    CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reseller_customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reseller_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    CONSTRAINT "reseller_customers_reseller_id_fkey" FOREIGN KEY ("reseller_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reseller_customers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PackageProducts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PackageProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "packages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PackageProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "_PackageProducts_AB_unique" ON "_PackageProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_PackageProducts_B_index" ON "_PackageProducts"("B");
