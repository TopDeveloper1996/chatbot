call npm run clean
call npm cache clean --force
call rmdir /s /q node_modules
@REM call del package-lock.json
call npm install --save