export default {
    name: 'status',
    adminOnly: false,
    execute: (ctx) => {
        return `BOT : ${ctx.BOT_NAME}\nSTATUS : OPERATIONAL\nINTEGRITY: 100%\nOPERATOR : ${ctx.OWNER_NAME}\nNUMBER : ${ctx.TARGET_PHONE}`;
    }
};
