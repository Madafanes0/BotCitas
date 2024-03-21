const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')


const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./google-credentials.json'); // Importa las credenciales de Google Sheets

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario'])

const flowCita = addKeyword(['cita', 'agendar', 'citas', 'reservacion'])
    .addAnswer(['📅 ¿Cuál es la fecha y hora de la cita?'])
    .addAction(async (context, { text }) => {
        if (!text) {
            // Handle the case when 'text' is undefined or empty
            context.sendText('⚠️ Por favor, proporciona la fecha y hora de la cita.');
            return;
        }

        const [fecha, hora] = text.split(' '); // Obtén la fecha y hora de la cita

        // Verifica si el formato de fecha y hora es válido
        const regex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/;
        if (!regex.test(text)) {
            // Envía un mensaje de error y solicita que se escriba nuevamente en el formato correcto
            context.sendText('⚠️ Por favor, escribe la fecha y hora en el formato correcto: DD-MM-AAAA HH:mm');
            return;
        }

        // Verifica la disponibilidad y agrega la cita en Google Sheets
        const resultado = await verificarDisponibilidadYAgendarCita(fecha, hora);

        // Envía la respuesta al usuario
        context.sendText(resultado);
    })

const flowDispo = addKeyword(['tutorial', 'tuto']).addAnswer(
    [
        '🙌 Aquí encontras un ejemplo rapido',
        'https://bot-whatsapp.netlify.app/docs/example/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowWeb = addKeyword(['gracias', 'grac']).addAnswer(
    [
        '🚀 Puedes aportar tu granito de arena a este proyecto',
        '[*opencollective*] https://opencollective.com/bot-whatsapp',
        '[*buymeacoffee*] https://www.buymeacoffee.com/leifermendez',
        '[*patreon*] https://www.patreon.com/leifermendez',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowDiscord = addKeyword(['discord']).addAnswer(
    ['🤪 Únete al discord', 'https://link.codigoencasa.com/DISCORD', '\n*2* Para siguiente paso.'],
    null,
    null,
    [flowSecundario]
)

const flowPrincipal = addKeyword(['UWU', 'PENE'])
    .addAnswer('👋 ¡Hola! ¿En qué puedo ayudarte hoy?')
    .addAnswer(
        [
            'te comparto los siguientes links de interes sobre el proyecto',
            '👉 *Cita* para agendar una cita',
            '👉 *Disponibilidad*  para ver la disponibilidad',
            '👉 *Web* para mandarte a un sitio web',
        ],
        null,
        null,
        [flowCita, flowDispo, flowWeb, flowDiscord]
    )

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()