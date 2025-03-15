@echo off
echo Setting up Git repository and pushing to GitHub...

REM Change to project directory
cd /d "%~dp0"

REM Check if git is installed
git --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Git is not installed. Please install Git from https://git-scm.com/
    pause
    exit /b
)

REM Initialize Git repository
git init
if %errorlevel% neq 0 (
    echo Failed to initialize Git repository.
    pause
    exit /b
)

REM Add all files
git add .
if %errorlevel% neq 0 (
    echo Failed to add files.
    pause
    exit /b
)

REM Initial commit
git commit -m "Initial commit: Stock Scanner UI application"
if %errorlevel% neq 0 (
    echo Failed to commit files.
    pause
    exit /b
)

REM Prompt for GitHub repository URL
set /p REPO_URL=Enter your GitHub repository URL (e.g., https://github.com/yourusername/stock-scanner-ui.git): 

REM Add remote
git remote add origin %REPO_URL%
if %errorlevel% neq 0 (
    echo Failed to add remote repository.
    pause
    exit /b
)

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin master
if %errorlevel% neq 0 (
    echo Failed to push to GitHub. You might need to:
    echo 1. Create the repository on GitHub first
    echo 2. Authenticate with GitHub (if prompted)
    echo 3. Try pushing again with: git push -u origin master
    pause
    exit /b
)

echo Repository successfully pushed to GitHub!
echo Press any key to exit...
pause > nul 