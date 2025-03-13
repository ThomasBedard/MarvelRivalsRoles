# Marvel Rivals Roles for Discord Servers

This discord app / bot is useful if you want users to assign themselves roles based on the characters of the game **Marvel Rivals**

---

## Deployment

### If you want to host this, there's a few environment variables you need to add:

** YOU NEED TO DEPLOY IT TWICE TO GET THE MESSAGES ID **

- You can get some of them **directly on the discord app / website** (make sure to enable Developer Mode in settings)

- The other ones are in the **Discord Developer Portal**.

```env
DISCORD_TOKEN= // Located in the bots tab within the Discord Developer Portal, the token should be there (you can reset and have a new one)
CLIENT_ID= // Located in the OAuth2 Tab within the Discord Developer Portal.
GUILD_ID= // Your discord server's ID, you can get it by right clicking on your server and copying the id
CHANNEL_ID= // Your discord server's channel ID where the bot will post the messages, you can get it by right clicking on a server channel and copying the id.
//After the first deploy for the bot to avoid resending the message multiple times.
CHARACTER_MESSAGE_ID_1=
CHARACTER_MESSAGE_ID_2=
ROLE_MESSAGE_ID=
```
