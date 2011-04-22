@echo off

echo Generating docs...

call NaturalDocs -i "%CD%\source" -o HTML "%CD%\output\docs" -p "%CD%\docs"