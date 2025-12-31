import { app } from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 3000

async function main() {
    try {
        await prisma.$connect()
        console.log("connected");

        app.listen(PORT, () => {
            console.log("listening");
        })
    } catch (error) {
        console.log(error);
        await prisma.$disconnect()
        process.exit(1)
    }
}

main()