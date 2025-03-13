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

const CHARACTER_MESSAGE_ID_1 = process.env.CHARACTER_MESSAGE_ID_1;

const CHARACTER_MESSAGE_ID_2 = process.env.CHARACTER_MESSAGE_ID_2;

const ROLE_MESSAGE_ID = process.env.ROLE_MESSAGE_ID;


async function sendMessageIfNotExists(channel, emojiMap, envVarName, title) {
  const messageId = process.env[envVarName];
  let message;

  if (messageId) {
    try {
      message = await channel.messages.fetch(messageId);
      console.log(`Fetched existing message: ${envVarName}`);
    } catch {
      console.log(`Message ID stored in ${envVarName} not found, sending new.`);
    }
  }

  if (!message) {
    let description = `**${title}**\n\n`;
    const entries = Object.entries(emojiMap).map(([emoji, role]) => `${emoji} ${role}`);
    description += entries.join(' • ');
    message = await channel.send(description);
    
    // Add reactions
    for (const emoji of Object.keys(emojiMap)) {
      await message.react(emoji);
    }

    console.log(`New message sent for ${envVarName}: ${message.id}`);
    console.log(`IMPORTANT: Set ${envVarName}=${message.id} in Railway variables.`);
  }

  return message.id;
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const channel = await client.channels.fetch(CHANNEL_ID);

  await sendMessageIfNotExists(channel, emojiRoleMap1, CHARACTER_MESSAGE_ID_1, 'Marvel Rivals Characters (1/2)');
  await sendMessageIfNotExists(channel, emojiRoleMap2, CHARACTER_MESSAGE_ID_2, 'Marvel Rivals Characters (2/2)');
  await sendMessageIfNotExists(channel, emojiGeneralRoles, ROLE_MESSAGE_ID, 'Choose Your Game Role');
});

// Combine emoji maps for reaction handling
const allEmojiRoleMaps = { ...emojiRoleMap1, ...emojiRoleMap2, ...emojiGeneralRoles };

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  if (!Object.values(process.env).includes(reaction.message.id)) return;

  const roleName = allEmojiRoleMaps[reaction.emoji.name];
  if (!roleName) return;

  const guild = reaction.message.guild;
  const role = guild.roles.cache.find(r => r.name === roleName);
  const member = await guild.members.fetch(user.id);

  if (role && !member.roles.cache.has(role.id)) {
    await member.roles.add(role);
    console.log(`Assigned ${roleName} to ${user.username}`);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  if (!Object.values(process.env).includes(reaction.message.id)) return;

  const roleName = allEmojiRoleMaps[reaction.emoji.name];
  if (!roleName) return;

  const guild = reaction.message.guild;
  const role = guild.roles.cache.find(r => r.name === roleName);
  const member = await guild.members.fetch(user.id);

  if (role && member.roles.cache.has(role.id)) {
    await member.roles.remove(role);
    console.log(`Removed ${roleName} from ${user.username}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
