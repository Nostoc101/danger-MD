import { bugList } from '../bugmanifest.js';

export default {
    name: 'menu',
    adminOnly: false,
    execute: (ctx) => {
        let menuText = `📜 [${ctx.BOT_NAME.toUpperCase()} MENU]\n` +
                      `> ${ctx.PREFIX}status - Check bot status\n` +
                      `> ${ctx.PREFIX}ping - Check latency\n` +
                      `> ${ctx.PREFIX}alive - System availability\n` +
                      `> ${ctx.PREFIX}menu - Show this view\n\n` +
                      `🔥 [DIABLO ULTRA-BUG TRIGGERS]\n`;
        
        bugList.forEach(b => {
            menuText += `> ${ctx.PREFIX}${b.trigger}\n`;
        });

        menuText += `\n----------------------------------------\nOperator: ${ctx.OWNER_NAME}`;
        return menuText;
    }
};
