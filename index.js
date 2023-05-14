const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, GuildMember } = require ("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

const token = "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"

const send = async (message, dontSendHistory = false) => {
    const messages = [];

    messages.push({
        role: 'user',
        content: message
    });

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.9,
                max_tokens: 2048,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0.6,
                stop: ['213431241324123412341324312413241234']
            })
        });

        const data = await response.json();
        const result = data.choices && data.choices.length > 0 ? data.choices[0].message : null;

        if (result) {
            messages.push(result);
            return result.content;
        } else {
            throw new Error('The answer is empty.');
        }
    } catch(error) {
        console.error(`Error: `, error);
        return 'An error occurred while processing the request.';
    }
};


const chatgpt = new SlashCommandBuilder()
    .setName("chatgpt")
    .setDescription("Pop a question for ChatGPT")
    .addStringOption(option => 
        option.setName('input')
            .setDescription('Enter your ask for ChatGPT')
            .setRequired(true));

client.on('ready', () => {
    console.log(`Success loaded ${client.user.tag}`);
    client.application.commands.create(chatgpt.toJSON());
});
client.on('interactionCreate', async (interaction) => {
    if(!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if(commandName === 'chatgpt')
    {
            const argument = options.getString("input")
            await interaction.deferReply({ ephemeral: false });
            const responseFromChatGPT = await send(`${argument}`)

            let embed = new EmbedBuilder()
                .setColor(`Green`)
                .setTitle(`Response from ChatGPT`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(`**${interaction.user.username}'s ask:** _${argument}_\n\n**_ChatGPT_:** ${responseFromChatGPT}`)
                .setFooter({text: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: `${interaction.user.displayAvatarURL()}`})
            await interaction.editReply({embeds: [embed]})
    }
})
client.login("MTEwNzI4NjA5NjU3ODA4OTA4MA.GN2tHR.3n1XUf85NlYDuh9L8SYH9-s3OmqnSckV_zONks");