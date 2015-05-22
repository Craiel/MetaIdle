@echo off

SET ROOTDIR=%~dp0

echo.
echo -----------------------
echo Building
echo.

"Build\Release\CrystalBuild.exe" -p buildConfigDebug.json -d
