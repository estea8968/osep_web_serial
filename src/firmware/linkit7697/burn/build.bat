@echo off
set one=%1
set two=%2 
if "%one%"=="" (
echo 請輸入連線com port) else ( if "%two%"=="" (echo 請輸入韌體檔案名稱) else echo upload.exe -c %1 -f %2 -t cm4 -p mt7697 ) 

