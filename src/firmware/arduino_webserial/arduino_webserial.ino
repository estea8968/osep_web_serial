/*
 * 更新日期111/12/19 estea chen
 */
#include <Servo.h>
#include <DHTStable.h>
#include <Wire.h> 
#include <LiquidCrystal_I2C.h> // LCD_I2C模組程式庫
//ws2812
#include <Adafruit_NeoPixel.h>
//max7219
//#include <MD_Parola.h>
//#include "MD_MAX72xx.h"
//#include <SPI.h>

//PMS5003T
#include <SoftwareSerial.h>
SoftwareSerial pmsSerial(2, 3);

DHTStable DHT;
Servo myservo;  // create servo object to control a servo
#define NUMPIXELS 12 

//PMS5003T
static unsigned int pm_cf_10,pm_cf_25,pm_cf_100,pm_at_10,pm_at_25,pm_at_100,particulate03,particulate05,particulate10,particulate25,particulate50,particulate100;
static float HCHO,Temperature,Humidity;

//LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);

char* serialString()
{
  //static char str[21]; // For strings of max length=20
  static char str[64]; // For strings of max length=20
  if (!Serial.available()) return NULL;
  delay(16); // wait for all characters to arrive
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
  #if defined(__AVR_ATtiny85__) && (F_CPU == 16000000)
    clock_prescale_set(clock_div_1);
  #endif
  
  // PMS5003T sensor baud rate is 9600
  pmsSerial.begin(9600);

  // 初始化LCD
  lcd.init();
  lcd.backlight();
  
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
    char* inputTime = strtok(NULL, "#");

    //max7219
    /*if(strcmp(commandString, "max") == 0){
      char* max_devices = strtok(inputPin, ",");
      char* cs_pin = strtok(NULL, ",");
      char* clk_pin = strtok(NULL, ",");
      char* data_pin = strtok(NULL, ",");
      #define HARDWARE_TYPE MD_MAX72XX::FC16_HW
      #define MAX_DEVICES atoi(max_devices)
      #define CS_PIN atoi(cs_pin)
      #define DATA_PIN atoi(data_pin)
      #define CLK_PIN atoi(clk_pin)
      MD_Parola myDisplay = MD_Parola(HARDWARE_TYPE, DATA_PIN, CLK_PIN, CS_PIN, MAX_DEVICES);
      myDisplay.begin();
      // Set the intensity (brightness) of the display (0-15):
      myDisplay.setIntensity(0);
      // Clear the display:
      myDisplay.displayClear();
      myDisplay.setTextAlignment(PA_CENTER);
      //myDisplay.displayText(inputValue, PA_CENTER, 100, 0, PA_SCROLL_LEFT, PA_SCROLL_LEFT);
      myDisplay.print(inputValue);
    }*/
      
    //pm5003
    if(strcmp(commandString, "pm") == 0){ 
      //bool isloop = true;
      while(pmsSerial.available())
        {
      //if (pmsSerial.available()) {
        getG5(pmsSerial.read());
        }
        Serial.print(pm_cf_10);Serial.print(",");
        Serial.print(pm_cf_25);Serial.print(",");
        Serial.print(pm_cf_100);Serial.print(",");
        Serial.print(Temperature);Serial.print(",");
        Serial.println(Humidity);
        //isloop = false;
      
    }

    //lcd
    if(strcmp(commandString, "l") == 0){
      //文字inputPin
      //第幾行inputValue 
      if(strcmp(inputPin, "clear") == 0){
        lcd.clear(); 
      }else{
        lcd.setCursor(0, atoi(inputValue));
        lcd.print(inputPin);   
      }
      
    }
    
    //ws2812_shu
    if(strcmp(commandString, "sh") == 0){
      int r = 0;
      int g = 0;
      int b = 0;
      int led_value[]={0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
      char *bb ;
      int i = 0;
      int sp;
      bb = strtok(inputValue, ",");
      led_value[i] = atoi(bb);
      Serial.println(led_value[i]);
      i++;
      while( bb != NULL){
        bb = strtok(NULL, ",");
        led_value[i] = atoi(bb);
        i++;
      }
      Adafruit_NeoPixel pixels(NUMPIXELS, atoi(inputPin), NEO_GRB + NEO_KHZ800);
      pixels.begin();
      for ( i=0;i<32;i++){
        if (led_value[i] > 0){
            sp = led_value[i]-1;
          i++;
          if( led_value[i] == 0) {
            i++;
            r = led_value[i];
            g = 0;
            b = 0;
          }else if( led_value[i] == 1){
            i++;
            r = led_value[i]*3;
            g = led_value[i];
            b = 0;
          }else if( led_value[i] == 2){
            i++;
            r = led_value[i];
            g = led_value[i];
            b = 0;
          }else if( led_value[i] == 3){
            i++;
            r = 0;
            g = led_value[i];
            b = 0;
          }else if( led_value[i] == 4){
            i++;
            r = 0;
            g = 0;
            b = led_value[i];
          }else if( led_value[i] == 5){
            i++;
            r = 0;
            g = led_value[i];
            b = led_value[i];
          }else if( led_value[i] == 6){
            i++;
            r = led_value[i];
            g = 0;
            b = led_value[i];
          }else if( led_value[i] == 7){
            i++;
            r = led_value[i];
            g = led_value[i];
            b = led_value[i];
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
        for( int i = 0; i<NUMPIXELS ; i++){
          //sp = inputTime[i];
          if (inputTime[i] == '1') {
            sp = "0";
          }else if(inputTime[i] == '2'){
            sp = "1";
          }else if(inputTime[i] == '3'){
            sp = "2";
          }else if(inputTime[i] == '4'){
            sp = "3";
          }else if(inputTime[i] == '5'){
            sp = "4";
          }else if(inputTime[i] == '6'){
            sp = "5";
          }else if(inputTime[i] == '7'){
            sp = "6";
          }else if(inputTime[i] == '8'){
            sp = "7";
          }else if(inputTime[i] == '9'){
            sp = "8";
          }else if(inputTime[i] == 'a'){
            sp = "9";
          }else if(inputTime[i] == 'b'){
            sp = "10";
          }else if(inputTime[i] == 'c'){
            sp = "11";
          }
          pixels.setPixelColor(atoi(sp), pixels.Color(r, g, b));
        }
        pixels.show(); 
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
       Serial.print("HC,");
       Serial.println(cm);        
    }
    
    //dht11
    if(strcmp(commandString, "dht11Set") == 0){
      DHT.read11(atoi(inputPin));
    }
    
    if(strcmp(commandString, "dht11Read") == 0){
      //int chk = DHT.read11(atoi(inputPin));
      Serial.print(DHT.getTemperature());
      Serial.print(",");
      Serial.println(DHT.getHumidity());
      /*
      if( atoi(inputValue) == 1 ){
          Serial.println(DHT.getTemperature(), 1);
      }else{
          Serial.println(DHT.getHumidity(), 1);
      }*/
    }
    //tone
    if(strcmp(commandString, "tonePlay") == 0){
      int tonePin = atoi(inputPin);
      int delayTime = atoi(inputTime)-3;
      tone(tonePin, atoi(inputValue),delayTime);
      delay(delayTime);
      noTone(atoi(inputPin));
      delay(2);
    }
    //伺服馬達
    if(strcmp(commandString, "servoWrite") == 0){
      myservo.attach(atoi(inputPin));
      myservo.write(atoi(inputValue));
      delay(100);
    }
    //類比讀取
    if(strcmp(commandString, "analogRead") == 0){
      Serial.print("A");
      Serial.print(atoi(inputPin));
      Serial.print(":");
      Serial.println(analogRead(atoi(inputPin)));
    }
    //數位讀取
    if(strcmp(commandString, "digitalRead") == 0){
      //pinMode(atoi(inputPin),INPUT);
      //2-19
      Serial.print("D");
      Serial.print(atoi(inputPin));
      Serial.print(":");
      Serial.println(digitalRead(atoi(inputPin)));
    }
    //類比寫入
    if(strcmp(commandString, "analogWrite") == 0){
      analogWrite(atoi(inputPin),atoi(inputValue));
    }
    //數位寫入
    if(strcmp(commandString, "digitalWrite") == 0){
         pinMode(atoi(inputPin),OUTPUT);
         digitalWrite(atoi(inputPin),atoi(inputValue));
     }
    needPrompt=true;
    //delay(1000);
  }
  
}


void getG5(unsigned char ucData)//取G5的值
{
  static unsigned int ucRxBuffer[250];
  static unsigned int ucRxCnt = 0;
  ucRxBuffer[ucRxCnt++] = ucData;
  if (ucRxBuffer[0] != 0x42 && ucRxBuffer[1] != 0x4D)//数据头判断
  {
    ucRxCnt = 0;
    return;
  }

  if (ucRxCnt > 38)//数据位判断//G5S为32，G5ST为38

  {
       pm_cf_10=(int)ucRxBuffer[4] * 256 + (int)ucRxBuffer[5];      //大气环境下PM2.5浓度计算        
       pm_cf_25=(int)ucRxBuffer[6] * 256 + (int)ucRxBuffer[7];
       pm_cf_100=(int)ucRxBuffer[8] * 256 + (int)ucRxBuffer[9];
       pm_at_10=(int)ucRxBuffer[10] * 256 + (int)ucRxBuffer[11];               
       pm_at_25=(int)ucRxBuffer[12] * 256 + (int)ucRxBuffer[13];
       pm_at_100=(int)ucRxBuffer[14] * 256 + (int)ucRxBuffer[15];
       particulate03=(int)ucRxBuffer[16] * 256 + (int)ucRxBuffer[17];
       particulate05=(int)ucRxBuffer[18] * 256 + (int)ucRxBuffer[19];
       particulate10=(int)ucRxBuffer[20] * 256 + (int)ucRxBuffer[21];
       particulate25=(int)ucRxBuffer[22] * 256 + (int)ucRxBuffer[23];
       Temperature = ((int)ucRxBuffer[24] * 256 + (int)ucRxBuffer[25])/10;
       Humidity = ((int)ucRxBuffer[26] * 256 + (int)ucRxBuffer[27])/10;
    if (pm_cf_25 >  999)//如果PM2.5数值>1000，返回重新计算
    {
      ucRxCnt = 0;
      return;
    }
    ucRxCnt = 0;
    return;
  }
}
