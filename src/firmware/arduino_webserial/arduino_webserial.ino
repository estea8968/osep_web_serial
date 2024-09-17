/*
 * 更新日期112/03/29 estea chen
 * 0326 add hx711
 */
#include <Servo.h>
#include <DHTStable.h>
#include <Wire.h> 
#include <LiquidCrystal_I2C.h> // LCD_I2C模組程式庫
//ws2812
#include <Adafruit_NeoPixel.h>
//max7219
#include <LedControl.h>
//hx711
//#include <HX711.h>
//rfid
#include <SPI.h>
#include <MFRC522.h>

//PMS5003T
#include <SoftwareSerial.h>
//ntc
#include "thermistor.h"
//版本號
char* version="1120420";
SoftwareSerial pmsSerial(2, 3);

DHTStable DHT;
Servo myservo;  // create servo object to control a servo
#define NUMPIXELS 12 
//hx711
//HX711 scale;
//rfid
MFRC522 mfrc522;   // 建立MFRC522實體

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

    //版本
    if(strcmp(commandString, "ver") == 0){
      Serial.println(version);
    }
    //max7219
    if(strcmp(commandString, "maxshow") == 0){      
      char* datapin= strtok(inputValue,",");
      char* clockpin= strtok(NULL,",");
      char* cspin=strtok(NULL,",");
      //char* bnum=strtok(NULL,",");
      LedControl leddisplay = LedControl(atoi(datapin),atoi(clockpin),atoi(cspin),1);
      leddisplay.clearDisplay(0);    // 清除螢幕
      leddisplay.shutdown(0, false);  // 關閉省電模式
      leddisplay.setIntensity(0, 5); // 設定亮度為 5 (介於0~15之間)
      
      //LedControl leddisplay = LedControl(12,10,11,1);
      //把inputPin最後一字元移動到第1字元圖形才會正確
        char new_str[18];
        //new_str[0]=inputPin[16];
        for(int i=0;i<18;i++){
          new_str[i]=inputPin[i+1];
          //new_str[i]=inputPin[i];
        }
        //new_str[18]='\0';
        //leddisplayImage(stringToUint_64(new_str));
        for (int i = 0; i < 8; i++) {
          byte row = (stringToUint_64(new_str) >> i * 8) & 0xFF;
          for (int j = 0; j < 8; j++) {
            leddisplay.setLed(0, i, j, bitRead(row, j));
          }
        }
      }
    
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
    //ntc
    if(strcmp(commandString, "ntc") == 0){
      
      THERMISTOR thermistor(atoi(inputPin),        // Analog pin
                      10000,          // Nominal resistance at 25 ºC
                      3950,           // thermistor's beta coefficient
                      10000);         // Value of the series resistor

      // Global temperature reading
      uint16_t temp;
      Serial.print("N");
      Serial.print(inputPin);
      Serial.print(":");      
      Serial.println(thermistor.read());
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
      //Serial.println(led_value[i]);
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
    //rfid begin
    if(strcmp(commandString, "mfr0") == 0){
      //MFRC522 mfrc522;   // 建立MFRC522實體
      SPI.begin();        // 初始化SPI介面
      mfrc522.PCD_Init(atoi(inputPin), atoi(inputValue)); // 初始化MFRC522卡
      //mfrc522.PCD_Init(10, 9); // 初始化MFRC522卡
      mfrc522.PCD_DumpVersionToSerial(); // 顯示讀卡設備的版本    
      //Serial.println("ok");
      }
    //get uid  
    if(strcmp(commandString, "mfr1") == 0){
        if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
            Serial.print("mfr:");
            for (byte i = 0; i < mfrc522.uid.size; i++) {
              Serial.print(mfrc522.uid.uidByte[i]);
              //Serial.print(buffer[i]);
              //Serial.print(buffer[i] < 0x10 ? " 0" : " ");
              //Serial.print(buffer[i], HEX);
            }
            Serial.println("");
            //dump_byte_array(mfrc522.uid.uidByte, mfrc522.uid.size); // 顯示卡片的UID
            mfrc522.PICC_HaltA();  // 卡片進入停止模式
        }
      }
    //dht11
    if(strcmp(commandString, "dht11Set") == 0){
      pinMode(atoi(inputPin),INPUT);
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
      pinMode(atoi(inputPin),INPUT);
      //2-19
      Serial.print("D");
      Serial.print(atoi(inputPin));
      Serial.print(":");
      Serial.println(digitalRead(atoi(inputPin)));
    }
    //hx711
    /*if(strcmp(commandString, "hx0") == 0){
      scale.begin(atoi(inputPin),atoi(inputValue));
      const int scale_factor = -1674; //比例參數，從校正程式中取得
      //Serial.println(scale.get_units(5), 0);  //未設定比例參數前的數值
      scale.get_units(5);
      scale.set_scale(scale_factor);       // 設定比例參數
      scale.tare();               // 歸零
      //Serial.println(scale.get_units(5), 0);  //設定比例參數後的數值
      scale.get_units(5);
    }*/
    ///if(strcmp(commandString, "hx1") == 0){
      //scale.begin(DT_PIN, SCK_PIN);
      /*scale.begin(atoi(inputPin),atoi(inputValue));
      const int scale_factor = -1674; //比例參數，從校正程式中取得
      //Serial.println(scale.get_units(5), 0);  //未設定比例參數前的數值
      scale.get_units(5);
      scale.set_scale(scale_factor);       // 設定比例參數
      scale.tare();               // 歸零
      //Serial.println(scale.get_units(5), 0);  //設定比例參數後的數值
      scale.get_units(5);
      digitalWrite(13,1);   //13腳位亮燈給使用者放東西，時間2秒
      delay(2000);
      digitalWrite(13,0);*/
      //scale.power_up();               // 結束睡眠模式
      /*
      Serial.print("hx:");
      Serial.println(scale.get_units(10), 0);       
      */
      //scale.power_down();             // 進入睡眠模式
      //delay(500);
      //scale.power_up();               // 結束睡眠模式
    ///}
    
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
/*
 * 這個副程式把讀取到的UID，用16進位顯示出來
 */
/*void dump_byte_array(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(buffer[i] < 0x10 ? " 0" : " ");
    Serial.print(buffer[i], HEX);
  }
}*/

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

uint64_t stringToUint_64(String value) {
  int stringLenght = value.length();

  uint64_t uint64Value = 0x0;
  for(int i = 0; i<=stringLenght-1; i++) {
    char charValue = value.charAt(i);
    uint64Value = 0x10 * uint64Value;
    uint64Value += stringToHexInt(charValue);
  }

  return uint64Value;
}

int stringToHexInt(char value) {
  switch(value) {
    case '0':
      return 0;
      break;
    case '1':
      return 0x1;
      break;
    case '2':
      return 0x2;
      break;
    case '3':
      return 0x3;
      break;
    case '4':
      return 0x4;
      break;
    case '5':
      return 0x5;
      break;
    case '6':
      return 0x6;
      break;
    case '7':
      return 0x7;
      break;
    case '8':
      return 0x8;
      break;
    case '9':
      return 0x9;
      break;
    case 'A':
    case 'a':
      return 0xA;
      break;
    case 'B':
    case 'b':
      return 0xB;
      break;
    case 'C':
    case 'c':
      return 0xC;
      break;
    case 'D':
    case 'd':
      return 0xD;
      break;
    case 'E':
    case 'e':
      return 0xE;
      break;
    case 'F':
    case 'f':
      return 0xF;
      break;
  }
}
