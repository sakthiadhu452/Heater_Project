#include <ESP8266WiFi.h>
#include <Wire.h>
#include "max6675.h"
#include <LiquidCrystal_I2C.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>

const char *ssid = "POCO X2";
const char *password = "7399pept";
int thermoDO = 12;
int thermoCS = 15;
int thermoCLK = 14;
int triggerPin = 5;
int lcdColumns = 16;
int lcdRows = 2;
int lcdAddress = 0x27;

MAX6675 thermocouple(thermoCLK, thermoCS, thermoDO);
LiquidCrystal_I2C lcd(lcdAddress, lcdColumns, lcdRows);

void setup() {
  Serial.begin(115200);
  pinMode(triggerPin, OUTPUT);
  lcd.init();
  lcd.backlight();

  Serial.println();
  Serial.println();
  Serial.println("Connecting to WiFi...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Connected to WiFi");
}

void loop() {
  String mode = getMode();
  
  if (mode == "Manual") {
    String status = getStatus();
    
    if (status == "ON") {
      digitalWrite(triggerPin, HIGH);
      Serial.println("Heater turned ON");
    } else if (status == "OFF") {
      digitalWrite(triggerPin, LOW);
      Serial.println("Heater turned OFF");
    }
  } else if (mode == "Auto") {
    int celcius = thermocouple.readCelsius();
    Serial.print("Temperature: ");
    Serial.println(celcius);
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Temp: ");
    lcd.print(celcius);
    lcd.print(" C");
    
    if (celcius > 52) {
      digitalWrite(triggerPin, LOW);
      Serial.println("Heater turned OFF");
      sendPostRequest("OFF");
    } else {
      digitalWrite(triggerPin, HIGH);
      Serial.println("Heater turned ON");
      sendPostRequest("ON");
    }
    
    updateTemperature(celcius);
  }

  Serial.pri
