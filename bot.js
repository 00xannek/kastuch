require("dotenv").config();
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

const LINK_PROTECTED_CHANNEL = "1337130838218768405"; // ID kanału do blokowania linków
const ROOTS = ["1280445698831290398"]; // ID osób, które mogą wysyłać linki
const TICKET_CATEGORY_ID = "1337130838365700228"; // ID kategorii dla ticketów

client.once("ready", () => {
    console.log(`✅ Bot zalogowany jako ${client.user.tag}`);
});

// Blokowanie linków na określonym kanale
client.on("messageCreate", async (message) => {
    if (message.channel.id === LINK_PROTECTED_CHANNEL && !ROOTS.includes(message.author.id) && message.content.match(/https?:\/\//)) {
        await message.delete();
        message.channel.send(`${message.author}, tylko właściciel i root mogą wysyłać linki tutaj!`);
    }
});

// Obsługa komend `/ticket` i `/zamknij`
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "ticket") {
        const embed = new EmbedBuilder()
            .setTitle("🎟️ System Ticketów")
            .setDescription("Wybierz kategorię ticketa poniżej.")
            .setColor("Blue");

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("ticket_menu")
                .setPlaceholder("Wybierz kategorię")
                .addOptions([
                    { label: "🛒 Kupno", value: "kupno", description: "Dotyczy zakupów" },
                    { label: "❓ Pomoc", value: "pomoc", description: "Potrzebujesz pomocy?" },
                    { label: "⚠️ Zgłoś błąd", value: "blad", description: "Zgłoś problem" },
                ])
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.commandName === "zamknij") {
        if (!interaction.channel.name.startsWith("ticket-")) {
            return interaction.reply({ content: "❌ To nie jest kanał ticketa!", ephemeral: true });
        }
        await interaction.channel.delete();
    }
});

// Obsługa wyboru kategorii ticketa
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== "ticket_menu") return;

    const category = interaction.values[0];
    const ticketName = `ticket-${interaction.user.username}`;

    const ticketChannel = await interaction.guild.channels.create({
        name: ticketName,
        type: 0, // Kanał tekstowy
        parent: TICKET_CATEGORY_ID,
        permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        ],
    });

    const embed = new EmbedBuilder()
        .setTitle("🎟️ Ticket Otwarty")
        .setDescription(`Kategoria: **${category.toUpperCase()}**\n\nOpisz swój problem.`)
        .setColor("Green");

    await ticketChannel.send({ content: `${interaction.user}`, embeds: [embed] });
    await interaction.reply({ content: `Ticket został utworzony: ${ticketChannel}`, ephemeral: true });
});

// Logowanie bota
client.login(process.env.TOKEN);
