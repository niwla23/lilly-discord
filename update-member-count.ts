import { Client, VoiceChannel } from "discord.js";
import process from "node:process";

export default async function (client: Client) {
  const guildId = process.env.GUILD_ID;
  const channelId = process.env.USER_COUNT_CHANNEL;
  const memberRoleId = process.env.MEMBER_ROLE_ID;
  if (!guildId) throw new Error("GUILD_ID not set");
  if (!channelId) throw new Error("USER_COUNT_CHANNEL not set");
  if (!memberRoleId) throw new Error("MEMBER_ROLE_ID not set");

  await client.guilds.fetch(guildId);

  const channel = await client.channels.fetch(channelId) as VoiceChannel;

  await channel.guild.members.fetch();
  await channel.guild.roles.fetch();
  await channel.guild.channels.fetch();

  const memberRole = channel.guild.roles.cache.get(memberRoleId);
  const count = memberRole?.members.keys().toArray().length;

  await channel.setName(`${count} Members`);
  console.log("member count updated");
}
