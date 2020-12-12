cd server
@REM start "" dev.cmd
start cmd.exe /c node build/main.js

cd ../
cd mus-vue
cd dist
http-server -c-1

