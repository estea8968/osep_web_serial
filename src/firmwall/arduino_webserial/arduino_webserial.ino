
#include <Servo.h>
#include "DHTStable.h"
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
//oled
#include <string.h>
#include <Arduino.h>
#include <U8g2lib.h>

//#ifdef U8X8_HAVE_HW_SPI
//#include <SPI.h>
//#endif
//#ifdef U8X8_HAVE_HW_I2C
//#include <Wire.h>
//#endif

U8G2_SSD1306_128X64_NONAME_1_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);
//oled end

LiquidCrystal_I2C lcd(0x27, 16, 2);  //設定LCD

DHTStable DHT;

Servo myservo;  // create servo object to control a servo

char* serialString()
{
  //static char str[21]; // For strings of max length=20
  static char str[21]; // For strings of max length=20
  if (!Serial.available()) return NULL;
  delay(32); // wait for all characters to arrive
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
  //LCD
  lcd.init(); //初始化LCD 
  lcd.begin(16, 2); //初始化 LCD，代表我們使用的LCD一行有16個字元，共2行。
  lcd.backlight(); //開啟背光
  //oled
  u8g2.begin();
  u8g2.enableUTF8Print();  //啟用UTF8文字的功能  
  
}

void loop() 
{
  static boolean needPrompt=true;
  
  char* inputData;

  if (needPrompt)
  {
    //Serial.print("Please enter inputs and press enter at the end:\n");
    needPrompt=false;
  }
  inputData= serialString();
  
  if (inputData!=NULL)
  {
    
    //取出命令、腳位、值、時間
    char* commandString = strtok(inputData, "#"); 
    char* inputPin = strtok(NULL, "#");
    //取出第3個值
    char* inputValue = strtok(NULL, "#");
    //取出第4個值
    int inputTime = atoi(strtok(NULL, "#"));
    //setPinmode
    if(strcmp(commandString, "pinMode")== 0){
      int digitalPin = atoi(inputPin);
      if(strcmp(inputValue, "output")== 0){
        pinMode(digitalPin, OUTPUT);        
      }else{
        pinMode(digitalPin, INPUT);
      }
      //Serial.println(inputValue);
    }
    //超音波
    if(strcmp(commandString, "HC-SR04")== 0){
       long duration, cm; 
       int trigPin = atoi(inputPin);
       int echoPin = atoi(inputValue);
       pinMode(trigPin, OUTPUT);        // 定義輸入及輸出 
       pinMode(echoPin, INPUT);
       digitalWrite(trigPin, LOW);
       delayMicroseconds(5);
       //digitalWrite(trigPin, HIGH);     // 給 Trig 高電位，持續 10微秒  
       digitalWrite(trigPin, HIGH);     // 給 Trig 高電位，持續 10微秒  
       delayMicroseconds(10);
       digitalWrite(trigPin, LOW);
       //pinMode(echoPin, INPUT);             // 讀取 echo 的電位
       pinMode(echoPin, INPUT);             // 讀取 echo 的電位
       duration = pulseIn(echoPin, HIGH);   // 收到高電位時的時間
       cm = (duration/2) / 29.1;         // 將時間換算成距離 cm
       Serial.println(cm);        
    }
    //oled 16x2
    //format: l#string#row

    if(strcmp(commandString, "o") == 0) {
        u8g2.setFont(u8g2_font_unifont_t_chinese1); //使用字型
        u8g2.firstPage();
        do {
          if(atoi(inputValue) == 0){
            u8g2.setCursor(0, 14);
          }
          if(atoi(inputValue) == 1 ){
            u8g2.setCursor(0, 35);
          }
          if(atoi(inputValue) == 2 ){
            u8g2.setCursor(0, 60);
          }
          u8g2.print(inputPin);
        }while ( u8g2.nextPage() );
            //delay(1000);
    }
    
    //lcd 16x2
    //format: l#string#row
    if(strcmp(commandString, "l") == 0) {
      if(strcmp(inputPin, "clear") == 0) {
          lcd.clear();
      }else{
          if(atoi(inputValue) == 0){
            lcd.setCursor(0,0);
          }else{
            lcd.setCursor(0,1);
          }
          lcd.print(inputPin);  
      }
    }
    //dht11
    if(strcmp(commandString, "dht11Read") == 0){
      int chk = DHT.read11(atoi(inputPin));
      if( atoi(inputValue) == 1 ){
          Serial.println(DHT.getTemperature(), 1);
      }else{
          Serial.println(DHT.getHumidity(), 1);
      }
      
    }
    //tone
    if(strcmp(commandString, "tonePlay") == 0){
      tone(atoi(inputPin), atoi(inputValue),inputTime);
      delay(inputTime);
      noTone(atoi(inputPin));
      delay(10);
    }
    //伺服馬達
    if(strcmp(commandString, "servoWrite") == 0){
      myservo.attach(atoi(inputPin));
      myservo.write(atoi(inputValue));
      delay(100);
    }
    //類比讀取
    if(strcmp(commandString, "analogRead") == 0){
      Serial.println(analogRead(atoi(inputPin)));
    }
    //數位讀取
    if(strcmp(commandString, "digitalRead") == 0){
      int digitalPin = atoi(inputPin);
      Serial.println(digitalRead(digitalPin));
    }
    //類比寫入
    if(strcmp(commandString, "analogWrite") == 0){
      analogWrite(atoi(inputPin),atoi(inputValue));
    }
    //數位寫入
    if(strcmp(commandString, "digitalWrite") == 0){
      int digitalPin = atoi(inputPin);
      digitalWrite(digitalPin,atoi(inputValue));
    }
    needPrompt=true;
    //delay(1000);
  }
}
