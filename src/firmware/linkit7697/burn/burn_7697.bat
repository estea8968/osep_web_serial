@echo off
echo 'Linkit7697�N���妸�ɳs�u���f�O' %1

upload.exe -c %1 -f linkit7697.bin -t cm4 -p mt7697 
IF ERRORLEVEL 0 echo '�N������'
IF ERRORLEVEL 1 echo '�N������'