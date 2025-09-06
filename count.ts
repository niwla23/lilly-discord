import { Client, Events, Message, TextChannel } from "discord.js";
import updateMemberCount from "./update-member-count.ts";
import process from "node:process";

let lastNumber = 0;
let lastNumberAuthorId: string | null = null;

function getNumberFromMessage(text: string) {
  const binaryFinder = /\b(?:0b)?([01]+)\b/;
  const results = binaryFinder.exec(text);
  if (!results || results?.length == 0) return null;

  const number = parseInt(results[1], 2);
  return number;
}

export async function initCount(client: Client) {
  const channel = await client.channels.fetch(
    process.env.COUNTING_CHANNEL,
  ) as TextChannel;
  const messages = await channel.messages.fetch({ limit: 10 });
  const latestValidMessage = messages.values().find((v) =>
    getNumberFromMessage(v.content) != null
  );

  if (latestValidMessage) {
    lastNumber = getNumberFromMessage(latestValidMessage.content);
    lastNumberAuthorId = latestValidMessage.author.id;
    latestValidMessage?.react("🚩");
  }
  console.log("latest binary counting number", lastNumber);

  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.channelId != process.env.COUNTING_CHANNEL) return;

    const number = getNumberFromMessage(message.content);
    if (number === null) return;

    if (message.author.id == lastNumberAuthorId) {
      message.react("❌");
      message.reply("nuh uh you cannot count on your own");
      lastNumber = 0;
      lastNumberAuthorId = null;
      return;
    }
    if (number == lastNumber + 1) {
      message.react("1413657480004632627");
      lastNumberAuthorId = message.author.id;
      lastNumber += 1;
    } else {
      message.react("❌");
      message.reply("nope");
      lastNumber = 0;
      lastNumberAuthorId = null;
    }
  });
}
