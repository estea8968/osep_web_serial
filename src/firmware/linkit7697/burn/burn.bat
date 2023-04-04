@echo off
echo linkit7697燒錄程式，連線com port 是 %1
upload.exe -c %1 -f linkit7697.bin -t cm4 -p mt7697 

