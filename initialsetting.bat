@echo off

echo This file will install Express, and EJS packages.
echo These packages are essential for opening the server.
echo Make sure you have an active internet connection.

set /p install_confirm=Do you want to install Express, and EJS? (y/n)
if /i "%install_confirm%" neq "y" exit

echo Installing Express and EJS...
npm install express ejs

echo Setup complete!

pause