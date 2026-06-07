const {
    Client,
    GatewayIntentBits,
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// CONFIGURACIÓN
const TOKEN = "MTUxMzI0NzIwMjQyMjY4NTcwNg.G-9rlQ.ghkna4wVH9loTVkHb1nSpD3OVQ8tAwS5BuEF00";
const ROL_VERIFICADO = "1513250945041956964";

client.once('ready', async () => {
    console.log(`${client.user.tag} conectado`);
});

client.on(Events.InteractionCreate, async interaction => {

    // BOTÓN
    if (interaction.isButton()) {

        if (interaction.customId === "verificar") {

            const modal = new ModalBuilder()
                .setCustomId("modal_verificacion")
                .setTitle("Verificación");

            const idInput = new TextInputBuilder()
                .setCustomId("id")
                .setLabel("Ingresa tu ID")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const usuarioInput = new TextInputBuilder()
                .setCustomId("usuario")
                .setLabel("Ingresa tu Usuario")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(idInput),
                new ActionRowBuilder().addComponents(usuarioInput)
            );

            await interaction.showModal(modal);
        }
    }

    // MODAL
    if (interaction.isModalSubmit()) {

        if (interaction.customId === "modal_verificacion") {

            const id = interaction.fields.getTextInputValue("id");
            const usuario = interaction.fields.getTextInputValue("usuario");

            try {

                // Cambiar nickname
                await interaction.member.setNickname(
                    `${usuario} | ${id}`
                );

                // Dar rol
                const rol = interaction.guild.roles.cache.get(ROL_VERIFICADO);

                if (rol) {
                    await interaction.member.roles.add(rol);
                }

                await interaction.reply({
                    content: "✅ Verificación completada correctamente.",
                    ephemeral: true
                });

            } catch (err) {

                console.error(err);

                await interaction.reply({
                    content: "❌ No pude cambiar tu apodo o darte el rol.",
                    ephemeral: true
                });
            }
        }
    }
});

client.login(TOKEN);
