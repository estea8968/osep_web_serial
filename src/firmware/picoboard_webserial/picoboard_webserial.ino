
char* serialString()
{
  static char str[21]; // For strings of max length=20
  if (!Serial.available()) return NULL;
  delay(3); // wait for all characters to arrive
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
  //[1.J4-A1(D15),2J3-A2(D16),3J2-A4(D18),4按鈕D2,J1-A5(D19),6光敏A6(D20),聲音micA3(D17),8滑桿(A0)]
    if(strcmp(inputData, "0") == 0){
      Serial.print("A:");
      Serial.println(analogRead(0));
    }
    if(strcmp(inputData, "1") == 0){
      Serial.print("A:");
      Serial.println(analogRead(1));
    }
    if(strcmp(inputData, "2") == 0){
      Serial.print("A:");
      Serial.println(analogRead(2));
    }
    if(strcmp(inputData, "3") == 0){
      Serial.print("A:");
      Serial.println(analogRead(3));
    }
    if(strcmp(inputData, "4") == 0){
      Serial.print("A:");
      Serial.println(analogRead(4));
    }
    if(strcmp(inputData, "5") == 0){
      Serial.print("A:");
      Serial.println(analogRead(5));
    }
    if(strcmp(inputData, "6") == 0){
      Serial.print("A:");
      Serial.println(analogRead(6));
    }
    if(strcmp(inputData, "7") == 0){
      Serial.print("D:");
      Serial.println(digitalRead(2));
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
    //delay(10);    
    inputData = NULL;
  }
  needPrompt=true;
 
}
