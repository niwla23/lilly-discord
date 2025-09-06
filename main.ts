// Require the necessary discord.js classes
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Message,
  RESTEvents,
} from "discord.js";
import { CronJob } from "cron";
import { config } from "dotenv";

import * as verifyCommand from "./commands/utility/verify.ts";

// import dependencies
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import updateMemberCount from "./update-member-count.ts";

config();

const TOKEN = process.env.DISCORD_TOKEN;

// Create a new client instance

type ClientWCommands = { commands: Collection<string, any> } & Client;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
}) as ClientWCommands;

client.commands = new Collection();
client.commands.set(verifyCommand.data.name, verifyCommand);

// path to "commands" folder
// const foldersPath = join(Deno.cwd(), "commands");
// const commandFolders = Deno.readDirSync(foldersPath);
//
// for (const folder of commandFolders) {
//   if (!folder.isDirectory) continue;
//
//   const commandsPath = join(foldersPath, folder.name);
//   for await (const file of Deno.readDir(commandsPath)) {
//     if (!file.isFile || !file.name.endsWith(".ts")) continue;
//
//     const filePath = join(commandsPath, file.name);
//     // dynamic import instead of require
//     const command = await import("file://" + filePath);
//
//     if ("data" in command && "execute" in command) {
//       client.commands.set(command.data.name, command);
//     } else {
//       console.warn(
//         `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
//       );
//     }
//   }
// }

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.on(Events.MessageCreate, async (message: Message) => {
  // console.log("message", message.content);
  const text: string = message.content.toLowerCase();
  if (text.includes("train")) message.react("🚆");
  if (text.includes("estrogen")) message.react("🇪");
  if (text.includes("haj")) message.react("1413657480004632627");
});

client.on(Events.GuildMemberUpdate, async (message: Message) => {
  await updateMemberCount(client);
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.rest.on(RESTEvents.RateLimited, () => console.log("rate limited"));

// const job = new CronJob();

// Log in to Discord with your client's token
client.login(TOKEN);

updateMemberCount(client);
