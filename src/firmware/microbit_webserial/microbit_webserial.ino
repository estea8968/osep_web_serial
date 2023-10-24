//版本日期 112 10 17 
#include "Wire.h"
#include <Adafruit_Microbit.h>
#include "MMA8653.h"
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
    //mag3110
    Wire.begin(); // join i2c bus (address optional for master)
    config(); // turn the MAG3110 on
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
      //led
      if(strcmp(commandString, "led") == 0){
        microbit.begin();
        if(strcmp(b_String, "led_on") == 0){
          microbit.fillScreen(LED_ON);
        }else if(strcmp(b_String, "heart") == 0){
          microbit.show(microbit.HEART);
        }else if(strcmp(b_String, "no") == 0){
          microbit.show(microbit.NO);
        }else if(strcmp(b_String, "yes") == 0){
          microbit.show(microbit.YES);
        }else if(strcmp(b_String, "smile") == 0){
          microbit.show(smile_bmp);
        }else if(strcmp(b_String, "sad") == 0){
          microbit.show(sad_bmp);
        }else if(strcmp(b_String, "clear") == 0){
          microbit.clear();
        }else if(strcmp(b_String, "drawPixel") == 0){
          char *a0 = strtok(c_String, ",");
          char *a1 = strtok(NULL, ",");
          char *a2 = strtok(NULL, ",");
          microbit.drawPixel(atoi(a0), atoi(a1), atoi(a2));
        }else if(strcmp(b_String, "drawLine") == 0){
          char* a0 = strtok(c_String, ",");
          char *a1 = strtok(NULL, ",");
          char* a2 = strtok(NULL, ",");
          char *a3 = strtok(NULL, ",");
          microbit.drawLine(atoi(a0), atoi(a1), atoi(a2), atoi(a3), LED_ON);
        }else if(strcmp(b_String, "matrix")==0){
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
