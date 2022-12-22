//版本日期 111 12 22 
const int interval = 10;  // 取樣間隔時間，10ms。
unsigned int sample;   // 聲音取樣值
unsigned int amplitude;  // 訊號振幅
int pin ;
char* serialString()
{
  static char str[21]; // For strings of max length=20
  if (!Serial.available()) return NULL;
  delay(5); // wait for all characters to arrive
  memset(str,0,sizeof(str)); // clear str
  byte count=0;
  while (Serial.available())
  {
    char c=Serial.read();
    if (c>=32 && count<sizeof(str)-1)
    {
      str[count]=c;
      count++;
    }
  }
  str[count]='\0'; // make it a zero terminated string
  return str;
}

int minmaxavg(){
  unsigned int sigMax = 0;  // 最高峰值
      unsigned int sigMin = 2000;  // 最低峰值
      unsigned long now = millis(); // 當前時間
      while (millis() < now + interval) {
          sample = analogRead(pin);
          if (sample < sigMin) {
            sigMin = sample;
          } else if (sample > sigMax) {
            sigMax = sample;
          }
        }
     return (int)(sigMin+sigMax)/2;
}
void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  //啟動D2
    DDRD  &= ~( 1 << PD2 );     // Clear the PD2 pin and set PD2 (PCINT0 pin) now as input
    PORTD |= (1 << PD2);        // Set PIN PD2 as INPUT with pull-up enabled

    EICRA |= (1 << ISC00);      // set INT0 to trigger on ANY logic change
    EIMSK |= (1 << INT0);       // Turns on INT0
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
  
  if (inputData!=NULL)
  {
  //[1.J4-A1(D15),2J3-A2(D16),3J2-A4(D18),4按鈕D2,J1-A5(D19),
  //6光敏A6(D20),聲音micA3(D17),8滑桿(A0)]
    if(strcmp(inputData, "0") == 0){
      Serial.print("A0:");
      Serial.print(analogRead(0));
      Serial.println(":p");
    }
    if(strcmp(inputData, "1") == 0){
      Serial.print("A1:");
      Serial.print(analogRead(1));
      Serial.println(":p");
    }
    if(strcmp(inputData, "2") == 0){
      Serial.print("A2:");
      Serial.print(analogRead(2));
      Serial.println(":p");
    }
    if(strcmp(inputData, "3") == 0){
      pin = 3;
      int m3 = minmaxavg();
      Serial.print("A3:");
      Serial.print(m3);
      Serial.println(":p");
    }
    if(strcmp(inputData, "4") == 0){
      Serial.print("A4:");
      Serial.print(analogRead(4));
      Serial.println(":p");
    }
    if(strcmp(inputData, "5") == 0){
      Serial.print("A5:");
      Serial.print(analogRead(5));
      Serial.println(":p");
    }
    if(strcmp(inputData, "6") == 0){
      pin = 6;
      int l6 = minmaxavg();
      Serial.print("A6:");
      Serial.print(l6);
      Serial.println(":p");
    }
    if(strcmp(inputData, "7") == 0){
      Serial.print("D7:");
      Serial.print(digitalRead(2));
      Serial.println(":p");
    }
    /*
    if(strcmp(inputData, "8") == 0){
      Serial.print(analogRead(1));
      Serial.print(",");
      Serial.print(analogRead(2));
      Serial.print(",");
      Serial.print(analogRead(4));
      Serial.print(",");
      Serial.print(digitalRead(2));
      Serial.print(",");
      Serial.print(analogRead(5));
      Serial.print(",");
      Serial.print(analogRead(6));
      Serial.print(",");
      Serial.print(analogRead(3));
      Serial.print(",");
      Serial.println(analogRead(0));
    }*/
    delay(2);    
    inputData = NULL;
  }
  needPrompt=true;
 
}
