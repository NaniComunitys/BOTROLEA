const express = require('express');
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');

// === CONFIGURACIÓN DE TU SERVIDOR ===
const PORT = 4207;
const API_KEY = "18981HDKMNASD91331F"; // Puedes inventar la clave que quieras aquí

// === CONFIGURACIÓN DE TU BOT DE DISCORD ===
const DISCORD_TOKEN = "MTU0NTQ5MjEzNTAzMjEzMTY3NQ.GkGoty.2N8ICKA72MEVu3bFQ-rAil6iXR871bClCM2eH8";
const CLIENT_ID = "1545492135032131675";

// Cola en memoria para almacenar comandos pendientes para Roblox
let pendingActions = [];

// --- INICIALIZAR EXPRESS (SERVIDOR API) ---
const app = express();
app.use(express.json());

// Middleware de seguridad
function checkApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === API_KEY) {
        next();
    } else {
        res.status(403).json({ error: "API Key inválida" });
    }
}

// Ruta HTTP que consulta tu script de Roblox
app.get('/pending-actions', checkApiKey, (req, res) => {
    const actionsToSend = [...pendingActions];
    pendingActions = []; // Limpia la lista tras enviársela a Roblox
    res.json(actionsToSend);
});

// --- INICIALIZAR BOT DE DISCORD ---
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`✅ Bot conectado como: ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('spawner')
            .setDescription('Dar arma a un jugador')
            .addStringOption(opt => opt.setName('username').setDescription('Usuario de Roblox').setRequired(true))
            .addStringOption(opt => opt.setName('gun').setDescription('Nombre del arma').setRequired(true)),
        new SlashCommandBuilder()
            .setName('custom')
            .setDescription('Dar un custom')
            .addStringOption(opt => opt.setName('username').setDescription('Usuario de Roblox').setRequired(true))
            .addStringOption(opt => opt.setName('firstname').setDescription('Nombre').setRequired(true))
    ];

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Comandos /spawner y /custom registrados en Discord.');
    } catch (err) {
        console.error('❌ Error al registrar comandos:', err);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'spawner') {
        const username = options.getString('username');
        const gun = options.getString('gun');

        pendingActions.push({ type: 'spawner', username, gun });
        await interaction.reply({ content: `✅ Acción guardada: Dar **${gun}** a **${username}**`, flags: 64 });

    } else if (commandName === 'custom') {
        const username = options.getString('username');
        const firstname = options.getString('firstname');

        pendingActions.push({ type: 'custom', username, firstname });
        await interaction.reply({ content: `✅ Acción guardada: Custom **${firstname}** a **${username}**`, flags: 64 });
    }
});

// Iniciar el servidor web y loguear el bot
app.listen(PORT, () => {
    console.log(`🚀 Servidor HTTP escuchando en el puerto ${PORT}`);
});

client.login(DISCORD_TOKEN);
