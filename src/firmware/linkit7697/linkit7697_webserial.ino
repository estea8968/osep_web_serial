/*
 * 更新日期112/04/26 estea chen
 * 
 */
#include <Servo.h>
#include <math.h> //包含數學庫
#include <DHTStable.h>
#include <Wire.h>  // I2C程式庫
#include <LiquidCrystal_I2C.h>  // LCD_I2C模組程式庫
#include <Ultrasonic.h>   //超音波測距模組HC-SR04

LiquidCrystal_I2C lcd(0x27);  //0x3F  0x27
//版本號
char* version="1120426";
Servo myservo;  // create servo object to control a servo
DHTStable DHT;

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
  lcd.begin(16, 2); ;
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
      int pin = atoi(inputPin);
      if(pin==0){
        Serial.print("A0:");
        Serial.println(analogRead(A0));
      }else if(pin==1){
        Serial.print("A1:");
        Serial.println(analogRead(A1));  
      }else if(pin==2){
        Serial.print("A2:");
        Serial.println(analogRead(A2));  
      }else if(pin==3){
        Serial.print("A3:");
        Serial.println(analogRead(A3));  
      }
    }
    //ntc
    if(strcmp(commandString, "ntc") == 0){
      int pin = atoi(inputPin);
      int analog_sum=0;
      for(int i=1;i<10;i++){
        if(pin==0){
          analog_sum += analogRead(A0);
        }else if(pin==1){
          analog_sum += analogRead(A1);  
        }else if(pin==2){
          analog_sum += analogRead(A2);   
        }else if(pin==3){
          analog_sum += analogRead(A3);  
        }
        delay(10);
      }
      analog_sum = (int)analog_sum/10;
      Serial.print("N:");
      Serial.println(analog_sum);
    }
    //數位讀取
    if(strcmp(commandString, "digitalRead") == 0){
      int pin = atoi(inputPin);
      pinMode(pin,INPUT);
      //2-19
      Serial.print("D");
      Serial.print(pin);
      Serial.print(":");
      Serial.println(digitalRead(pin));
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
    
    //dht11    
    if(strcmp(commandString, "dht11Read") == 0){
      int chk;
      int pin = atoi(inputPin);
      //Serial.print(pin);
      int a=0;  
        do{
         
        if(pin==0){
          //Serial.print("A0");
          chk = DHT.read11(A0);
          //Serial.print("0");
          //#define DHT11_PIN       A0
        }else if(pin==1){
          //#define DHT11_PIN       A1
          chk = DHT.read11(A1);
        }else if(pin==2){
          //#define DHT11_PIN       A2
          chk = DHT.read11(A2);
        }else if(pin==3){
          //#define DHT11_PIN       A3
          chk = DHT.read11(A3);
        }  
        //chk = DHT.read11(A0); 
        delay(1000);
        switch (chk){
          case DHTLIB_OK:  
            //Serial.print("OK,\t");
            a=1;
            Serial.print(DHT.getHumidity());
            Serial.print(",");
            Serial.println(DHT.getTemperature());
            break;
          case DHTLIB_ERROR_CHECKSUM: 
            //Serial.print("Checksum error,\t");
            Serial.println("error"); 
            a=0;
            break;
          case DHTLIB_ERROR_TIMEOUT: 
            Serial.println("error"); 
            a=0;
            break;
          default: 
            a=0;
            Serial.println("error"); 
            break;
         }   
        delay(1000);
        }while(a=0);
 
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
    needPrompt=true;
    //delay(1000);
  }
  
}


/*void getG5(unsigned char ucData)//取G5的值
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
}*/

/*uint64_t stringToUint_64(String value) {
  int stringLenght = value.length();

  uint64_t uint64Value = 0x0;
  for(int i = 0; i<=stringLenght-1; i++) {
    char charValue = value.charAt(i);
    uint64Value = 0x10 * uint64Value;
    uint64Value += stringToHexInt(charValue);
  }

  return uint64Value;
}*/

/*int stringToHexInt(char value) {
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
}*/
