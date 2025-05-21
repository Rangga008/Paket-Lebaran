import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const passwordUser = "admin"; // bisa diganti sesuai kebutuhan
const hashedPassword = await bcrypt.hash(passwordUser, 10);

async function main() {
	// Contoh insert beberapa users
	await prisma.user.create({
		data: {
			username: "admin",
			name: "Administrator",
			password: hashedPassword, // biasanya hash di dunia nyata
			role: "ADMIN",
		},
	});

	// Kamu bisa tambah data lain sesuai kebutuhan
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
