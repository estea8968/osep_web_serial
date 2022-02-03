/*
 * 111/02/02
 */
//#include<WiFi.h>
//#include <Servo.h>
#include <DHTStable.h>
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
//oled
#include <string.h>
#include <Arduino.h>
#include <U8g2lib.h>

//qrcode
#include "SSD1306.h"
#include <qrcode.h>
//max7219
#include <MD_Parola.h>
#include <MD_MAX72xx.h>
#include <SPI.h>
#include <LedControl.h>

//ws2812
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
 #include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

#define NUMPIXELS 12 // Popular NeoPixel ring size
//Adafruit_NeoPixel pixels(NUMPIXELS, 5, NEO_GRB + NEO_KHZ800);

U8G2_SSD1306_128X64_NONAME_1_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);
//oled end
//max7219
LedControl lc=LedControl(16,18,17,1);
#define HARDWARE_TYPE MD_MAX72XX::FC16_HW
//MD_Parola maDisplay=MD_Parola(HARDWARE_TYPE, D3,D1,D2,1);
MD_Parola maDisplay = MD_Parola(HARDWARE_TYPE, 16,17,18,1);

//pwm
// setting PWM properties
const int freq = 5000;
const int ledChannel = 0;
const int resolution = 8;
//

LiquidCrystal_I2C lcd(0x27, 16, 2);  //設定LCD
DHTStable DHT;
//Servo myservo;  // create servo object to control a servo

//qrcode
SSD1306 display(0x3c, 21, 22);
QRcode qrcode (&display);

// variable for storing the pushbutton status

char* serialString()
{
  
  //static char str[21]; // For strings of max length=20
  static char str[52]; // For strings of max length=20
  if (!Serial.available()) return NULL;
  delay(32); // wait for all characters to arrive
  memset(str,0,sizeof(str)); // clear str
  byte count=0;
  while (Serial.available())
  {
    char c=Serial.read();
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
  lcd.init(); //初始化LCD 
  lcd.begin(16, 2); //初始化 LCD，代表我們使用的LCD一行有16個字元，共2行。
  //lcd.backlight(); //開啟背光
  //oled
  u8g2.begin();
  u8g2.enableUTF8Print();  //啟用UTF8文字的功能  
  ledcSetup(ledChannel, freq, resolution);
  //digital 2 esp32 led燈
  //digital out 1-5 12-33 37
  //gpio 15-19 25 26 ok
  //wifi
  //WiFi.mode(WIFI_STA); //設置WiFi模式

  //ws2812
  #if defined(__AVR_ATtiny85__) && (F_CPU == 16000000)
  clock_prescale_set(clock_div_1);
  #endif
  //pixels.begin(); // INITIALIZE NeoPixel strip object (REQUIRED)
  setupTimer();
  //qrcode
  //display.init();
  //display.display();
  //max7219
  maDisplay.begin();
  // Set the intensity (brightness) of the display (0-15):
  //maDisplay.setIntensity(0);
  // Clear the display:
  //maDisplay.displayClear();
  //maDisplay.setTextAlignment(PA_CENTER);
  lc.shutdown(0,false);  // 關閉省電模式
  lc.setIntensity(0,0);  // 設定亮度為 0 (介於0~15之間)
  lc.clearDisplay(0);    // 清除螢幕
}
//tone
const int PIN = 16;
hw_timer_t* timer = NULL;
bool value = true;
int frequency = 20; // 20 to 20000

void IRAM_ATTR onTimer() {
  value = !value;
  digitalWrite(PIN, value); 
}

void setupTimer() {
    // Use 1st timer of 4  - 1 tick take 1/(80MHZ/80) = 1us so we set divider 80 and count up 
    timer = timerBegin(0, 80, true);//div 80
    timerAttachInterrupt(timer, &onTimer, true);
}

//void setFrequency(long frequencyHz){
void setFrequency(int frequencyHz){  
    timerAlarmDisable(timer);
    timerAlarmWrite(timer, 1000000l / frequencyHz, true);
    timerAlarmEnable(timer);
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
      
      if(strcmp(commandString, "maset") == 0){
      //Serial.println(atoi(inputPin));
      char* data_pin = strtok(inputPin, ",");
      char* cs_pin = strtok(NULL, ",");
      char* clk_pin = strtok(NULL, ",");
      char* max_devices = strtok(NULL, ",");
      //LedControl(int dataPin, int clkPin, int csPin, int numDevices);
      lc=LedControl(atoi(data_pin),atoi(clk_pin),atoi(cs_pin),atoi(max_devices));  //宣告 LedControl 物件      lc.shutdown(0,false);  // 關閉省電模式
      lc.shutdown(0,false);  // 關閉省電模式
      lc.setIntensity(0,0);  // 設定亮度為 0 (介於0~15之間)
      lc.clearDisplay(0);    // 清除螢幕
    }
    
    if(strcmp(commandString, "mashow") == 0){
      char* devices = strtok(inputPin, ",");
      char* row = strtok(NULL, ",");
      char* col = strtok(NULL, ",");
      char* onoff = strtok(NULL, ",");
      //lc.setLed(0,row,col,1); // 將Led的列,行設定為亮
      Serial.println(col);
      lc.setLed(atoi(devices),atoi(col),atoi(row),atoi(onoff));
    }
    if(strcmp(commandString, "maclear") == 0){
      lc.clearDisplay(0); 
    }
    if(strcmp(commandString, "marow") == 0){
      lc.setRow(atoi(inputPin),atoi(inputValue),atoi(inputTime));
    }
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
      int r = 0;
      int g = 0;
      int b = 0;
      char * led_value[]={"","","","","","","","","","","","","","","","","","","","","","","",""};
      char * bb ="";
      int i = 0;
      int sp;
      bb = strtok(inputValue, ",");
      led_value[i] = bb;
      //Serial.println(led_value[i]);
      i++; 
      while( bb!= NULL ){
        bb = strtok(NULL, ",");
        led_value[i] = bb;
        //Serial.println(led_value[i]);
        i++;        
      }
      Adafruit_NeoPixel pixels(NUMPIXELS, atoi(inputPin), NEO_GRB + NEO_KHZ800);
      pixels.begin();
      for ( i=0;i<24;i++){
        if (led_value[i] > 0){
            sp = atoi(led_value[i])-1;
          i++;
          if( atoi(led_value[i]) == 0) {
            i++;
            r = atoi(led_value[i]);
            g = 0;
            b = 0;
          }else if( atoi(led_value[i]) == 1){
            i++;
            r = atoi(led_value[i])*3;
            g = atoi(led_value[i]);
            b = 0;
          }else if( atoi(led_value[i]) == 2){
            i++;
            r = atoi(led_value[i]);
            g = atoi(led_value[i]);
            b = 0;
          }else if( atoi(led_value[i]) == 3){
            i++;
            r = 0;
            g = atoi(led_value[i]);
            b = 0;
          }else if( atoi(led_value[i]) == 4){
            i++;
            r = 0;
            g = 0;
            b = atoi(led_value[i]);
          }else if( atoi(led_value[i]) == 5){
            i++;
            r = 0;
            g = atoi(led_value[i]);
            b = atoi(led_value[i]);
          }else if( atoi(led_value[i]) == 6){
            i++;
            r = atoi(led_value[i]);
            g = 0;
            b = atoi(led_value[i]);
          }else if( atoi(led_value[i]) == 7){
            i++;
            r = atoi(led_value[i]);
            g = atoi(led_value[i]);
            b = atoi(led_value[i]);
          }
          pixels.setPixelColor(sp, pixels.Color(r, g, b));
        }else{
          i++;
          i++;
        }
      }
      pixels.show(); 
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
        qrcode.init();
        qrcode.create(inputPin);
      }
      
     //oled 16x2
    
    if(strcmp(commandString, "o") == 0) {
        u8g2.setFont(u8g2_font_unifont_t_chinese1); //使用字型
        u8g2.firstPage();
        int textlen = strlen(inputPin);
        int ax = atoi(strtok(inputValue,","));
        int ay = atoi(strtok(NULL, ","));
        do {
          u8g2.setCursor(ax,ay);
          u8g2.print(inputPin);
          /*
          if( textlen > 16){
              char subtext1[17];
              memcpy(subtext1,&inputPin[0],16);
              subtext1[17] = '\0';
              u8g2.setCursor(0, 14);
              u8g2.print(subtext1);
              char subtext2[17];
              memcpy(subtext2,&inputPin[16],32);
              subtext2[ textlen-16] = '\0';
              u8g2.setCursor(0, 35);
              u8g2.print(subtext2);
              if(textlen > 32){
                char subtext3[17];
                memcpy(subtext3,&inputPin[32],48);  
                subtext3[ textlen-32] = '\0';
                u8g2.setCursor(0, 60);
                u8g2.print(subtext3);
              }
          }else{
            //Serial.println("aaa");
            if(atoi(inputValue) == 0){
              //u8g2.setCursor(0, 14);
              u8g2.drawStr(0,14,inputPin);  //輸出文字
            }
            if(atoi(inputValue) == 1 ){
              //u8g2.setCursor(0, 35);
              u8g2.drawStr(0,35,inputPin);  //輸出文字
            }
            if(atoi(inputValue) == 2 ){
              //u8g2.setCursor(0, 60);
              u8g2.drawStr(0,60,inputPin);  //輸出文字
            }
          //u8g2.setCursor(0, 35);
            //u8g2.print(inputPin);
            //u8g2.drawStr(0,13,inputPin);  //輸出文字
          }*/
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
      //int chk = DHT.read11(atoi(inputPin));
        float t = DHT.getTemperature();
        float h = DHT.getHumidity();
        Serial.print(t);
        Serial.print(",");
        Serial.println(h);      
      }
      
      
      //tone
      
      if(strcmp(commandString, "tonePlay") == 0){
        int toneTime = atoi(inputTime);
        int tonePin = atoi(inputPin);
        int toneValue = atoi(inputValue) ;
        pinMode(tonePin,OUTPUT);
        setFrequency(toneValue);
        timerAlarmDisable(timer);
        //timerAlarmWrite(timer, 1000000l / frequencyHz, true);
        timerAlarmWrite(timer, 1000000l / toneValue, true);
        timerAlarmEnable(timer);
        delay(toneTime);
        timerAlarmWrite(timer, 1000000l / toneValue, false);
                
      }
      //類比讀取
      
      if(strcmp(commandString, "analogRead") == 0){
        int int_inputPin = atoi(inputPin);
        //pinMode(int_inputPin, INPUT);
        Serial.println(analogRead(int_inputPin));
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
           ledcAttachPin(atoi(inputPin), ledChannel);
           ledcWrite(ledChannel, atoi(inputValue));
           //analogWrite(atoi(inputPin),atoi(inputValue));
      }
     //Touch T0 T3 T4 T7 T9
     
     if(strcmp(commandString, "touchRead") == 0){
        if(strcmp(inputPin, "T0") == 0){
          Serial.println(touchRead(T0));
        }
        if(strcmp(inputPin, "T1") == 0){
          Serial.println(touchRead(T1));
        }
        if(strcmp(inputPin, "T2") == 0){
          Serial.println(touchRead(T2));
        }
        if(strcmp(inputPin, "T3") == 0){
          Serial.println(touchRead(T3));
        }
        if(strcmp(inputPin, "T4") == 0){
          Serial.println(touchRead(T4));
        }
        if(strcmp(inputPin, "T5") == 0){
          Serial.println(touchRead(T5));
        }
        if(strcmp(inputPin, "T6") == 0){
          Serial.println(touchRead(T6));
        }
        if(strcmp(inputPin, "T7") == 0){
          Serial.println(touchRead(T7));
        }
        if(strcmp(inputPin, "T8") == 0){
          Serial.println(touchRead(T8));
        }
        if(strcmp(inputPin, "T9") == 0){
          Serial.println(touchRead(T9));
        }
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
