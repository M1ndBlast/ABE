const fs = require("fs");
const qrCode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const SESSION_FILE_PATH = "./session.json";

const MessagesAdapter = require('./utils/MessagesAdapter')

let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

function answerer(msg) {
    let msgText = String(msg.body.toLowerCase())
    
    msg.reply(MessagesAdapter.findAnswer(msgText))
}

function setupClient() {
    client.on('qr', qr => {
        qrCode.generate(qr, {small: true});
    });

    client.on('ready', async () => {
        console.log("El cliente está listo");
    })

    client.on('authenticated', session => {
        sessionData = session;

        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), err => {
            if (err)
                console.error(err);
        });
    })

    client.on('auth_failure', msg => {
        console.error("Hubo un fallo en la autentificacion", msg)
        fs.unlink(SESSION_FILE_PATH, err => {
            if (err) {
                console.error("Hubo un problema al restableer la sesión",err);
                return
            }

            console.info("Sesión restablecida. Vuelva a ejecutar el programa")
        })
    })
    
    client.on('message', msg => {
        answerer(msg)
    })
}

// For windows
// const client = new Client({ session: sessionData, });
// For raspberry
const client = new Client({ session: sessionData, puppeteer: { executablePath: "/usr/bin/chromium-browser", }, });
client.initialize();
setupClient()