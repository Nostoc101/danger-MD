export default {
    name: 'ping',
    adminOnly: false,
    execute: (ctx) => {
        return `🚀 [NOSTOC-MD://PING]\nLATENCY : ${Date.now() - ctx.timestamp}ms\nSTATUS : ONLINE\nTARGET : ${ctx.TARGET_PHONE}`;
    }
};
