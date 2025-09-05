import { REST, Routes } from "npm:discord.js";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { config } from "dotenv";
// import config from "./config.json" assert { type: "json" };
//
// const { clientId, guildId, token } = config;
//
//
//

config();

const commands: unknown[] = [];

// Grab all the command folders from the commands directory
const foldersPath = join(Deno.cwd(), "commands");
console.log(foldersPath);

for await (const folder of Deno.readDir(foldersPath)) {
  if (!folder.isDirectory) continue;

  const commandsPath = join(foldersPath, folder.name);
  console.log(folder.name);

  for await (const file of Deno.readDir(commandsPath)) {
    console.log(`found ${file.name}`);
    if (!file.isFile || !file.name.endsWith(".ts")) continue;

    const filePath = join(commandsPath, file.name);
    const command = await import("file://" + filePath);

    if ("data" in command && "execute" in command) {
      // Grab SlashCommandBuilder#toJSON() output
      commands.push(command.data.toJSON());
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy your commands
try {
  console.log(
    `Started refreshing ${commands.length} application (/) commands.`,
  );

  const data = await rest.put(
    // Routes.applicationGuildCommands(clientId, guildId),
    Routes.applicationCommands("1413595213414400000"),
    { body: commands },
  );

  console.log(
    `Successfully reloaded ${
      (data as unknown[]).length
    } application (/) commands.`,
  );
} catch (error) {
  console.error(error);
}
