export function executeBugSimulation(bugType) {
    console.log(`⚠️ [EXECUTOR://DIABLO] Simulating bug routine: ${bugType}`);
    
    switch (bugType) {
        case 'force-crash':
            setTimeout(() => { process.exit(1); }, 1000);
            return "💀 [DIABLO://SYSTEM_CRASH] Initializing hard crash loop sequence...";
        case 'memory-leak':
            return "📈 [DIABLO://LEAK] Buffer array limits flooded. Simulating memory leak...";
        case 'cpu-spike':
            return "🔥 [DIABLO://CPU] Spin-lock sequence deployed. Thread stress active.";
        default:
            return `💀 [DIABLO://BUG_DEPLOYED]\nACTION: ${bugType.toUpperCase()}\nTARGET: STABLE_SESSION\nSTATUS: INJECTED SUCCESSFULLY.`;
    }
}
