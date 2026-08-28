export default {
    name: 'alive',
    adminOnly: false,
    execute: (ctx) => {
        return `😈 *${ctx.BOT_NAME}* IS ALIVE & RUNNING\n\n> MODE: DIABLO PROTOCOLS\n> PREFIX: ${ctx.PREFIX}\n> SECURITY ENFORCEMENT: ACTIVE`;
    }
};
