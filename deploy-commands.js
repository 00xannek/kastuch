require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
    new SlashCommandBuilder().setName("ticket").setDescription("Twórz nowy ticket"),
    new SlashCommandBuilder().setName("zamknij").setDescription("Zamknij ticket"),
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🔄 Rejestrowanie komend...");
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), 
            { body: commands }
        );
        console.log("✅ Komendy zostały zarejestrowane!");
    } catch (error) {
        console.error("❌ Błąd rejestrowania komend:", error);
    }
})();
