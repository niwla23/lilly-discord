import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

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
      `You may want to close this ticket now, use /close or the button at the top`,
    ephemeral: true,
  });
  await interaction.channel.send(
    `Hai ${target}, welcome to the server! You can pick some roles in <#1410678077939253438>`,
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
