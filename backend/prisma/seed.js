const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
	const passwordUser = "admin"; // bisa diganti sesuai kebutuhan
	const hashedPassword = await bcrypt.hash(passwordUser, 10);

	// Check if admin user exists
	const existingAdmin = await prisma.user.findUnique({
		where: { username: "admin" },
	});

	if (!existingAdmin) {
		await prisma.user.create({
			data: {
				username: "admin",
				name: "Administrator",
				password: hashedPassword,
				role: "ADMIN",
			},
		});
	}

	// Tambah data lainnya di sini
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
