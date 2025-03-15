@echo off
echo Fixing dependencies and pushing to GitHub...

REM Change to project directory
cd /d "%~dp0"

REM Fix TailwindCSS Postcss plugin
echo Installing required packages...
call npm install @tailwindcss/postcss

REM Make sure everything is built correctly
echo Building project...
call npm run build

REM Initialize git if not already initialized
if not exist .git (
  echo Initializing git repository...
  git init
)

REM Create a new branch for the fixes
echo Creating fix branch...
git checkout -b fix/dependencies-and-data-source

REM Add all files
echo Adding files to git...
git add .

REM Make the commit
echo Committing changes...
git commit -m "Fix TailwindCSS PostCSS plugin and data source issues"

echo ======================================
echo FIXES APPLIED AND CHANGES COMMITTED
echo ======================================

echo To push to GitHub:
echo 1. Create a repository on GitHub if you haven't already
echo 2. Run the following commands:
echo    git remote add origin https://github.com/YOUR_USERNAME/stock-scanner-ui.git
echo    git push -u origin fix/dependencies-and-data-source
echo 3. Create a pull request from the branch 'fix/dependencies-and-data-source'

echo Press any key to exit...
pause > nul 