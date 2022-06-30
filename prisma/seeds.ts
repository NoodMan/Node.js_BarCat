const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        //#region BOOKING
        const statusBooking1 = await prisma.status_booking.create({
            data: {
                label: "pending"
            }
        });
        const statusBooking2 = await prisma.status_booking.create({
            data: {
                label: "validate"
            }
        });
        //#endregion BOOKING

        //#region  TABLE
        const statusTable1 = await prisma.status_table_resa.create({
            data: {
                 label: "free"
            }
        });
        const statusTable2 = await prisma.status_table_resa.create({
            data: {
                 label: "pending"
            }
        });
        const statusTable3 = await prisma.status_table_resa.create({
            data: {
                 label: "busy"
            }
        });

        //#endregion
    } catch (error) {
        console.log(error)
    }

}

main().then(r => console.log("OK for seeds")).catch(e => console.log("error on seeds creation"))