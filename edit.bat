SETLOCAL ENABLEDELAYEDEXPANSION
@echo off

echo.

echo Current directory: 
type directory
echo.
echo Current port: 
type port
echo.

set /p choice=Enter 'y' to modify directory, 'n' to skip: 
if "%choice%"=="y" (
  set /p directory=Enter the directory:
  echo !directory! > directory
  echo Directory has been updated.
)

set /p choice=Enter 'y' to modify port, 'n' to skip: 
if "%choice%"=="y" (
  set /p port=Enter the port: 
  echo !port! > port
  echo Port has been updated.
)

echo.
echo Modified!.
echo.
echo Current directory: 
type directory
echo.
echo Current port: 
type port
echo.
pause
