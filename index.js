const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, ActivityType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const config = require('./config.json'); 

const usedCodes = new Set();

if (fs.existsSync('users.txt')) {
  const redeemedUsers = fs.readFileSync('users.txt', 'utf-8').split('\n').filter(Boolean);
  redeemedUsers.forEach(user => usedCodes.add(user));
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Register commands
const commands = [
  {
    name: 'Resgatar Nitro',
    description: 'discord.gg/posse'
  }
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('Nitro Gratuitamente Após dar Feedback');

    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });

    console.log('Bot iniciado com sucesso!');
    console.log(`
            ███╗   ██╗██╗   ██╗██╗  ██╗     ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗   ██╗███╗   ██╗██╗████████╗██╗   ██╗
            ████╗  ██║╚██╗ ██╔╝╚██╗██╔╝    ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║   ██║████╗  ██║██║╚══██╔══╝╚██╗ ██╔╝
            ██╔██╗ ██║ ╚████╔╝  ╚███╔╝     ██║     ██║   ██║██╔████╔██║██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║    ╚████╔╝ 
            ██║╚██╗██║  ╚██╔╝   ██╔██╗     ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║     ╚██╔╝  
            ██║ ╚████║   ██║   ██╔╝ ██╗    ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██║   ██║      ██║   
            ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝     ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝      ╚═╝   
                                                                                                              
`); 
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log(`Logado Como: ${client.user.tag}`);

  client.user.setPresence({
    activities: [{
      name: '.gg/posse',
      type: ActivityType.Streaming,
      url: config.twitchUrl
    }],
    status: 'online'
  });
});

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const { commandName } = interaction;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
      return;
    }

    if (commandName === 'gerador') {
      const hasSentMessage = await checkUserMessage(interaction.user.id, config.canalid);

      if (!hasSentMessage) {
        await interaction.reply({ content: `Você precisa avaliar nós em https://discord.com/channels/${guildId}/${canalid} antes de resgatar um Nitro.`, ephemeral: true });
        return;
      }

      const button = new ButtonBuilder()
        .setCustomId('resgatar_nitro')
        .setLabel('Resgatar Nitro Gratuitamente')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({ content: '# Clique no botão abaixo para resgatar um nitro:', components: [row], ephemeral: false });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'resgatar_nitro') {
      if (usedCodes.has(interaction.user.id)) {
        await interaction.reply({ content: '❌ Você já resgatou sua recompensa!', ephemeral: true });
        return;
      }

      const nitroCode = getNitroCode();
      if (!nitroCode) {
        await interaction.reply({ content: '❌ Não há mais códigos disponíveis.', ephemeral: true });
        return;
      }

      usedCodes.add(interaction.user.id);
      fs.appendFileSync('users.txt', `${interaction.user.id}\n`);

      try {
        const shopButton = new ButtonBuilder()
          .setLabel('Visitar a Loja')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/posse'); // substitua pelo seu link

        const row = new ActionRowBuilder().addComponents(shopButton);

        await interaction.user.send({
          content: `🎉 Obrigado pela sua avaliação, ${interaction.user}! Você recebeu o cargo necessário para resgatar sua recompensa. Use o botão "Resgatar Recompensa" para recebê-la.\n\n🎉 Parabéns, vazamentinhos! Aqui está seu Nitro:\n\n**${nitroCode}**\n\n**Visite nossa loja para mais ofertas incríveis!**`,
          components: [row]
        });

        const dmChannel = await interaction.user.createDM();

        const dmButton = new ButtonBuilder()
          .setLabel('Ir para a DM')
          .setStyle(ButtonStyle.Link)
          .setURL(dmChannel.url);

        const row2 = new ActionRowBuilder().addComponents(dmButton);

        await interaction.reply({ content: '✅ Sua recompensa foi enviada no seu privado!', components: [row2], ephemeral: true });
      } catch (error) {
        console.error(`Could not send DM to ${interaction.user.tag}:`, error);
        await interaction.reply({ content: 'Não foi possível enviar uma DM para você. Por favor, verifique suas configurações de privacidade.', ephemeral: true });
      }
    }
  }
});

async function checkUserMessage(userId, channelId) {
  const channel = await client.channels.fetch(channelId);
  const messages = await channel.messages.fetch({ limit: 100 });

  return messages.some(message => message.author.id === userId);
}

function getNitroCode() {
  const data = fs.readFileSync('nitros.txt', 'utf-8');
  const lines = data.split('\n').filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  const code = lines[0];
  const updatedData = lines.slice(1).join('\n');
  fs.writeFileSync('nitros.txt', updatedData, 'utf-8');

  return code;
}

client.login(config.token);
