const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getRandomFreeTable(number_of_people){
    try {
        tableList = await prisma.table_resa.findMany({
            where: {
                nbr_place: {
                    gte : number_of_people
                }
            }
        })
        message = {
            data: tableList,
            message: "Liste des tables disponibles ayant un nombre de place plus grand ou egal à "+ number_of_people
        }
        return message;
    } catch (error) {
        message.message = "Une erreur s'est produite durant la recupération des tables ayant un nombre de place plus grand ou egal à "+ number_of_people
        return message;
    }
}



module.exports = {
    getRandomFreeTable:getRandomFreeTable,
}

  