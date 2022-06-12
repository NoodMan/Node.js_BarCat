const express = require('express'); // framework 

const port = "666"

// const cors = require("cors") // pour les erreurs

//const fs = require('fs') // pour interagire avec les systeme de la machine

var app = express() // framework 

const { PrismaClient } = require('@prisma/client')

// app.use(cors()) // pour utiliser Cors

var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
    res.send("J'ai réussi, je suis sur ma page d'accueil !!! 🎉 😺")
})



/////////////////// utilise ma BD my sql/////////////////
const bcrypt = require('bcrypt'); //pour hasher le mdp

const prisma = new PrismaClient()
//pour l'ajout de user en role Admin par default
app.post("/create", async (req, res) => {
     
    //console.log('-->⛔️ Je suis ici 🎉 <--');

    console.log(req.body);
    debugger;

    const email = req.body.email
    const name = req.body.name
    const password = req.body.password
    const role = req.body.role
    bcrypt.hash(password, 4, async function (err, hash) {
        const User = await prisma.User.create({
            data: {
                "email": email,
                "name": name,
                "password": hash,
                "role": role,
            },
        })
        res.status(201).json(User) //https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP 
    })
}),


    //  unique identifier
app.get("/user", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await prisma.User.findUnique({
        where: {
            email:email   
        },
    })
    res.json(user)
})


app.post("/sign_up", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const user = {};

    bcrypt.hash(password, 4, async function (err, hash) {
        try {
            user = await prisma.User.create({
                data: {
                    name: name,
                    email: email,
                    password: hash
                }
            })

            var message = {
                name: name,
                email: email,
                message: "vous êtes inscrit"
            }
            if (name && email && password) {
                res.status(200).send(message);
            }
        } catch (error) {
            res.status(400).send(
                JSON.stringify({ message: "un probléme est survenu" })
            )
        }
    })
})


app.post("/login", async (req, res) => {

    const email = req.body.email
    const password = req.body.password

    const user = await prisma.User.findUnique({
        where: {
            email: email,
        },
    })
    // console.log("yoyo", user);
    const match = await bcrypt.compare(password, user.password); //user.password = mdp hacher
    if (match == true) {
        res.status(200).send("ok connecter") //Liste_des_codes_HTTP 
    }
    if (match == false) {// ou if (!match) 
        res.status(401).send("PAS ok ") //Liste_des_codes_HTTP 
    }

})


// mettre toujours à la fin 
app.listen("666", () => {
    console.log("Server running on port" + " " + port);
})