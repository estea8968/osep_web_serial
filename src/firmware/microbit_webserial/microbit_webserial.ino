//版本日期 112 12 12 
//版號
char *ver = "1121212";
#include "Wire.h"
#include <Adafruit_Microbit.h>
#include "MMA8653.h"
#include <LiquidCrystal_I2C.h> // LCD_I2C模組程式庫
LiquidCrystal_I2C lcd(0x27, 16, 2);
#include <DHTStable.h>
DHTStable DHT;
//ws2812
#include <Adafruit_NeoPixel.h>
#define NUMPIXELS 12
//u8g2
#include <U8g2lib.h>
#include "u8g2_font_e58524b32706dda48e7107fc64bfd183.h"
U8G2_SSD1306_128X64_NONAME_1_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

//#include "i2c_MAG3110.h"
//MAG3110 mag3110;
#define MAG_ADDR  0x0E //7-bit address for the MAG3110, doesn't change
Adafruit_Microbit_Matrix microbit;
MMA8653 accel = MMA8653();
int16_t x, y, z;
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

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(5);
  pinMode(PIN_BUTTON_A, INPUT);
  pinMode(PIN_BUTTON_B, INPUT);
  //microbit.begin();
  Serial.println("micro:bit");
  // Start I2C at 400khz (fast mode)
    Wire.begin();
    Wire.setClock(400000);
  
// Setup accelerometer at 2G range, 10bit res, 50hz update rate and HighRes mode
    accel.init(MMA8653_2G_RANGE, MMA8653_10BIT_RES, MMA8653_ODR_50);
    accel.setMODS(MMA8653_MODS_HIGH_RES);
    //accel.resetOffsets();           // Will make all axis offsets 0
    //accel.setOffsets(100, -100, 0); // Set offsets X=100, Y=-100, Z=0
    // Put accelerometer in active mode
    accel.begin();

    //u8g2
    u8g2.begin();
    u8g2.enableUTF8Print();  //啟用UTF8文字的功能
    
    //mag3110
    Wire.begin(); // join i2c bus (address optional for master)
    config(); // turn the MAG3110 on
    microbit.begin();
 }

void config(void)
{
  Wire.beginTransmission(MAG_ADDR); // transmit to device 0x0E
  Wire.write(0x11);             // cntrl register2
  Wire.write(0x80);             // write 0x80, enable auto resets
  Wire.endTransmission();       // stop transmitting
  delay(15); 
  Wire.beginTransmission(MAG_ADDR); // transmit to device 0x0E
  Wire.write(0x10);             // cntrl register1
  Wire.write(1);                // write 0x01, active mode
  Wire.endTransmission();       // stop transmitting
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
      //button
      if(strcmp(commandString, "b") == 0){
        Serial.print("b:");
        Serial.print(digitalRead(PIN_BUTTON_A));
        Serial.print(",");
        Serial.println(digitalRead(PIN_BUTTON_B));
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
      //MMA8653 xyz
      if(strcmp(commandString, "mma") == 0){
        accel.readSensor(&x, &y, &z);
        
        //accel.getOffsets(&offset_x, &offset_y, &offset_z);
        Serial.print("mma:");
        Serial.print(x);
        Serial.print(",");
        Serial.print(y);
        Serial.print(",");
        Serial.println(z);
        
      }
      //mag3110
      if(strcmp(commandString, "mag") == 0){
        Serial.print("mag:");
        Serial.print(read_x());
        Serial.print(",");  
        Serial.print(read_y());
        Serial.print(",");       
        Serial.println(read_z());
        /*向上向下x由64xxx到65xxx
         *前後傾y差很多 
         *左右傾z差很多 
         */
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

int mag_read_register(int reg)
{
  int reg_val;
  
  Wire.beginTransmission(MAG_ADDR); // transmit to device 0x0E
  Wire.write(reg);              // x MSB reg
  Wire.endTransmission();       // stop transmitting
  delayMicroseconds(2); //needs at least 1.3us free time between start and stop
  
  Wire.requestFrom(MAG_ADDR, 1); // request 1 byte
  while(Wire.available())    // slave may write less than requested
  { 
    reg_val = Wire.read(); // read the byte
  }
  
  return reg_val;
}
int mag_read_value(int msb_reg, int lsb_reg)
{
  int val_low, val_high;  //define the MSB and LSB
  val_high = mag_read_register(msb_reg);
  delayMicroseconds(2); //needs at least 1.3us free time between start and stop
  val_low = mag_read_register(lsb_reg);
  int out = (val_low|(val_high << 8)); //concatenate the MSB and LSB
  return out;
}


int read_x(void)
{
  return mag_read_value(0x01, 0x02);
}

int read_y(void)
{
  return mag_read_value(0x03, 0x04);
}

int read_z(void)
{
  return mag_read_value(0x05, 0x06);
}
