//版本日期 112 12 12
//版號
char *ver = "1121112";
#include <Wire.h>
#include <Adafruit_Microbit.h>
//#include "MMA8653.h"
#include <LiquidCrystal_I2C.h> // LCD_I2C模組程式庫
//LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);
//喇叭
#include "Tone.h" // Add this line if you use a Microbit V2, also change the pin to 27 which is the speaker on Microbit V2
//伺服馬達
#include <Servo.h>
//ws2812
#include <Adafruit_NeoPixel.h>
#define NUMPIXELS 12
//oled
#include <U8g2lib.h>
#include "u8g2_font_e58524b32706dda48e7107fc64bfd183.h"
U8G2_SSD1306_128X64_NONAME_1_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

//溫度
#include <LSM303AGR_ACC_Sensor.h>
//廣播
#include "NRF52_Radio_library.h"
NRF52_Radio MicrobitRadio = NRF52_Radio();
#include <DHTStable.h>
DHTStable DHT;
//mag
#include <LSM303AGR_MAG_Sensor.h>
#define DEV_I2C Wire1  //Define which I2C bus is used. Wire1 for the Microbit V2, Wire for the Microbit V1
LSM303AGR_ACC_Sensor Acc(&DEV_I2C);
//伺服馬達
Servo myservo;  // create servo object to control a servo
//mag
LSM303AGR_MAG_Sensor Mag(&DEV_I2C);
//const float Pi = 3.14159;

const int leveled = 160;  // In order to keep the compass horizontal (leveled).
int32_t accelerometer[3];
int32_t magnetometer[3];
int _x[16] = { 2, 1, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 4, 4, 4, 3 };  // Coordinates of leds in the matrix
int _y[16] = { 0, 0, 0, 1, 2, 3, 4, 4, 4, 4, 4, 3, 2, 1, 0, 0 };
int32_t x, MagMinX, MagMaxX;
int32_t y, MagMinY, MagMaxY;
int32_t z, MagMinZ, MagMaxZ;
boolean calibrated = false;
long lastDisplayTime;

Adafruit_Microbit_Matrix microbit;
//float heading;
//MMA8653 accel;
//int16_t mma_x, mma_y, mma_z;
//int8_t offset_x, offset_y, offset_z;

const uint8_t smile_bmp[] =
  { B00000,
    B01010,
    B00000,
    B10001,
    B01110, };
const uint8_t sad_bmp[] =
  { B00000,
    B01010,
    B00000,
    B01110,
    B10001, };
    
String inputData;

//音階
int speaker = 27;
//廣播
const int POWER = 7;            // (0..7)   Zendvermogen instellen voor Bluetooth radio (andere instelling lijkt geen verschil te maken).
const int GROEPCODE = 10;       // (0..255) Groepcode voor Bluetooth radio. Zorg dat alle deelnemende Microbits dezelfde (unieke) code gebruiken!
const int FREQUENTIEBAND = 50;  // (0..100) Frequentiegroep voor Bluetooth radio. Zorg dat alle deelnemende Microbits dezelfde (unieke) code gebruiken!
FrameBuffer* myDataSendData;  // Hier staat de data in (bij verzenden) of komt de data in (bij ontvangen).
void verzenden(String bericht);
String ontvangen();

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(5);
  pinMode(PIN_BUTTON_A, INPUT);
  pinMode(PIN_BUTTON_B, INPUT);
  //microbit.begin();
  // Initialize I2C bus.
  DEV_I2C.begin();
  Acc.begin();
  Acc.Enable();
  Acc.EnableTemperatureSensor();
  //LSM303
  Mag.begin();
  Mag.Enable();
  lastDisplayTime = millis();
  //廣播
  myDataSendData = new FrameBuffer();
  MicrobitRadio.setTransmitPower(POWER);
  MicrobitRadio.hello("Test");
  MicrobitRadio.enable();  // Radio aanzetten
  MicrobitRadio.setGroup(GROEPCODE);
  MicrobitRadio.setFrequencyBand(FREQUENTIEBAND);
  //u8g2
  u8g2.begin();
  u8g2.enableUTF8Print();  //啟用UTF8文字的功能
  
  microbit.begin();
  Serial.println("micro:bit s4a");
 
 }


void loop() {
    inputData =Serial.readString();
//    Serial.println(inputData);
    int str_len = inputData.length()+ 1; 
    char char_str[str_len];
    inputData.toCharArray(char_str, str_len);
    char_str[str_len]='\0';
    if (inputData!=NULL)
    {      
      //Serial.println(char_str);
      char *commandString = strtok(char_str, "#");
      char *b_String = strtok(NULL, "#");
      char *c_String = strtok(NULL, "#");
      char *d_String = strtok(NULL, "#");
      
      //ver版本
      if(strcmp(commandString, "ver") == 0){
        Serial.print("ver:");
        Serial.println(ver);
      }
      //光線
      if(strcmp(commandString, "light") == 0){
        pinMode(23, OUTPUT);
        pinMode(26, OUTPUT);
        pinMode(3,INPUT);
        int lightValue = 1023 - analogRead(3);
        //Serial.println(analogRead(COL));
        //int average = calculateAverage(sensorValue);
        Serial.print("l:");
        Serial.println(lightValue);

      }
      //溫度
      if(strcmp(commandString, "temp") == 0){
          float temperature;
          Acc.GetTemperature(&temperature);
          Serial.print("temp:");
          Serial.println(temperature);
      }
      //button
      if(strcmp(commandString, "b") == 0){
        Serial.print("b:");
        Serial.print(digitalRead(PIN_BUTTON_A));
        Serial.print(",");
        Serial.println(digitalRead(PIN_BUTTON_B));
      }
      //蜂嗚器
      if(strcmp(commandString, "tone") == 0){
        pinMode(speaker, OUTPUT);
        //tone(speaker, melody[thisNote], noteDuration * 0.9);
        tone(speaker, atoi(b_String), atof(c_String)*0.9);
        //delay(noteDuration/10);
        //delay(atof(c_String)*0.9*1000);
        delay(atoi(c_String));
        noTone(speaker);
        Serial.println("mm");
      }
      //dht11
      if(strcmp(commandString, "dht11") == 0){
        pinMode(atoi(b_String),INPUT);
        DHT.read11(atoi(b_String));
        Serial.print("dht11:");
        Serial.print(DHT.getTemperature());
        Serial.print(",");
        Serial.println(DHT.getHumidity());
      }
      //led
      if(strcmp(commandString, "led") == 0){
        if(strcmp(b_String, "led_on") == 0){
          microbit.begin();
          microbit.fillScreen(LED_ON);
        }else if(strcmp(b_String, "heart") == 0){
          microbit.begin();
          microbit.show(microbit.HEART);
        }else if(strcmp(b_String, "no") == 0){
          microbit.begin();
          microbit.show(microbit.NO);
        }else if(strcmp(b_String, "yes") == 0){
          microbit.begin();
          microbit.show(microbit.YES);
        }else if(strcmp(b_String, "smile") == 0){
          microbit.begin();
          microbit.show(smile_bmp);
        }else if(strcmp(b_String, "sad") == 0){
          microbit.begin();
          microbit.show(sad_bmp);
        }else if(strcmp(b_String, "clear") == 0){
          microbit.clear();
        }else if(strcmp(b_String, "drawPixel") == 0){
          char *a0 = strtok(c_String, ",");
          char *a1 = strtok(NULL, ",");
          char *a2 = strtok(NULL, ",");
          microbit.drawPixel(atoi(a0), atoi(a1), atoi(a2));
        }else if(strcmp(b_String, "drawLine") == 0){
          microbit.begin();
          char* a0 = strtok(c_String, ",");
          char *a1 = strtok(NULL, ",");
          char* a2 = strtok(NULL, ",");
          char *a3 = strtok(NULL, ",");
          microbit.drawLine(atoi(a0), atoi(a1), atoi(a2), atoi(a3), LED_ON);
        }else if(strcmp(b_String, "matrix")==0){
          microbit.begin();
            int i=0;
            for(int m=0;m<5;m++){
              for(int n=0;n<5;n++){
                  if(c_String[i]=='1'){
                    microbit.drawPixel(n, m, LED_ON);
                  }
                  i++;
                }
              }
        }else {
          microbit.print(b_String);   
        }
        
      }
      //servo伺服馬達
      if(strcmp(commandString, "servo") == 0){
        //伺服馬達
        myservo.attach(atoi(b_String));
        myservo.write(atoi(c_String));
      }
      //G248加速度
      if(strcmp(commandString, "g248") == 0){
        int32_t accelerometer[3];
        Acc.GetAxes(accelerometer);
        Serial.print("g:");
        Serial.print(accelerometer[2]);
        Serial.print(",");
        Serial.print(accelerometer[1]);
        Serial.print(",");
        Serial.println(accelerometer[0]);
      }
      //收到廣播
      if(strcmp(commandString, "radio") == 0){
        String ontvangst = ontvangen();  // elke lusdoorgang kijken of er data is ontvangen
        if (ontvangst.length() > 0) {    // als er data is ontvangen, de data afdrukken
          Serial.print("r0:");
          Serial.println(ontvangst);
        }
        //if(strcmp(b_String, "") == 0){
        if(sizeof(b_String)>0){
          Serial.println(b_String);
          verzenden(b_String);
        }
      }  
      //MMA8653 xyz
      if(strcmp(commandString, "mma") == 0){
        Mag.GetAxes(magnetometer);   // Used for compass
        //Acc.GetAxes(accelerometer);  // This one is only used to check if the compass is leveled.
        x = magnetometer[0];
        y = magnetometer[1];
        z = magnetometer[2];
        if (!calibrated) {
        if (x < MagMinX) MagMinX = x;
        if (x > MagMaxX) MagMaxX = x;
    
        if (y < MagMinY) MagMinY = y;
        if (y > MagMaxY) MagMaxY = y;
    
        if (z < MagMinZ) MagMinZ = z;
        if (z > MagMaxZ) MagMaxZ = z;
       }
       // Change the calibrated values to an expected range.
        x = map(x, MagMinX, MagMaxX, -1023, 1023);
        y = map(y, MagMinY, MagMaxY, -1023, 1023);
        z = map(z, MagMinZ, MagMaxZ, 0, 1023);
        Serial.print("mma:");
        Serial.print(x);
        Serial.print(",");
        Serial.print(y);
        Serial.print(",");
        Serial.println(z);        
        
      }
      //mag3110
      if(strcmp(commandString, "mag") == 0){
        Mag.GetAxes(magnetometer);   // Used for compass
        //Acc.GetAxes(accelerometer);  // This one is only used to check if the compass is leveled.
        x = magnetometer[0];
        y = magnetometer[1];
        z = magnetometer[2];
        if (!calibrated) {
        if (x < MagMinX) MagMinX = x;
        if (x > MagMaxX) MagMaxX = x;
    
        if (y < MagMinY) MagMinY = y;
        if (y > MagMaxY) MagMaxY = y;
    
        if (z < MagMinZ) MagMinZ = z;
        if (z > MagMaxZ) MagMaxZ = z;
       }
       // Change the calibrated values to an expected range.
        x = map(x, MagMinX, MagMaxX, -1023, 1023);
        y = map(y, MagMinY, MagMaxY, -1023, 1023);
        z = map(z, MagMinZ, MagMaxZ, 0, 1023);
        Serial.print("mag:");
        Serial.print(x);
        Serial.print(",");
        Serial.print(y);
        Serial.print(",");
        Serial.println(z);        
      }
      //數位讀取
      if(strcmp(commandString, "d_read") == 0){
        pinMode(atoi(b_String),INPUT);
        Serial.print("d");
        Serial.print(b_String);
        Serial.print(":");
        Serial.println(digitalRead(atoi(b_String)));
      }
      //類比讀取
      if(strcmp(commandString, "a_read") == 0){
        Serial.print("a");
        Serial.print(b_String);
        Serial.print(":");
        Serial.println(analogRead(atoi(b_String)));
      }
      //數位寫入
      if(strcmp(commandString, "d_write") == 0){
        pinMode(atoi(b_String),OUTPUT);
        digitalWrite(atoi(b_String),atoi(c_String));
      }
      //類比寫入
      if(strcmp(commandString, "a_write") == 0){
        analogWrite(atoi(b_String),atoi(c_String));
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
      bb = strtok(c_String, ",");
      led_value[i] = atoi(bb);
      //Serial.println(led_value[i]);
      i++;
      while( bb != NULL){
        bb = strtok(NULL, ",");
        led_value[i] = atoi(bb);
        i++;
      }
      Adafruit_NeoPixel pixels(NUMPIXELS, atoi(b_String), NEO_GRB + NEO_KHZ800);
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
    //lcd
    if(strcmp(commandString, "l") == 0){
      //文字inputPin
      //第幾行inputValue 
      if(strcmp(b_String, "clear") == 0){
        lcd.clear(); 
      }else{
        lcd.setCursor(0, atoi(c_String));
        lcd.print(b_String);   
      }
    }
    
      //ws2812
    if(strcmp(commandString, "ws") == 0){
        int r = atoi(strtok(c_String,","));
        int g = atoi(strtok(NULL, ","));
        int b = atoi(strtok(NULL, ","));
        Adafruit_NeoPixel pixels(NUMPIXELS, atoi(b_String), NEO_GRB + NEO_KHZ800);
        pixels.begin();        
        //pixels.clear();
        char* sp = "";
        for( int i = 0; i<NUMPIXELS ; i++){
          //sp = inputTime[i];
          if (d_String[i] == '1') {
            sp = "0";
          }else if(d_String[i] == '2'){
            sp = "1";
          }else if(d_String[i] == '3'){
            sp = "2";
          }else if(d_String[i] == '4'){
            sp = "3";
          }else if(d_String[i] == '5'){
            sp = "4";
          }else if(d_String[i] == '6'){
            sp = "5";
          }else if(d_String[i] == '7'){
            sp = "6";
          }else if(d_String[i] == '8'){
            sp = "7";
          }else if(d_String[i] == '9'){
            sp = "8";
          }else if(d_String[i] == 'a'){
            sp = "9";
          }else if(d_String[i] == 'b'){
            sp = "10";
          }else if(d_String[i] == 'c'){
            sp = "11";
          }
          pixels.setPixelColor(atoi(sp), pixels.Color(r, g, b));
        }
        pixels.show(); 
      }
      //oled u8g2
      if(strcmp(commandString, "o") == 0) {
        //u8g2.setFont(u8g2_font_unifont_t_chinese1); //使用字型
        u8g2.setFont(u8g2_font_unifont_myfonts);
        u8g2.firstPage();
        int textlen = strlen(b_String);
        int ax = atoi(strtok(c_String,","));
        int ay = atoi(strtok(NULL, ","));
        do {
          u8g2.setCursor(ax,ay);
          u8g2.print(b_String);
          
        }while ( u8g2.nextPage() );
            //delay(1000);
      }
      //delay(1);
    }
}

String ontvangen() {
  FrameBuffer* myData = MicrobitRadio.recv();
  String ontvangst = "";  // lege String aanmaken
  if (myData != NULL) {
    for (uint8_t i = 0; i < myData->length - 3; i++) {  // -3 want een lege framebuffer is 3 bytes groot
      ontvangst = String(ontvangst + (char)myData->payload[i]);
    }
    delete myData;
  }
  return ontvangst;
}

void verzenden(String bericht) {
  bericht = bericht.substring(0, 30);             // beperken tot maximale lengte van 29 bytes anders krijg je rommel
  myDataSendData->length = bericht.length() + 3;  // +3 want een lege framebuffer is 3 bytes groot
  myDataSendData->group = GROEPCODE;
  myDataSendData->version = 12;
  myDataSendData->protocol = 14;

  for (uint8_t i = 0; i < bericht.length(); i++) {
    myDataSendData->payload[i] = bericht.charAt(i);
  }

  MicrobitRadio.send(myDataSendData);
}
