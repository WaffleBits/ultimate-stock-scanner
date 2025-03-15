import axios from 'axios';

// Interface for alert configuration
export interface AlertConfig {
  enabled: boolean;
  discordWebhookUrl: string;
}

// Get stored alert configuration
export const getAlertConfig = (): AlertConfig => {
  const config = localStorage.getItem('alert_config');
  if (config) {
    return JSON.parse(config);
  }
  return {
    enabled: false,
    discordWebhookUrl: '',
  };
};

// Save alert configuration
export const saveAlertConfig = (config: AlertConfig): void => {
  localStorage.setItem('alert_config', JSON.stringify(config));
};

// Test if Discord webhook is valid and working
export const testDiscordWebhook = async (webhookUrl: string): Promise<boolean> => {
  try {
    await axios.post(webhookUrl, {
      content: '🔔 Test alert from Ultimate Stock Scanner',
      embeds: [
        {
          title: 'Connection Test',
          description: 'This is a test alert to verify your Discord webhook is properly configured.',
          color: 0x5865F2, // Discord blue
          footer: {
            text: 'Ultimate Stock Scanner',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Error testing Discord webhook:', error);
    return false;
  }
};

// Send alert to Discord for stock scan results
export const sendScanResultsAlert = async (
  scanType: string,
  results: string[],
  totalScanned: number
): Promise<boolean> => {
  const config = getAlertConfig();
  
  if (!config.enabled || !config.discordWebhookUrl) {
    return false;
  }
  
  try {
    // Format the results for the Discord message
    const description = results.length > 0
      ? `Found ${results.length} stocks matching your criteria out of ${totalScanned} scanned.`
      : `No stocks matched your criteria out of ${totalScanned} scanned.`;
      
    // Format the results for display
    let resultsList = '';
    if (results.length > 0) {
      // Limit to 20 results to avoid message size limits
      const displayResults = results.slice(0, 20);
      resultsList = displayResults.join(', ');
      
      if (results.length > 20) {
        resultsList += ` and ${results.length - 20} more...`;
      }
    }
    
    await axios.post(config.discordWebhookUrl, {
      content: `🔔 ${scanType} Scan Results Alert`,
      embeds: [
        {
          title: `${scanType} Scan Results`,
          description,
          color: 0x00FF00, // Green for success
          fields: results.length > 0 ? [
            {
              name: 'Matching Stocks',
              value: resultsList,
            },
          ] : [],
          footer: {
            text: 'Ultimate Stock Scanner',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
    
    return true;
  } catch (error) {
    console.error('Error sending alert to Discord:', error);
    return false;
  }
};

// Send a custom alert to Discord
export const sendCustomAlert = async (
  title: string,
  message: string,
  color: number = 0x5865F2 // Discord blue by default
): Promise<boolean> => {
  const config = getAlertConfig();
  
  if (!config.enabled || !config.discordWebhookUrl) {
    return false;
  }
  
  try {
    await axios.post(config.discordWebhookUrl, {
      embeds: [
        {
          title,
          description: message,
          color,
          footer: {
            text: 'Ultimate Stock Scanner',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
    
    return true;
  } catch (error) {
    console.error('Error sending custom alert to Discord:', error);
    return false;
  }
}; 