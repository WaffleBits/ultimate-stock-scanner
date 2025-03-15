// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: number;
  preferences: UserPreferences;
}

// User preferences interface
export interface UserPreferences {
  watchlists: Record<string, string[]>; // Named watchlists with arrays of symbols
  defaultWatchlist: string;
  alertConfig: {
    enabled: boolean;
    discordWebhookUrl: string;
  };
  apiKeys: {
    finnhub?: string;
    alphavantage?: string;
    // Other API services can be added here
  };
}

// Storage key for the current user
const CURRENT_USER_KEY = 'current_user';
const USERS_KEY = 'users';

// Get all users from local storage
const getUsers = (): Record<string, User> => {
  const usersJSON = localStorage.getItem(USERS_KEY);
  return usersJSON ? JSON.parse(usersJSON) : {};
};

// Save all users to local storage
const saveUsers = (users: Record<string, User>): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Get the current user from local storage
export const getCurrentUser = (): User | null => {
  const userJSON = localStorage.getItem(CURRENT_USER_KEY);
  return userJSON ? JSON.parse(userJSON) : null;
};

// Save the current user to local storage
export const saveCurrentUser = (user: User): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

// Clear the current user from local storage
export const clearCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Register a new user
export const registerUser = (username: string, email: string, password: string): User => {
  const users = getUsers();
  
  // Check if username already exists
  if (Object.values(users).some(user => user.username === username)) {
    throw new Error('Username already exists');
  }
  
  // In a real app, we would hash the password and use a proper user ID system
  // For this demo, we'll just use a timestamp as the ID and not store the password
  const userId = `user_${Date.now()}`;
  
  // Create a new user with default preferences
  const newUser: User = {
    id: userId,
    username,
    email,
    createdAt: Date.now(),
    preferences: {
      watchlists: {
        'Default': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META']
      },
      defaultWatchlist: 'Default',
      alertConfig: {
        enabled: false,
        discordWebhookUrl: '',
      },
      apiKeys: {},
    }
  };
  
  // Store user in users object
  users[userId] = newUser;
  saveUsers(users);
  
  // Set as current user
  saveCurrentUser(newUser);
  
  return newUser;
};

// Login a user
export const loginUser = (username: string, password: string): User => {
  const users = getUsers();
  
  // Find user with matching username
  const user = Object.values(users).find(user => user.username === username);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // In a real app, we would verify the password here
  // For this demo, we'll just assume it's correct
  
  // Set as current user
  saveCurrentUser(user);
  
  return user;
};

// Update user preferences
export const updateUserPreferences = (preferences: Partial<UserPreferences>): User | null => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return null;
  }
  
  // Merge the new preferences with the existing ones
  const updatedUser: User = {
    ...currentUser,
    preferences: {
      ...currentUser.preferences,
      ...preferences,
    }
  };
  
  // Update the user in local storage
  const users = getUsers();
  users[currentUser.id] = updatedUser;
  saveUsers(users);
  
  // Update the current user
  saveCurrentUser(updatedUser);
  
  return updatedUser;
};

// Get a user's watchlist
export const getUserWatchlist = (watchlistName?: string): string[] => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    // Return default watchlist for non-logged in users
    const defaultWatchlist = localStorage.getItem('watchlist');
    return defaultWatchlist ? JSON.parse(defaultWatchlist) : ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
  }
  
  const listName = watchlistName || currentUser.preferences.defaultWatchlist;
  return currentUser.preferences.watchlists[listName] || [];
};

// Save a user's watchlist
export const saveUserWatchlist = (symbols: string[], watchlistName?: string): boolean => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    // Save to local storage for non-logged in users
    localStorage.setItem('watchlist', JSON.stringify(symbols));
    return true;
  }
  
  const listName = watchlistName || currentUser.preferences.defaultWatchlist;
  
  // Update the user's watchlist
  const updatedPreferences: Partial<UserPreferences> = {
    watchlists: {
      ...currentUser.preferences.watchlists,
      [listName]: symbols,
    }
  };
  
  updateUserPreferences(updatedPreferences);
  return true;
}; 