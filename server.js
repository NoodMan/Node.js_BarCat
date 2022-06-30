const express = require('express'); // framework 
const port = "666"


const cors = require("cors") // pour les erreurs
const fs = require('fs') // pour interagir avec les systeme de la machine
var app = express() // framework 
const { PrismaClient } = require('@prisma/client')
var { getRandomFreeTable } = require("./functions.js")
app.use(cors()) // pour utiliser Cors

var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const htmlspecialchars = require("htmlspecialchars");
const striptags = require("striptags");


// require('dotenv').config();

const jwt = require("jsonwebtoken");

app.get("/", (req, res) => {
    res.send("J'ai réussi, je suis sur ma page d'accueil !!! 🎉 😺")
})




/////////////////// utilise ma BD my sql/////////////////
const bcrypt = require('bcrypt'); //pour hasher le mdp

const prisma = new PrismaClient()


app.post("/sign_up", async (req, res) => {
    const lastname = req.body.lastname
    const firstname = req.body.firstname
    const address = req.body.address
    const zip_code = req.body.zip_code
    const city = req.body.city
    const email = req.body.email
    const tel = req.body.tel
    const mobile = req.body.mobile
    const day_of_birth = req.body.day_of_birth
    const month_of_birth = req.body.month_of_birth
    const year_of_birth = req.body.year_of_birth
    const password = req.body.password
    const user = {};

    bcrypt.hash(password, 4, async function (err, hash) {
        try {
            const user = await prisma.user.create({
                data: {
                    "lastname": lastname,
                    "firstname": firstname,
                    "address": address,
                    "zip_code": zip_code,
                    "city": city,
                    "email": email,
                    "tel": tel,
                    "mobile": mobile,
                    // parseInt = force changement string en int
                    "day_of_birth": parseInt(req.body.day_of_birth),
                    "month_of_birth": parseInt(req.body.month_of_birth),
                    "year_of_birth": parseInt(req.body.year_of_birth),
                    "password": hash,
                }
            })

            // data.accessToken = await jwt.signAccessToken(user);
            //https://blog.logrocket.com/crafting-authentication-schemes-with-prisma-in-express/
            //  https://dev.to/mihaiandrei97/jwt-authentication-using-prisma-and-express-37nk

            var message = {
                "lastname": lastname,
                "firstname": firstname,
                "address": address,
                "zip_code": zip_code,
                "city": city,
                "email": email,
                "tel": tel,
                "mobile": mobile,
                "day_of_birth": day_of_birth,
                "month_of_birth": month_of_birth,
                "year_of_birth": year_of_birth,
                "password": hash,
                message: "Merci pour votre inscription 😸"
            }
            
            if (lastname && firstname && address && zip_code && city && email && tel && mobile && day_of_birth && month_of_birth && year_of_birth && password) {
                res.status(200).send(message);
            }
        } catch (error) {
            console.log('toto', error);
            res.status(400).send(
                JSON.stringify({ message: "un probléme est survenu lors de votre inscription 🙀" })
            )
        }
    })

})


app.post("/login", async (req, res) => { 
    try {
    

    const email = striptags(req?.body?.email)
    const password = striptags(req?.body?.password)

   
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    })
    // const accessToken = await jwt.signAccessToken(user)
    //console.log('-->⛔️ Je suis ici 🎉 <--', user);
    const match = await bcrypt.compare(password, user?.password);
    //user.password = mdp hacher
    // pour supprimer le mot de passe
    delete user.password
    

    var token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    var refresh_token = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '24h' });

    var data_n_tokens = { user, token, refresh_token }
   
    if (match == true) {
        res.status(200).send(data_n_tokens) //Liste_des_codes_HTTP 
       
    }
    if (match == false) {// ou if (!match) 
        res.status(401).send("PAS ok ") //Liste_des_codes_HTTP 
    }
} catch (error) {
    //console.log('-->⛔️ Je suis ici 🎉 <--', error);
}

})

app.get("/booking", async (req, res) => {
    try {
        const getBooking = await prisma.booking.findMany({
            include: {
                user: {
                    select: {
                        lastname: true,
                        firstname: true
                    }
                }
            }
        })
        res.status(200).send(getBooking)
    } catch (error) {
        console.log('-->⛔️ Je suis ici 🎉 <--', error);
    }
})

app.post("/booking", async (req, res) => {
    var date_of_booking = req.body.date_of_booking;
    var number_of_people = parseInt(req.body.number_of_people);
    var user_id = req.body.id;
    var table_resa = req?.body?.table_resa;
    let booking = {};

    let dataFromRequestToPrisma = {

        "date_of_booking": date_of_booking,
        "number_of_people": number_of_people,
        "user": {
            connect: {
                id: parseInt(user_id),
            }
        }

    }
    //Si l'ADMIN envoie table_resa dans la requete
    if (table_resa) {
        dataFromRequestToPrisma.table_resa = {
            connect: {
                id: parseInt(table_resa)
            }
        }
    } else { //sinon (si c'est l'user qui crée un booking)
        var freeTables = await getRandomFreeTable(number_of_people)
        freeTables = freeTables.data
        var tableLength = freeTables?.length
        if (tableLength < 1) {
            res.status(400).send(
                JSON.stringify({ message: "Plus de table disponible 🙀😿" })
            )
            return;
        }
        var randomIndex = Math.floor(Math.random() * tableLength)
        var choosedTable = freeTables[randomIndex]
        // console.log('-->⛔️ Je suis ici 🎉 <--', choosedTable);

        dataFromRequestToPrisma.table_resa = {
            connect: {
                id: parseInt(choosedTable.id)
            }
        }
    }
    var message;

    try {
        booking = await prisma.booking.create({
            data: dataFromRequestToPrisma
        })

        message = {
            data: booking,
            message: "Merci pour votre reservation 😺, vous allez recevoir un email de confirmation 📧"
        }

        res.status(200).send(message);
        return;
    } catch (error) {
        console.log(error)
        res.status(400).send(
            JSON.stringify({ message: "un probléme est survenu lors de votre réservation 🙀😿" })
        )
    }
})

app.post("/table", async (req, res) => {
    try {
        var place_number = parseInt(striptags(String(req.body.place_number)));
        var table_number = parseInt(striptags(String(req.body.number_of_people)));
        // var status = parseInt(striptags(String(req.body.status)));
        var table = {};
        var message;
    } catch (error) {
        console.log("error", error);
        res.status(400).send(
            JSON.stringify({ message: "some params is required" })
        )
        return;
    }

    try {
        table = await prisma.table_resa.create({
            data: {
                "table_nbr": table_number,
                "nbr_place": place_number,
                // "status": status
            }
        })

        message = {
            data: table,
            message: "Merci pour votre creation 😺, votre nouvelle table est disponible"
        }

        res.status(200).send(message);
        return;
    } catch (error) {
        console.log(error)
        res.status(400).send(
            JSON.stringify({ message: "un problème est survenu lors de la création de la table 🙀😿" })
        )
        return;
    }
})


app.get("/table", async (req, res) => {
    var tableList;
    var message = {}
    try {
        tableList = await prisma.table_resa.findMany()
        message = {
            data: tableList,
            message: "Liste des tables disponibles"
        }
        res.status(200).json(message);
        return;
    } catch (error) {
        message.message = "Une erreur s'est produite durant la recupération des tables"
        res.status(400).json(message);
    }
})




const router = express.Router();



// mettre toujours à la fin 
app.listen("666", () => {
    console.log("Server running on port" + " " + port);
})
// npx nodemon pour run le server / node server.js
