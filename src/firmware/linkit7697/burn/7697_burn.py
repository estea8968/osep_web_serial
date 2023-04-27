# -*- coding: utf-8 -*-
import sys
import os
import glob
import serial
import subprocess
from PIL import Image, ImageDraw, ImageFilter
from PyQt5.QtWidgets import QApplication, QWidget, QPushButton, QLabel, QListView, QVBoxLayout, QMessageBox, QGridLayout 
from PyQt5.QtCore import QStringListModel, pyqtSlot
from PyQt5.QtGui import QIcon, QPixmap
  
#global def_url 
#def_url = 'https://estea8968.github.io/s4a_scratch3/'

global def_offline 
##全域變數連接port
global def_port 
def_port = ''
def_disk = ''
if serial.sys.platform.startswith('win'):
    os_name = 'win'
    #path_dir = 'C:\Program Files (x86)\s3-extend-tool'
    def_browser = 'start'
    exe_b_7697 = '".\\burn_7697.bat" '
elif serial.sys.platform.startswith('linux'):
    os_name = 'linux'
    #path_dir = '/opt/s3-extend-tool'
    cpx_sh_name = 'cpx_firmata.sh'
    def_browser = 'browse'
    exe_b_7697 ='gnome-terminal -- ./burn_7697.sh '
elif sys.platform.startswith('darwin'):
    os_name = 'mac'
    #path_dir = '/opt/s3-extend-tool'
    def_browser = 'browse'
    exe_b_7697 ='gnome-terminal -- ./burn_7697.sh '
else:
    os_name = 'other'
    #path_dir = '/opt/s3-extend-tool'
    def_browser = 'firefox'
    exe_b_7697 ='gnome-terminal -- ./burn_7697.sh '

###偵測連接設備port
def serial_ports():
    """ Lists serial port names
  
        :raises EnvironmentError:
            On unsupported or unknown platforms
        :returns:
            A list of the serial ports available on the system
    """
    if serial.sys.platform.startswith('win'):
        ports = ['COM%s' % (i + 1) for i in range(256)]
    elif serial.sys.platform.startswith('linux') or serial.sys.platform.startswith('cygwin'):
        # this excludes your current terminal "/dev/tty"
        ports = glob.glob('/dev/tty[A-Za-z]*')
    elif sys.platform.startswith('darwin'):
        ports = glob.glob('/dev/tty.*')
    else:
        raise EnvironmentError('Unsupported platform')

    result = []
    for port in ports:
        try:
            s = serial.Serial(port)
            s.close()
            result.append(port)
        except  serial.SerialException :
            pass
    return result



class App(QWidget):
    def __init__(self):
        super().__init__()
        self.title = os_name+":LinkIt7696燒錄韌體 ver:1120416"
        #背景圖
        #im_rgb = Image.open('s4a_scratch3.png')
        self.pixmap = QPixmap('images/Linkit7697.png')

        self.left = 100
        self.top = 100
        self.width = 450 
        self.height = 350

        self.initUI()
    
    def initUI(self):
        
        self.setWindowTitle(self.title)
        self.setGeometry(self.left, self.top, self.width, self.height)

        #label
        #l_A = QLabel("選擇功能",self)
        #l_A.setStyleSheet("font: bold 18px;");
        #l_A.move(20,5)
        l_B = QLabel('',self)
        l_B.setPixmap(self.pixmap)
        l_B.resize(300,160)
        l_B.move(50,10)

        b_port = QPushButton("連線port",self)
        b_port.setStyleSheet("font: bold 16px;");
        b_port.setToolTip("選擇連線port")
        b_port.move(150,170)
        b_port.clicked.connect(self.b_port_clicked)
        
        #l_B = QLabel("設備port",self)
        #l_B.move(164,10)
        #https://blog.csdn.net/jia666666/article/details/81624550
        listviewA = QListView(self)
        listviewA.resize(130,50)
        listviewA.move(150,200)
        slm=QStringListModel()

        ##port
        self.qList=serial_ports()
        ##listviewA.qList=['aaaa','bbbb','cccc']
        slm.setStringList(self.qList)
        listviewA.setModel(slm)
        listviewA.clicked.connect(self.listviewA_clicked)

        #再 widget windows 內創建一個 Button 物件
        #b_arduino = QPushButton("Arduino", self)
        #b_arduino.setStyleSheet("font: bold 18px; background-color: rgb(255,0,0);");
        #b_arduino.move(20,32)  # 移動位置
        ##"""方法setToolTip在用戶滑鼠在按鈕上顯示訊息"""
        #b_arduino.setToolTip("連線硬體arduino 執行s3a")
        # 當 button1 這個物件發出訊號時( 被按了) 到 button1_clicked 這個槽執行
        #b_arduino.clicked.connect(self.b_arduino_clicked)

        #b_url = QPushButton("s4a_scratch3網站",self)
        #b_url.setStyleSheet("font: bold 16px; background-color: rgb(109,140,215);");
        #b_url.setToolTip("瀏覽器開啟s4a_scratch3網站")
        #b_url.move(150,265)
        #b_url.clicked.connect(self.b_url_clicked)

        #b_about = QPushButton("about",self)
        #b_about.setToolTip("about 關於")
        #b_about.move(290,232)
        #b_about.clicked.connect(self.b_about_clicked)
        
        b_b_7697 = QPushButton("LinkIt7697燒入韌體",self)
        b_b_7697.setStyleSheet("font: bold 16px; background-color: rgb(200,45,45);");
        b_b_7697.setToolTip("燒入前請選擇port")
        b_b_7697.move(150,250)
        b_b_7697.clicked.connect(self.b_b_7697_clicked)

        self.show()

    # 定義 被觸發時要執行
    @pyqtSlot()
    def b_port_clicked(self):
        global listviewA
        listviewA = QListView(self)
        listviewA.resize(130,50)
        listviewA.move(150,200)
        slm=QStringListModel()

        self.qList=serial_ports()
        slm.setStringList(self.qList)
        listviewA.setModel(slm)
        listviewA.clicked.connect(self.listviewA_clicked)
        listviewA.show()  #self.show()
        
    # 定義 B_7697 被觸發時要執行的
    def b_b_7697_clicked(self):
        if def_port  == '' :
            QMessageBox.information(self,'Error錯誤','no content port沒有連接port')
        else :
            subprocess.call(exe_b_7697 + def_port,shell = True)

    #def listviewA_clicked(listviewA,qModelIndex):
    def listviewA_clicked(self,qModelIndex):
        #提示信息窗，你選擇的訊息
        global def_port
        def_port = self.qList[qModelIndex.row()]
        #QMessageBox.information(self,'ListWidget','你選擇：'+self.qList[qModelIndex.row()])

    def b_about_clicked(self):
        QMessageBox.information(self,'About','Name: Chen estea \n Email:estea8968@gmail.com \n  GNU Affero General Public License v3.0 \nTks...')

if __name__ == '__main__':
    app = QApplication(sys.argv)
    ex = App()
    sys.exit(app.exec_())
