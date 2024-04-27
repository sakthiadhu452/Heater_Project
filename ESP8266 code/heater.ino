#include <ESP8266mDNS.h>
#include <LEAmDNS.h>
#include <LEAmDNS_Priv.h>
#include <LEAmDNS_lwIPdefs.h>

#include <Wire.h>
#include "max6675.h"
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <ESP8266WiFi.h>
#include <LiquidCrystal_I2C.h>

const char *ssid = "POCO X2";
const char *password = "7399pept";
int thermoDO = 12;
int thermoCS = 15;
int thermoCLK = 14;
int triggerPin = 5;
int lcdColumns = 16;
int lcdRows = 2;
int lcdAddress = 0x27; // I2C address of your LCD module

MAX6675 thermocouple(thermoCLK, thermoCS, thermoDO);
LiquidCrystal_I2C lcd(lcdAddress, lcdColumns, lcdRows); // Initialize the LCD with the I2C address

void setup() {
  Serial.begin(115200);
  pinMode(triggerPin, OUTPUT);
  lcd.init(); // Initialize the LCD
  lcd.backlight(); // Turn on the backlight

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
  // Check mode
  String mode = getMode();
  
  if (mode == "Manual") {
    // Check status
    String status = getStatus();
    
    if (status == "ON") {
      digitalWrite(triggerPin, HIGH);
      Serial.println("Heater turned ON");
    } else if (status == "OFF") {
      digitalWrite(triggerPin, LOW);
      Serial.println("Heater turned OFF");
    }
  } else if (mode == "Auto") {
    // Check temperature
    int celcius = thermocouple.readCelsius();
    Serial.print("Temperature: ");
    Serial.println(celcius);
    
    // Display temperature on LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Temp: ");
    lcd.print(celcius);
    lcd.print(" C");
    
    // Check if temperature exceeds 52
    if (celcius > 52) {
      digitalWrite(triggerPin, LOW); // Turn off the heater
      Serial.println("Heater turned OFF");
      // Send POST request to change heater state to OFF
      sendPostRequest();
    } else {
      digitalWrite(triggerPin, HIGH); // Turn on the heater
      Serial.println("Heater turned ON");
      // Send POST request to change heater state to ON
      sendPostRequest();
    }
    
    // Update temperature using POST request
    updateTemperature(celcius);
  }

  Serial.println();
  Serial.println("Waiting 2 minutes before the next round...");
  delay(120000); // Delay for 2 minutes
}

String getMode() {
  String mode = "";
  if (WiFi.status() == WL_CONNECTED) {
    std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
    client->setInsecure();

    HTTPClient https;
    Serial.println("[HTTPS] begin...");

    if (https.begin(*client, "https://heater-1.onrender.com/getMode")) {
      https.setTimeout(10000);
      Serial.println("[HTTPS] GET...");

      int httpCode = https.GET();
      
      if (httpCode > 0) {
        Serial.printf("[HTTPS] GET... code: %d\n", httpCode);

        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
          mode = https.getString();
          Serial.println("Mode:");
          Serial.println(mode);
        }
      } else {
        Serial.printf("[HTTPS] GET... failed, error: %s\n", https.errorToString(httpCode).c_str());
      }

      https.end();
    } else {
      Serial.println("[HTTPS] Unable to connect");
    }
  } else {
    Serial.println("WiFi not connected.");
  }

  return mode;
}

String getStatus() {
  String status = "";
  if (WiFi.status() == WL_CONNECTED) {
    std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
    client->setInsecure();

    HTTPClient https;
    Serial.println("[HTTPS] begin...");

    if (https.begin(*client, "https://heater-1.onrender.com/getStatus")) {
      https.setTimeout(10000);
      Serial.println("[HTTPS] GET...");

      int httpCode = https.GET();
      
      if (httpCode > 0) {
        Serial.printf("[HTTPS] GET... code: %d\n", httpCode);

        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
          status = https.getString();
          Serial.println("Status:");
          Serial.println(status);
        }
      } else {
        Serial.printf("[HTTPS] GET... failed, error: %s\n", https.errorToString(httpCode).c_str());
      }

      https.end();
    } else {
      Serial.println("[HTTPS] Unable to connect");
    }
  } else {
    Serial.println("WiFi not connected.");
  }

  return status;
}

void sendPostRequest() {
  WiFiClient client;

  if (client.connect("heater-1.onrender.com", 443)) {
    Serial.println("Connected to server");
    
    client.println("POST /changestate HTTP/1.1");
    client.println("Host: heater-1.onrender.com");
    client.println("Connection: close");
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
  
    client.println();
    client.println(state);
    client.println();
  } else {
    Serial.println("Connection failed");
  }
}

void updateTemperature(int temperature) {
  WiFiClient client;

  if (client.connect("heater-1.onrender.com", 443)) {
    Serial.println("Connected to server");
    
    client.println("POST /updateTemperature HTTP/1.1");
    client.println("Host: heater-1.onrender.com");
    client.println("Connection: close");
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(String(temperature).length());
    client.println();
    client.println(temperature);
    client.println();
  } else {
    Serial.println("Connection failed");
  }
}
