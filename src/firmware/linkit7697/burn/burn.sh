#!/bin/bash
if [ ! -n "$1" ];then
	echo "第一個參數為linkit7697的port,通常為/dev/ttyUSB0"
else
#	if [ ! -n "$2" ];then
#		echo "第二個參數為linkit7697的韌體檔名稱,通常為linkit7697.bin"
#	else 
python2.7 ./upload.py -c $1 -f linkit7697.bin  -t cm4 -p mt7697
#	fi
fi		

