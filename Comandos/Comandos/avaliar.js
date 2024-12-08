const { Client, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "avaliar",
    description: "Deixe uma avaliação na nosso rp",
    category: "Utilidade",
    options: [
        {
          name: "staff/donos",
          description: "mencione o staff/dono",
          type: 6,
          required: true,
        },
        {
            name: "avaliar",
            description: "selecione de 1 estrela a 5 para a qualidade do atendimento",
            type: 3,
            required: true,
            choices: [
                { name: "⭐", value: "⭐" },
                { name: "⭐⭐", value: "⭐⭐" },
                { name: "⭐⭐⭐", value: "⭐⭐⭐" },
                { name: "⭐⭐⭐⭐", value: "⭐⭐⭐⭐" },
                { name: "⭐⭐⭐⭐⭐", value: "⭐⭐⭐⭐⭐"},
            ]
        },
        {
            name: "texto",
            description: "descreva a sua avaliação",
            type: 3,
            required: true,
        },
    ],

    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */

    run: async (client, interaction) => {

        const { options, guild } = interaction;
        const vendedor = options.getUser("staff?dono");
        const estrelas = options.getString("avaliar");
        const texto = options.getString("texto");
    
        const ID = "1076520173428805722"; // Channel onde sera enviado a avaliação
    
        if (!interaction.member.roles.cache.has(Cargo)) {
          return interaction.reply({
            embeds: [
                new EmbedBuilder()
                  .setDescription(':x: Você não tem permissão para usar este comando')
                  .setColor('Red'),
              ],
              ephemeral: true,
          });
        }
    
        const embed = new EmbedBuilder()
          .setAuthor({ name: guild.name, iconURL: guild.iconURL( { dynamic: true } ) })
          .setTitle('Sistema de Feedback :star: ')
          .setDescription('Digite **/avaliar** para enviar um feedback')
          .addFields([
            {
              name: ':writing_hand: ┃ Feedback enviado por:',
              value: `> ${interaction.user} \`[${interaction.user.tag}]\``,
            },
            {
              name: ':bust_in_silhouette: ┃ Atendido por:',
              value: `> ${vendedor} \`[${vendedor.tag}]\``,
            },
            {
              name: '🏆 ┃ Estrelas:',
              value: `> ${estrelas}`,
            },
            {
              name: ':scroll: ┃ Feedback:',
              value: "```" + texto + "```",
            },
          ])
          .setColor('2f3136')
          .setThumbnail(guild.iconURL({ dynamic: true }))
          .setFooter({ text: `© ${guild.name} ┃ Desenvolvido por Drk7.trem#2084`, iconURL: guild.iconURL() })
          .setTimestamp();
    
        guild.channels.cache.get(ID).send({
          embeds: [embed],
        });
    
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`A sua avaliaçao foi enviada con sucesso para o canal <#${ID}>, \n\n Caso tenha alguma dúvida nos contate por ticket [Clicando Aqui](https://discord.com/channels/1027374524016103524/1060980646111092808) \n\n Obrigado pela preferência :)`)
              .setColor('Green'),
          ],
          ephemeral: true,
        });

    }
}