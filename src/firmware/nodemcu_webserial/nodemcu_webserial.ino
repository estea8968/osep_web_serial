/*update 111/02/03 
estea chen estea8968@gmail.com
*/
#include <ESP8266WiFi.h>

#include <Servo.h>
#include <DHTStable.h>
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
//oled
#include <string.h>
#include <Arduino.h>
#include <U8g2lib.h>

//qrcode
#include <SSD1306.h>
#include <qrcode.h>

//ws2812
#include <Adafruit_NeoPixel.h>
//#ifdef __AVR__
// #include <avr/power.h> // Required for 16 MHz Adafruit Trinket
//#endif
//max7219
#include <LedControl.h>
#include <MD_Parola.h>
#include <MD_MAX72xx.h>
#include <SPI.h>
//LedControl lc=LedControl(0,5,4,1);
LedControl lc=LedControl(D3,D2,D1,1);
#define HARDWARE_TYPE MD_MAX72XX::FC16_HW
//MD_Parola maDisplay=MD_Parola(HARDWARE_TYPE, D3,D1,D2,1);
MD_Parola maDisplay = MD_Parola(HARDWARE_TYPE, D2, 1);
//ws2812
#define NUMPIXELS 12 // Popular NeoPixel ring size
//Adafruit_NeoPixel pixels(NUMPIXELS, 5, NEO_GRB + NEO_KHZ800);

U8G2_SSD1306_128X64_NONAME_1_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);
//oled end
//設定LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);  
DHTStable DHT;
//伺服馬達
Servo myservo;  // create servo object to control a servo
//qrcode
SSD1306  display(0x3c, D2, D1);
QRcode qrcode (&display);
//max7219

char* serialString()
{
  //static char str[21]; // For strings of max length=20
  static char str[52]; // For strings of max length=20
  if (!Serial.available()) return NULL;
  delay(16); // wait for all characters to arrive
  memset(str,0,sizeof(str)); // clear str
  byte count=0;
  while (Serial.available())
  {
    char c=Serial.read();
    //if (c>=32 && count<sizeof(str)-1)
    //c最大35
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
  //lcd
  lcd.init(); //初始化LCD 
  lcd.begin(16, 2); //初始化 LCD，代表我們使用的LCD一行有16個字元，共2行。
  lcd.backlight(); //開啟背光
  //oled
  u8g2.begin();
  u8g2.enableUTF8Print();  //啟用UTF8文字的功能  
  //ws2812
  #if defined(__AVR_ATtiny85__) && (F_CPU == 16000000)
    clock_prescale_set(clock_div_1);
  #endif
  //qrcode
  display.init();
  display.display();
  //max7219
  maDisplay.begin();
  // Set the intensity (brightness) of the display (0-15):
  maDisplay.setIntensity(0);
  // Clear the display:
  maDisplay.displayClear();
  maDisplay.setTextAlignment(PA_CENTER);  
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

    //max7219
    if(strcmp(commandString, "maset") == 0){
      //Serial.println(atoi(inputPin));
      char* data_pin = strtok(inputPin, ",");
      char* cs_pin = strtok(NULL, ",");
      char* clk_pin = strtok(NULL, ",");
      char* max_devices = strtok(NULL, ",");
      //LedControl(int dataPin, int clkPin, int csPin, int numDevices);
      //LedControl lc=LedControl(D3,D1,D2,1);  //宣告 LedControl 物件      lc.shutdown(0,false);  // 關閉省電模式
      //LedControl lc=LedControl(0,5,4,1);  //宣告 LedControl 物件      lc.shutdown(0,false);  // 關閉省電模式
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
      //MD_Parola 
      //maDisplay = MD_Parola(HARDWARE_TYPE, DATA_PIN, CS_PIN,CLK_PIN, MAX_DEVICES);
      MD_Parola maDisplay = MD_Parola(HARDWARE_TYPE, DATA_PIN,CLK_PIN, CS_PIN, MAX_DEVICES);
      maDisplay.begin();
      // Set the intensity (brightness) of the display (0-15):
      maDisplay.setIntensity(0);
      // Clear the display:
      maDisplay.displayClear();
      maDisplay.setTextAlignment(PA_CENTER);
      maDisplay.print(inputValue);
    }
    //ws2812_shu
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
      if(strcmp(commandString, "w") == 0){
         WiFi.begin(inputPin,inputValue);
         byte count=0;
         while (WiFi.status() != WL_CONNECTED)
         {
            delay(500);
            //Serial.print(".");
            count ++;
            if (count >20){
              break;
            }
         }
         Serial.println(WiFi.localIP());
      }
      
      //超音波
      if(strcmp(commandString, "SR04")== 0){
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

    //oled qrcode
      if(strcmp(commandString, "q") == 0) {
        qrcode.init();
        qrcode.create(inputPin);
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
          //u8g2.setCursor(0, 35);
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
          Serial.println(inputPin);
          if(atoi(inputValue) == 0){
            lcd.setCursor(0,0);
          }else{
            lcd.setCursor(0,1);
          }
          lcd.print(inputPin);  
      }
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
      }
      
      //伺服馬達
      if(strcmp(commandString, "servoWrite")== 0){
        myservo.attach(atoi(inputPin)); 
        myservo.write(atoi(inputValue));
        delay(10);
      }
      
      //tone
      if(strcmp(commandString, "tonePlay") == 0){
        int toneTime = atoi(inputTime);
        int tonePin = atoi(inputPin);
        tone(tonePin, atoi(inputValue),toneTime);
        //tone(4,110,1000);
        delay(toneTime);
        noTone(tonePin);
        delay(10);
      }
      //類比讀取
      
      if(strcmp(commandString, "analogRead") == 0){
        int int_inputPin = atoi(inputPin);
        Serial.print("A0");
        //Serial.print(atoi(inputPin));
        Serial.print(":");
        int value =round(map(analogRead(int_inputPin), 10, 1024, 0, 1023));
        Serial.println(value);
      }
      //數位讀取
      if(strcmp(commandString, "digitalRead") == 0){
        int digitalPin = atoi(inputPin);
        pinMode(digitalPin, INPUT);
        Serial.print("G");
        Serial.print(atoi(inputPin));
        Serial.print(":");
        Serial.println(digitalRead(digitalPin));
      }
      //類比寫入
      if(strcmp(commandString, "analogWrite") == 0){
        analogWrite(atoi(inputPin),atoi(inputValue));
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
