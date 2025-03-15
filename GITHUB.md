# Pushing to GitHub

To push this project to your GitHub account, follow these instructions:

## Using the Provided Batch File (Windows)

1. First, create a new repository on GitHub:
   - Go to [GitHub](https://github.com)
   - Click the "+" icon in the upper-right corner and select "New repository"
   - Name your repository (e.g., "stock-scanner-ui")
   - Do not initialize the repository with a README, .gitignore, or license
   - Click "Create repository"

2. Copy the repository URL (e.g., `https://github.com/yourusername/stock-scanner-ui.git`)

3. Run the `push-to-github.bat` file:
   - Double-click the file in your project directory
   - When prompted, paste the repository URL you copied
   - Enter your GitHub credentials when prompted

4. The batch file will:
   - Initialize a git repository
   - Add all project files
   - Create an initial commit
   - Set up the remote repository
   - Push the project to GitHub

## Manual Method

If you prefer to use the command line or if the batch file doesn't work:

```bash
# Initialize a repository
git init

# Add all files
git add .

# Commit the changes
git commit -m "Initial commit: Stock Scanner UI application"

# Add the remote repository
git remote add origin https://github.com/yourusername/stock-scanner-ui.git

# Push to GitHub
git push -u origin master
```

Replace `yourusername` with your actual GitHub username and `stock-scanner-ui` with your repository name.

## Troubleshooting

- **Authentication Issues**: If you're having trouble authenticating, you might need to set up a personal access token. See [GitHub's documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) for details.

- **Repository Exists**: If you get an error about the repository already existing, you may need to pull first (`git pull origin master --allow-unrelated-histories`).

- **Branch Name Issues**: Newer Git installations use `main` instead of `master` as the default branch name. If your command fails, try using `main` instead. 