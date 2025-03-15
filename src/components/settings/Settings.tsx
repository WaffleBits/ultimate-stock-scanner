import React, { useState, useEffect } from 'react';
import { getApiKey, setApiKey, getDataSource, setDataSource, DataSource } from '../../services/stockApi';
import { getAlertConfig, saveAlertConfig, testDiscordWebhook, AlertConfig } from '../../services/alertService';
import { getCurrentUser, updateUserPreferences } from '../../services/authService';

const Settings: React.FC = () => {
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [dataSource, setDataSourceState] = useState<DataSource>(getDataSource());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Load settings on component mount
  useEffect(() => {
    const alertConfig = getAlertConfig();
    setDiscordWebhook(alertConfig.discordWebhookUrl);
    setAlertsEnabled(alertConfig.enabled);
  }, []);
  
  // Handle API key change
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyState(e.target.value);
  };
  
  // Handle Discord webhook change
  const handleWebhookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscordWebhook(e.target.value);
  };
  
  // Handle alerts enabled toggle
  const handleAlertsEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlertsEnabled(e.target.checked);
  };

  // Handle data source change
  const handleDataSourceChange = (source: DataSource) => {
    setDataSourceState(source);
  };
  
  // Test Discord webhook
  const handleTestWebhook = async () => {
    if (!discordWebhook) {
      setTestResult({
        success: false,
        message: 'Please enter a Discord webhook URL first',
      });
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const success = await testDiscordWebhook(discordWebhook);
      
      setTestResult({
        success,
        message: success 
          ? 'Test message sent successfully!' 
          : 'Failed to send test message. Please check your webhook URL.',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'An error occurred while testing the webhook.',
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Save API key
      setApiKey(apiKey);
      
      // Save data source
      setDataSource(dataSource);
      
      // Save alert config
      const alertConfig: AlertConfig = {
        enabled: alertsEnabled,
        discordWebhookUrl: discordWebhook,
      };
      saveAlertConfig(alertConfig);
      
      // If user is logged in, save to user preferences
      const currentUser = getCurrentUser();
      if (currentUser) {
        updateUserPreferences({
          apiKeys: {
            ...currentUser.preferences.apiKeys,
            finnhub: apiKey,
          },
          alertConfig,
        });
      }
      
      setSaveMessage('Settings saved successfully!');
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Settings</h2>
      
      {/* Data Source Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Data Source</h3>
        <p className="text-gray-300 mb-3 text-sm">
          Choose where to get market data from. Yahoo Finance doesn't require an API key.
        </p>
        
        <div className="flex space-x-4 mb-2">
          <button
            onClick={() => handleDataSourceChange('yahoo')}
            className={`px-4 py-2 rounded ${
              dataSource === 'yahoo' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Yahoo Finance (No API Key)
          </button>
          
          <button
            onClick={() => handleDataSourceChange('finnhub')}
            className={`px-4 py-2 rounded ${
              dataSource === 'finnhub' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Finnhub API
          </button>
        </div>
      </div>
      
      {/* API Key Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">API Configuration</h3>
        <p className="text-gray-300 mb-3 text-sm">
          {dataSource === 'finnhub' 
            ? 'Enter your Finnhub API key below. ' 
            : 'Finnhub API keys are optional with Yahoo Finance as your data source. '}
          <a 
            href="https://finnhub.io/register" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Get a free API key here.
          </a>
        </p>
        
        <div className="flex flex-col">
          <label className="text-gray-300 mb-1 text-sm">Finnhub API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your Finnhub API key"
            className={`px-3 py-2 rounded mb-2 ${
              dataSource === 'finnhub'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          />
        </div>
      </div>
      
      {/* Discord Webhook Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Alert Configuration</h3>
        <p className="text-gray-300 mb-3 text-sm">
          Configure Discord alerts for scan results. 
          <a 
            href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 ml-1 hover:underline"
          >
            Learn how to create a Discord webhook.
          </a>
        </p>
        
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="alertsEnabled"
            checked={alertsEnabled}
            onChange={handleAlertsEnabledChange}
            className="mr-2"
          />
          <label htmlFor="alertsEnabled" className="text-gray-300">
            Enable Discord alerts
          </label>
        </div>
        
        <div className="flex flex-col mb-3">
          <label className="text-gray-300 mb-1 text-sm">Discord Webhook URL</label>
          <input
            type="text"
            value={discordWebhook}
            onChange={handleWebhookChange}
            placeholder="Enter your Discord webhook URL"
            className={`px-3 py-2 rounded mb-2 ${
              alertsEnabled
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
            disabled={!alertsEnabled}
          />
        </div>
        
        <button
          onClick={handleTestWebhook}
          disabled={isTesting || !discordWebhook || !alertsEnabled}
          className={`py-2 px-4 rounded text-sm ${
            isTesting || !discordWebhook || !alertsEnabled
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isTesting ? 'Testing...' : 'Test Webhook'}
        </button>
        
        {testResult && (
          <div className={`mt-2 p-2 rounded text-sm ${
            testResult.success ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}>
            {testResult.message}
          </div>
        )}
      </div>
      
      {/* Save Button */}
      <button
        onClick={handleSaveSettings}
        disabled={isSaving}
        className={`w-full py-2 px-4 rounded font-medium ${
          isSaving
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isSaving ? 'Saving...' : 'Save Settings'}
      </button>
      
      {saveMessage && (
        <div className="mt-2 p-2 bg-blue-900 text-blue-300 rounded text-sm">
          {saveMessage}
        </div>
      )}
    </div>
  );
};

export default Settings; 