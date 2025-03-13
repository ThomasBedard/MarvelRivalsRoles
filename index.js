require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Split emoji maps to handle Discord's 20 emoji reactions per message limit:
const emojiRoleMap1 = {
  '🕷️': 'Spider-Man', '⚡': 'Thor', '🛡️': 'Captain America', '💎': 'Iron Man',
  '💥': 'Hulk', '🏹': 'Hawkeye', '🪄': 'Scarlet Witch', '🧙': 'Doctor Strange',
  '🦝': 'Rocket Raccoon', '🌳': 'Groot', '🐾': 'Black Panther', '👩': 'Black Widow',
  '❄️': 'Winter Soldier', '👑': 'Loki', '🧲': 'Magneto', '🌙': 'Moon Knight',
  '🔱': 'Namor', '🐺': 'Wolverine', '🔥': 'Human Torch', '🪨': 'The Thing'
};

const emojiRoleMap2 = {
  '🧟': 'Venom', '💀': 'The Punisher', '⛈️': 'Storm', '🤖': 'Peni Parker',
  '🖤': 'Hela', '🐉': 'Iron Fist', '✨': 'Magik', '🧠': 'Mister Fantastic',
  '🦋': 'Psylocke', '🐿️': 'Squirrel Girl', '🚀': 'Star Lord', '🌠': 'Adam Warlock',
  '🕶️': 'Cloak & Dagger', '👱': 'Invisible Woman', '🦈': 'Jeff the Land Shark',
  '🎤': 'Luna Snow', '🌱': 'Mantis'
};

const emojiGeneralRoles = {
  '⚔️': 'Duelist',
  '🛡️': 'Vanguard',
  '📖': 'Strategist',
};

const CHANNEL_ID = process.env.CHANNEL_ID;

const MESSAGE_IDS = {
  CHARACTERS_1: process.env.CHARACTER_MESSAGE_ID_1,
  CHARACTERS_2: process.env.CHARACTER_MESSAGE_ID_2,
  ROLES: process.env.ROLE_MESSAGE_ID,
};

async function fetchOrSend(channel, id, emojiMap, title, varName) {
  let message;

  if (id) {
    try {
      message = await channel.messages.fetch(id);
      console.log(`Fetched existing message for ${varName}`);
    } catch {
      console.log(`Could not fetch message with ID ${id}.`);
    }
  }

  if (!message) {
    let description = `**${title}**\n\n`;
    description += Object.entries(emojiMap).map(([emoji, role]) => `${emoji} ${role}`).join(' • ');

    message = await channel.send(description);
    for (const emoji of Object.keys(emojiMap)) {
      await message.react(emoji);
    }

    console.log(`Sent new message for ${varName}: ${message.id}`);
    console.log(`Set ${varName}=${message.id} in Railway variables.`);
  }

  return message.id;
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = await client.channels.fetch(CHANNEL_ID);

  const id1 = await fetchOrSend(channel, MESSAGE_IDS.CHARACTERS_1, emojiRoleMap1, 'Marvel Rivals Characters (1/2)', 'CHARACTER_MESSAGE_ID_1');
  const id2 = await fetchOrSend(channel, MESSAGE_IDS.CHARACTERS_2, emojiRoleMap2, 'Marvel Rivals Characters (2/2)', 'CHARACTER_MESSAGE_ID_2');
  const id3 = await fetchOrSend(channel, MESSAGE_IDS.ROLES, emojiGeneralRoles, 'Choose Your Game Role', 'ROLE_MESSAGE_ID');

  console.log('Final IDs:', { id1, id2, id3 });
});

client.login(process.env.DISCORD_TOKEN);
