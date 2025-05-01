@echo off
echo 'Linkit7697燒錄批次檔連線窗口是' %1

upload.exe -c %1 -f linkit7697.bin -t cm4 -p mt7697 
IF ERRORLEVEL 0 echo '燒錄完成'
IF ERRORLEVEL 1 echo '燒錄失敗'