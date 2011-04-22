@echo off

echo Building source...

del output\micros.js
type source\copyright.txt >> output\micros.js

echo. >> output\micros.js
type source\micros.js >> output\micros.js

echo. >> output\micros.js
type source\browser.js >> output\micros.js

REM depends on browser
echo. >> output\micros.js
type source\os.js >> output\micros.js

echo. >> output\micros.js
type source\animation.js >> output\micros.js

echo. >> output\micros.js
type source\event.js >> output\micros.js

echo. >> output\micros.js
type source\sound.js >> output\micros.js

echo. >> output\micros.js
type source\sprite.js >> output\micros.js

echo. >> output\micros.js
type source\init.js >> output\micros.js

echo Done.