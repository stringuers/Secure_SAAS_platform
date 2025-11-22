const appInsights = require('applicationinsights');

const setupAzureMonitor = () => {
    if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
        appInsights.setup()
            .setAutoDependencyCorrelation(true)
            .setAutoCollectRequests(true)
            .setAutoCollectPerformance(true, true)
            .setAutoCollectExceptions(true)
            .setAutoCollectDependencies(true)
            .setAutoCollectConsole(true)
            .setUseDiskRetryCaching(true)
            .setSendLiveMetrics(true)
            .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
            .start();

        console.log('✅ Azure Application Insights enabled');
    } else {
        console.log('⚠️  Azure Application Insights not configured (Local Mode)');
    }
};

module.exports = setupAzureMonitor;
