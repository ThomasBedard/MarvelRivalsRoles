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

let messageIds = {};

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const channel = await client.channels.fetch(CHANNEL_ID);

  // Function to send messages horizontally
  async function sendMessageAndReactHorizontal(emojiMap, title) {
    let description = `**${title}**\n\n`;
    const entries = Object.entries(emojiMap).map(([emoji, role]) => `${emoji} ${role}`);
    description += entries.join(' • ');

    const sentMessage = await channel.send(description);
    for (const emoji of Object.keys(emojiMap)) {
      await sentMessage.react(emoji);
    }
    return sentMessage.id;
  }

  // Sending horizontally arranged messages:
  messageIds.message1 = await sendMessageAndReactHorizontal(emojiRoleMap1, 'Marvel Rivals Characters (1/2)');
  messageIds.message2 = await sendMessageAndReactHorizontal(emojiRoleMap2, 'Marvel Rivals Characters (2/2)');
  messageIds.message3 = await sendMessageAndReactHorizontal(emojiGeneralRoles, 'Choose Your Game Role');
});

const allEmojiRoleMaps = { ...emojiRoleMap1, ...emojiRoleMap2, ...emojiGeneralRoles };

// Reaction ADD
client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;

  if (!Object.values(messageIds).includes(reaction.message.id)) return;

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
  if (!Object.values(messageIds).includes(reaction.message.id)) return;

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
