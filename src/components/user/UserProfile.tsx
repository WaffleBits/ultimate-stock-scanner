import React, { useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  updateUserPreferences, 
  User, 
  UserPreferences 
} from '../../services/authService';
import { getAlertConfig, saveAlertConfig, AlertConfig } from '../../services/alertService';
import { getApiKey, setApiKey } from '../../services/stockApi';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [apiKey, setApiKeyState] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load user data
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Load API key
    const storedApiKey = getApiKey();
    if (storedApiKey) {
      setApiKeyState(storedApiKey);
    }

    // Load alert config
    const alertConfig = getAlertConfig();
    setDiscordWebhook(alertConfig.discordWebhookUrl || '');
    setAlertsEnabled(alertConfig.enabled || false);
  }, []);

  const handleSavePreferences = () => {
    try {
      // Save API key
      setApiKey(apiKey);

      // Save alert config
      saveAlertConfig({
        enabled: alertsEnabled,
        discordWebhookUrl: discordWebhook.trim()
      });

      // Update user preferences if logged in
      if (user) {
        const preferences: UserPreferences = {
          ...user.preferences,
          apiKeys: {
            finnhub: apiKey
          },
          alertConfig: {
            enabled: alertsEnabled,
            discordWebhookUrl: discordWebhook.trim()
          }
        };

        updateUserPreferences(user.id, preferences);
        setUser({
          ...user,
          preferences
        });
      }

      setSaveMessage('Preferences saved successfully!');
      setError('');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences. Please try again.');
      setSaveMessage('');
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <p className="text-yellow-400">
          You are not logged in. Please log in to save your preferences permanently.
        </p>
        <p className="text-gray-300 mt-2">
          Your settings will be saved to local storage and will be available only on this device.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">User Profile</h2>
      
      {saveMessage && (
        <div className="mb-4 p-2 bg-green-900 text-green-300 rounded">
          {saveMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-900 text-red-300 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-medium">{user.username}</h3>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-700 pt-4 mb-6"></div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-3">API Settings</h3>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-1 text-sm">Finnhub API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            placeholder="Enter your Finnhub API key"
          />
          <p className="text-gray-400 text-xs mt-1">
            Get your free API key at{' '}
            <a 
              href="https://finnhub.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              finnhub.io
            </a>
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Alert Settings</h3>
        
        <div className="mb-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-10 h-6 transition rounded-full ${alertsEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}>
              <div className={`absolute w-4 h-4 transition rounded-full bg-white transform ${alertsEnabled ? 'translate-x-5' : 'translate-x-1'} top-1`}></div>
            </div>
            <span className="ml-3 text-gray-300">Enable Discord Alerts</span>
          </label>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-1 text-sm">Discord Webhook URL</label>
          <input
            type="text"
            value={discordWebhook}
            onChange={(e) => setDiscordWebhook(e.target.value)}
            disabled={!alertsEnabled}
            className={`w-full px-3 py-2 rounded ${alertsEnabled ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-500'}`}
            placeholder="Enter your Discord webhook URL"
          />
          <p className="text-gray-400 text-xs mt-1">
            Create a webhook in your Discord server settings
          </p>
        </div>
      </div>
      
      <button
        onClick={handleSavePreferences}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Save Preferences
      </button>
    </div>
  );
};

export default UserProfile; 