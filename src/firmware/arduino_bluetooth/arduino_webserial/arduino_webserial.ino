#include <SoftwareSerial.h>
SoftwareSerial BTSerial (0,1);
void setup() {
  // put your setup code here, to run once:
  Serial.begin(57600);
  Serial.println("Enter AT Commands");
  BTSerial.begin(57600);
}

void loop() {
  // put your main code here, to run repeatedly:
  if(BTSerial.available()){
    char* aa = BTSerial.read();
    Serial.println(aa);
    Serial.write(aa);
  }
  //if(Serial.available()){
  //  BTSerial.write(Serial.read());
  //}
}
