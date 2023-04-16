#!/bin/bash
if [ ! -n "$1" ];then
	echo "第一個參數為linkit7697的port,通常為/dev/ttyUSB0"
else
	python2.7 ./upload.py -c $1 -f linkit7697.bin  -t cm4 -p mt7697
	if [ $? -ne 0 ];then
	     echo "燒錄失敗"
	else
	     echo "燒錄成功"
	fi
	sleep 3
fi		

