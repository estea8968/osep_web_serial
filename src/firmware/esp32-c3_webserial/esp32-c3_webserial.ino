/*
 * 115/07/17 
 * esp32c3 SDA:6 SCL:7 SCK:8 MISO:9 MOSI:10 RX:20 TX:21 analog:2-5 digital:2-10 20 21 
 */
//#include<WiFi.h>
#include <ESP32Servo.h>
#include <DHTStable.h>
#include <Wire.h> 
//lcd
#include <LiquidCrystal_I2C.h>
//oled
#include <U8g2lib.h>
#include "u8g2_font_e58524b32706dda48e7107fc64bfd183.h"
#include <Arduino.h>
//#include <Adafruit_SSD1306.h>
////#include <string.h>

//max7219
#include <MD_Parola.h>
#include <MD_MAX72xx.h>
#include <SPI.h>

//ws2812
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

#define NUMPIXELS 12 // Popular NeoPixel ring size
Adafruit_NeoPixel pixels(NUMPIXELS, 20, NEO_GRB + NEO_KHZ800);

//qrcode SDA:8 SCL:9
//Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
//Adafruit_SSD1306 display(128, 64, &Wire, -1);
U8G2_SSD1306_128X64_NONAME_1_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE); //Arduino搭配SSD1306(0.96" OLED)用這行
//U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

//qrcode
#include "QRCodeGenerator.h"
QRCode qrcode;
#define QR_VERSION 3 // 版本 3 的規格為 29x29 格子
//uint8_t qrcodeData[qrcode_getBufferSize(QR_VERSION)];
uint8_t qrcodeData[202]; // 直接指定 Version 3 所需的 202 位元組 Version 9 是352
// 放大參數設定
const int SCALE = 2; // 放大 2 倍 (29格 * 2 = 58像素，剛好塞進 64 像素的高度內)

//pwm
// setting PWM properties
const int freq = 5000;
const int ledChannel = 0;
const int resolution = 8;
//

LiquidCrystal_I2C lcd(0x27, 16, 2);  //設定LCD
DHTStable DHT;
//伺服馬達
Servo myservo;  // create servo object to control a servo
//max7219
//MD_Parola maDisplay = MD_Parola(HARDWARE_TYPE, DATA_PIN, CLK_PIN, CS_PIN,  MAX_DEVICES);
//MD_Parola maDisplay = MD_Parola(MD_MAX72XX::FC16_HW, 0, 2, 1, 1);

// Published values for SG90 servos; adjust if needed
int minUs = 700;
int maxUs = 2500;

// variable for storing the pushbutton status

char* serialString()
{
  //static char str[21]; // For strings of max length=20
  static char str[64]; // arduino buffer最大64 For strings of max length=20
  if (!Serial.available()) return NULL;
  delay(6); // wait for all characters to arrive
  memset(str,0,sizeof(str)); // clear str
  byte count=0;
  while (Serial.available())
  {
    char c=Serial.read();
    //if (c>=32 && count<sizeof(str)-1)
    //c最大35
    //if (c>=32 && count<sizeof(str)-1)
    //{
      str[count]=c;
      count++;
    //}
  }
  str[count]='\0'; // make it a zero terminated string
  return str;
}

void setup() {
  Serial.begin(115200); 
  //lcd Wire.begin(I2C_SDA, I2C_SCL);
  Wire.begin(6,7);
  lcd.init(); //初始化LCD
  //lcd.begin();
  lcd.backlight(); //開啟背光
  //oled
  /*if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
  }*/
  //display.display();
  //delay(2000);
  u8g2.begin();  
  
  //ws2812
  #if defined(__AVR_ATtiny85__) && (F_CPU == 16000000)
  clock_prescale_set(clock_div_1);
  #endif
  pixels.begin(); // INITIALIZE NeoPixel strip object (REQUIRED)
  //setupTimer();
  //max7219
////  maDisplay.begin();
  // Set the intensity (brightness) of the display (0-15):
  //maDisplay.setIntensity(0);
  // Clear the display:
  //maDisplay.displayClear();
  //maDisplay.setTextAlignment(PA_CENTER);
  //lcd.shutdown(0,false);  // 關閉省電模式
  //lcd.setIntensity(0,0);  // 設定亮度為 0 (介於0~15之間)
  //lcd.clearDisplay(0);    // 清除螢幕
  //伺服馬達
  // Allow allocation of all timers
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  myservo.setPeriodHertz(50);
}
//tone
int BUZZER_PIN = 21;
/*int PIN = 16;
hw_timer_t* timer = NULL;
bool value = true;
int frequency = 20; // 20 to 20000

void IRAM_ATTR onTimer() {
  value = !value;
  digitalWrite(PIN, value); 
}*/

/*void setupTimer() {
    // Use 1st timer of 4  - 1 tick take 1/(80MHZ/80) = 1us so we set divider 80 and count up 
    timer = timerBegin(0, 80, true);//div 80
    //timer = timerBegin(1000000);
    //timerAttachInterrupt(timer, &onTimer, true);
    timerAttachInterrupt(timer, &onTimer);
}*/

void playTone(int frequency, int duration) {  
//tone(BUZZER_PIN, frequency, duration);  

ledcAttach(BUZZER_PIN, frequency, 8);  // 8-bit 解析度
ledcWrite(BUZZER_PIN, frequency); 
delay(duration);
ledcDetach(BUZZER_PIN);
} 

void loop() {
    static boolean needPrompt=true;
    char* inputData;
    if (needPrompt)
    {
    //Serial.print("Please enter inputs and press enter at the end:\n");
      needPrompt=false;
    }
    inputData= serialString();
    //inputData = Serial.read();

    if (inputData!=NULL)
     {
      //Serial.println(inputData);
      char* commandString = strtok(inputData, "#"); 
      //Serial.println(commandString);
      char* inputPin = strtok(NULL, "#");
      //Serial.println(inputPin);
      //取出第3個值
      char* inputValue = strtok(NULL, "#");
      //Serial.println(inputValue);
      //取出第4個值
      char* inputTime =strtok(NULL, "#");
      //Serial.println(inputTime);
      //伺服馬達
    if(strcmp(commandString, "servoWrite") == 0){
      myservo.attach(atoi(inputPin), minUs, maxUs);
      delay(15);
      myservo.write(atoi(inputValue));
      delay(15);
    }
      /*if(strcmp(commandString, "maset") == 0){///有問題先註解掉
      //Serial.println(atoi(inputPin));
      char* data_pin = strtok(inputPin, ",");
      char* cs_pin = strtok(NULL, ",");
      char* clk_pin = strtok(NULL, ",");
      char* max_devices = strtok(NULL, ",");
      //LedControl(int dataPin, int clkPin, int csPin, int numDevices);
      //lcd=LedControl(atoi(data_pin),atoi(clk_pin),atoi(cs_pin),atoi(max_devices));  //宣告 LedControl 物件      lc.shutdown(0,false);  // 關閉省電模式
      lc = LedController<1,1>(atoi(data_pin),atoi(clk_pin),atoi(cs_pin),atoi(max_devices));
      }*/
      
    /*if(strcmp(commandString, "mashow") == 0){  ///有問題先註解掉
      char* devices = strtok(inputPin, ",");
      char* row = strtok(NULL, ",");
      char* col = strtok(NULL, ",");
      char* onoff = strtok(NULL, ",");
      //lc.setLed(0,row,col,1); // 將Led的列,行設定為亮
      Serial.println(col);
      //lcd.setLed(atoi(devices),atoi(col),atoi(row),atoi(onoff));
      lc.setLed(atoi(devices),atoi(col),atoi(row),atoi(onoff));
    }*/
    /*if(strcmp(commandString, "maclear") == 0){
      //清螢幕
      maDisplay.begin();      
      maDisplay.displayClear();
      maDisplay.print(" ");
            
    }*/
    /*if(strcmp(commandString, "marow") == 0){
      //LedController lc = LedController(6, 7, 10, 1);      
      //lcd.setRow(atoi(inputPin),atoi(inputValue),atoi(inputTime));
      lc.setRow(atoi(inputPin),atoi(inputValue),atoi(inputTime));
      
    }*/
      if(strcmp(commandString, "max") == 0){
      char* data_pin = strtok(inputPin, ",");
      char* cs_pin = strtok(NULL, ",");
      char* clk_pin = strtok(NULL, ",");
      char* max_devices = strtok(NULL, ",");
      #define MAX_DEVICES atoi(max_devices)
      #define CS_PIN atoi(cs_pin)
      #define DATA_PIN atoi(data_pin)
      #define CLK_PIN atoi(clk_pin)
      #define HARDWARE_TYPE MD_MAX72XX::FC16_HW
      Serial.println(CLK_PIN);
      //MD_Parola 
      //maDisplay = MD_Parola(HARDWARE_TYPE, DATA_PIN, CS_PIN,CLK_PIN, MAX_DEVICES);
      MD_Parola maDisplay = MD_Parola(HARDWARE_TYPE, DATA_PIN, CLK_PIN, CS_PIN,  MAX_DEVICES);
      maDisplay.begin();
      // Set the intensity (brightness) of the display (0-15):
      maDisplay.setIntensity(0);
      // Clear the display:
      maDisplay.displayClear();
      maDisplay.setTextAlignment(PA_CENTER);
      Serial.println(inputValue);
      maDisplay.print(inputValue);
    }
      if(strcmp(commandString, "sh") == 0){
        /*//進入指令sh#腳位#111,222, 最後必需是,否則會reboot*/      
      int r ,  g , b;      
      char *bb ;      
      int sp , color,v;//第sp顆 顏色 值
      //int color ;//顏色      
      Adafruit_NeoPixel pixels(NUMPIXELS, atoi(inputPin), NEO_GRB + NEO_KHZ800);
      pixels.begin();      
      delay(10);
      int i = 0;
      bb = strtok(inputValue, ",");
      //Serial.println(bb);
      //取出第1個值//大於999表示第10個燈      
      while(bb != NULL ){
        //sp=0,color=0,v=0,r=0,g=0,b=0;
        sp = atoi(bb)/100;
        color = (atoi(bb)-(sp*100)) / 10;        
        sp--;
        v = atoi(bb) % 10;
        if(sp>=0){
           if( color == 0) {
          r = v;
          g = 0;
          b = 0;
        }else if ( color == 1) {
          r = v*3;
          g = v;
          b = 0;
        }else if ( color == 2) {
          r = v;
          g = v;
          b = 0;
        }else if ( color == 3) {
          r = 0;
          g = v;
          b = 0;
        }else if ( color == 4) {
          r = 0;
          g = 0;
          b = v;
        }else if ( color == 5) {
          r = 0;
          g = v;
          b = v;
        }else if ( color == 6) {
          r = v;
          g = 0;
          b = v;
        }else {
          r = v;
          g = v;
          b = v;
        }
        pixels.setPixelColor(sp, pixels.Color(r, g, b));
        }
        i++;
        if(i>0){
          bb = strtok(NULL, ",");    
        }        
      }
      pixels.show();
      //i=0;            
      //delay(100);      
    }     
    
      //ws2812
      if(strcmp(commandString, "ws") == 0){
        int r = atoi(strtok(inputValue,","));
        int g = atoi(strtok(NULL, ","));
        int b = atoi(strtok(NULL, ","));
        Adafruit_NeoPixel pixels(NUMPIXELS, atoi(inputPin), NEO_GRB + NEO_KHZ800);
        pixels.begin();
        //pixels.clear();
        char* sp = "";
        for( int i = 0; i<12 ; i++){
          //sp = inputTime[i];
          if(inputTime[i] == '0') {
            sp = "0";
          }else if(inputTime[i] == '1'){
            sp = "1";
          }else if(inputTime[i] == '2'){
            sp = "2";
          }else if(inputTime[i] == '3'){
            sp = "3";
          }else if(inputTime[i] == '4'){
            sp = "4";
          }else if(inputTime[i] == '5'){
            sp = "5";
          }else if(inputTime[i] == '6'){
            sp = "6";
          }else if(inputTime[i] == '7'){
            sp = "7";
          }else if(inputTime[i] == '8'){
            sp = "8";
          }else if(inputTime[i] == '9'){
            sp = "9";
          }else if(inputTime[i] == 'a'){
            sp = "10";
          }else if(inputTime[i] == 'b'){
            sp = "11";
          }
          pixels.setPixelColor(atoi(sp), pixels.Color(r, g, b));
        }
        //pixels.setPixelColor(5, pixels.Color(r, g, b));
        pixels.show(); 
      }
      
      //wifi
      /*
      if(strcmp(commandString, "w") == 0){

         WiFi.begin(inputPin,inputValue);
         byte count=0;
         while (WiFi.status() != WL_CONNECTED)
         {
            delay(500);
            //Serial.print(".");
            count ++;
            if (count >15){
              break;
            }
         }
         //Serial.println(WiFi.RSSI()); //讀取WiFi強度
         Serial.println(WiFi.localIP());
      }*/
      
      if(strcmp(commandString, "SR04")== 0){
       long duration, cm; 
       int trigPin = atoi(inputPin);
       int echoPin = atoi(inputValue);
       pinMode(trigPin, OUTPUT);        // 定義輸入及輸出 
       pinMode(echoPin, INPUT);         // 讀取 echo 的電位
     
       digitalWrite(trigPin, LOW);
       delayMicroseconds(5);
       //digitalWrite(trigPin, HIGH);     // 給 Trig 高電位，持續 10微秒  
       digitalWrite(trigPin, HIGH);     // 給 Trig 高電位，持續 10微秒  
       delayMicroseconds(10);
       digitalWrite(trigPin, LOW);
       //pinMode(echoPin, INPUT);             // 讀取 echo 的電位
       duration = pulseIn(echoPin, HIGH);   // 收到高電位時的時間
       cm = (duration/2) / 29.1;         // 將時間換算成距離 cm
       Serial.println(cm);        
    
    }

     //oled qrcode     
      if(strcmp(commandString, "q") == 0) {         
      
        // 1. 初始化二維碼數據
        qrcode_initText(&qrcode, qrcodeData, QR_VERSION, ECC_LOW, "inputPin");
        // 2. 自動計算置中偏移量 (螢幕寬高減去二維碼放大後的寬高，再除以 2)
        int qrSizeInPixels = qrcode.size * SCALE;
        int offsetX = (128 - qrSizeInPixels) / 2; // 左右置中
        int offsetY = (64 - qrSizeInPixels) / 2;  // 上下置中        
        // 3. 開始繪製螢幕
        u8g2.firstPage();
        do {
          // 雙重迴圈逐點檢查二維碼矩陣
          for (uint8_t y = 0; y < qrcode.size; y++) {
            for (uint8_t x = 0; x < qrcode.size; x++) {
              if (qrcode_getModule(&qrcode, x, y)) {
                // 使用 drawBox 繪製 2x2 的正方形像素點，並加入置中偏移量
                u8g2.drawBox(offsetX + (x * SCALE), offsetY + (y * SCALE), SCALE, SCALE);
              }
            }
          }
        } while ( u8g2.nextPage() );
        delay(3000);  
      }
      
     //oled 16x2    
    if(strcmp(commandString, "o") == 0) {
        u8g2.enableUTF8Print();  //啟用UTF8文字的功能  
        //u8g2.setFont(u8g2_font_unifont_t_chinese1); //使用字型
        //u8g2.setFont(u8g2_font_unifont_myfonts);
        //u8g2.firstPage();
        //int textlen = strlen(inputPin);
        int ax = atoi(strtok(inputValue,","));
        int ay = atoi(strtok(NULL, ","));
        u8g2.setFont(u8g2_font_ncenB08_tr); // 設定字型
          //u8g2.drawStr(0, 15, "Hello World!");  // 寫入文字 (X, Y 座標)*/
           
        do {
          u8g2.clearBuffer();          // 清除螢幕內部緩衝區
          u8g2.setCursor(ax,ay);
          u8g2.print(inputPin);
          //u8g2.drawStr(ax,ay, inputPin);                     
          u8g2.sendBuffer();
        }while ( u8g2.nextPage() );
            //delay(1000);
    }
    
    //lcd 16x2
    //format: l#string#row
    if(strcmp(commandString, "l_clear") == 0) {
      lcd.backlight(); //開啟背光
      lcd.clear();
      lcd.noBacklight(); // 關閉背光
    }
    if(strcmp(commandString, "l") == 0) {
      lcd.backlight(); //開啟背光
          //Serial.println(inputPin);
          if(atoi(inputValue) == 0){
            lcd.setCursor(0,0);
          }else{
            lcd.setCursor(0,1);
          }
          lcd.print(inputPin);  
    }
      
      //dht11
      if(strcmp(commandString, "dht11Set") == 0){
        DHT.read11(atoi(inputPin));
        
      }

      if(strcmp(commandString, "dht11Read") == 0){
        int chk = DHT.read11(atoi(inputPin));
        float t = DHT.getTemperature();
        float h = DHT.getHumidity();
        Serial.print(t);
        Serial.print(",");
        Serial.println(h);      
      }
      
      
      //tone
      
      if(strcmp(commandString, "tonePlay") == 0){
        int toneTime = atoi(inputTime);
        BUZZER_PIN = atoi(inputPin);
        int toneValue = atoi(inputValue) ;        
        pinMode(BUZZER_PIN,OUTPUT);        
        playTone(toneValue,toneTime);        
        /*setFrequency(toneValue);
        timerAlarmDisable(timer);
        //timerAlarmWrite(timer, 1000000l / frequencyHz, true);
        timerAlarmWrite(timer, 1000000l / toneValue, true);
        timerAlarmEnable(timer);
        delay(toneTime);
        timerAlarmWrite(timer, 1000000l / toneValue, false);*/
                
      }
      //類比讀取
      
      if(strcmp(commandString, "analogRead") == 0){
        int pin = atoi(inputPin);
        //pinMode(pin, INPUT);
        Serial.print("A:");
        Serial.println(analogRead(pin));
      }
      //數位讀取
      if(strcmp(commandString, "digitalRead") == 0){
        int int_inputPin = atoi(inputPin);
        pinMode(int_inputPin, INPUT);
        Serial.print("G");
        Serial.print(atoi(inputPin));
        Serial.print(":");
        Serial.println(digitalRead(int_inputPin));
      }
      //pwm類比寫入
      if(strcmp(commandString, "pwm") == 0){
           pinMode(atoi(inputPin), OUTPUT);
           analogWrite(atoi(inputPin), atoi(inputValue));
           //ledcAttachPin(atoi(inputPin), ledChannel);
           //ledcWrite(ledChannel, atoi(inputValue));
           //analogWrite(atoi(inputPin),atoi(inputValue));
      }
     
    //數位寫入
      if(strcmp(commandString, "digitalWrite") == 0){
        int digitalPin = atoi(inputPin);
        pinMode(digitalPin, OUTPUT);
        digitalWrite(digitalPin,atoi(inputValue));        
      }
      //Serial.println(inputData);
      needPrompt=true;
      
     }
    //delay(10);
    
  }
