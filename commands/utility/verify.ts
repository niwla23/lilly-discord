import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import updateMemberCount from "../../update-member-count.ts";

export const data = new SlashCommandBuilder().setName("verify").setDescription(
  "Verifies a Member",
);

const welcomeMessages = [
  "Give some Blahajs to our new member, {}",
  "Welcome our newest member, {}",
];

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.guild?.members.fetch();
  await interaction.guild?.roles.fetch();
  await interaction.guild?.channels.fetch();

  const modRole = interaction.guild?.roles.cache.find((r) =>
    r.name === "Moderator"
  );

  if (!modRole || !interaction.member!.roles.cache.has(modRole.id)) {
    interaction.reply({
      content: "you are not a mod",
      ephemeral: true,
    });
    return;
  }

  const channel = interaction.guild?.channels.cache.get(interaction.channelId);

  const target: GuildMember = channel?.members.find((m: GuildMember) => {
    const roleNames = m.roles.cache.mapValues((v) => v.name).values().toArray();

    return !roleNames.includes("Member") && !roleNames.includes("bot");
  });

  if (!target) {
    interaction.reply({
      content: "no unverified member in this channel :(",
      ephemeral: true,
    });

    return;
  }

  const memberRole = interaction.guild?.roles.cache.values().toArray().find(
    (v) => v.name == "Member",
  );
  if (!memberRole) {
    interaction.reply({
      content: "could not find member role",
      ephemeral: true,
    });
    return;
  }

  target.roles.add(memberRole);

  await interaction.reply({
    content:
      `Good job. The user has been sent a DM informing them where to get roles. The ticket was closed automatically, the user still has access to it. This ticket will be transcribed and deleted after 3 days of inactivity.`,
    ephemeral: true,
  });
  await interaction.channel.send(
    `Hai ${target}, welcome to the server! You can pick some roles in <#1410678077939253438>`,
  );

  const dmChannel = await target.createDM();
  dmChannel.send(
    `Hai ${target}, welcome to NetherTrans! You can pick some roles in <#1410678077939253438>`,
  );

  await interaction.channel.send(
    `?close`,
  );

  const welcomeMessageChannel = interaction.client.channels.cache.get(
    "1396863383911010418",
  ) as TextChannel;

  const message =
    welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)].replace(
      "{}",
      `<@${target.id}>`,
    );

  welcomeMessageChannel?.send(message);
}
