import { ChannelType, Client, TextChannel } from "discord.js";

export default async function deleteOldTickets(
  client: Client,
  guildId: string,
) {
  console.log("deleting old tickets");
  const guild = await client.guilds.fetch(guildId);
  await guild.channels.fetch();
  const allClosedTickets = guild.channels.cache.filter((c) =>
    c.name.startsWith("closed-")
  );

  let i = 0;
  for (const ticket of allClosedTickets.values()) {
    if (ticket.type != ChannelType.GuildText) continue;
    const messages = await ticket.messages.fetch({ limit: 10 });
    const lastMessage = messages.find((m) =>
      m.author.id != "1413595213414400000"
    );
    if (!lastMessage) {
      console.error("no last message found in", ticket.name);
      continue;
    }
    const age = Date.now() - lastMessage.createdTimestamp;
    const cutoff = 3 * 24 * 60 * 60 * 1000;
    if (age > cutoff) {
      console.log("scheduled delete", ticket.name);
      setTimeout(() => {
        console.log("nuking", ticket.name);
        lastMessage.reply("?transcript");
        lastMessage.reply("?delete");
      }, i * 10000);
      i += 1;
    }
  }
}
