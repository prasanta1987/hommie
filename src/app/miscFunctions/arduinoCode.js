const esp32Imports = `
#include <WiFi.h>
#include <HTTPClient.h>

`
const esp8266Imports = `
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <Arduino_JSON.h>


`;

const esp32Code = `

void setup(void) {

}


void loop() {

}

`;

const esp8266Code = `

const char *ssid = "YOUR_SSID";
const char *password = "YOUR_PASSWORD";

const String host = "https://hommily.vercel.app/api/liveData";

String url = "";

void connectToWiFi();
void handleData(JSONVar data);
void refreshData();

void setup()
{
  Serial.begin(115200);
  delay(100);
  connectToWiFi();
}

void loop()
{
  refreshData();
  delay(1000);
}

void refreshData()
{

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient https;

  if (https.begin(client, url))
  {
    https.addHeader("Accept", "text/event-stream");

    int httpCode = https.GET();
    if (httpCode == HTTP_CODE_OK)
    {
      WiFiClient *stream = https.getStreamPtr();

      while (https.connected())
      {
        if (stream->available())
        {
          String line = stream->readStringUntil('\n');
          line.trim();

          if (line.startsWith("data:"))
          {
            JSONVar data = JSON.parse(line.substring(5));
            if (JSON.typeof(data) == "object")
            {
              handleData(data);
            }
          }

          if (line == "0")
          {
            Serial.println("Reconnecting...");
            break;
          }
        }
        yield();
      }
    }
    else
    {
      Serial.printf("Error: %s\n", https.errorToString(httpCode).c_str());
    }
    https.end();
  }
  else
  {
    Serial.println("Unable to connect");
  }
}

void connectToWiFi()
{
  Serial.println("Connecting to SSID: " + String(ssid));
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  String deviceCode = WiFi.macAddress();
  deviceCode.replace(":", "");
  url = "https://hommily.vercel.app/api/liveData?feedName=all&apiKey=" + API + "&deviceCode=" + deviceCode;

  Serial.println("WiFi connected!");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void handleData(JSONVar data)
{

  JSONVar keys = data.keys();
  for (int i = 0; i < data.keys().length(); i++)
  {
    if (data[keys[i]].hasOwnProperty("GPIO"))
    {

      int pin = int(data[keys[i]]["GPIO"]);
      int value = int(data[keys[i]]["value"]);

      pinMode(pin, OUTPUT);
      digitalWrite(pin, value);
    }
  }
}

`;




export { esp32Imports, esp8266Imports, esp32Code, esp8266Code };