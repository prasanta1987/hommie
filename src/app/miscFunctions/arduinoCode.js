const esp32Imports = String.raw
  `

#include <WiFi.h>
#include <HTTPClient.h>

`
const esp8266Imports = String.raw
  `
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ESP8266WiFiMulti.h>
#include <Arduino_JSON.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>

`;

const esp32Code = String.raw
  `

void setup(void) {

}


void loop() {

}

`;

const esp8266Code = String.raw

  `

const String baseUrl = "https://hommily.vercel.app/api/iot";

ESP8266WiFiMulti wifiMulti;
Adafruit_BMP280 bmp;  // I2C


String streamUrl = "";
String deviceCode = "";

// SSE Reconnect
unsigned long lastStreamActivity = 0;
const unsigned long streamTimeout = 12000;  // 35s (Vercel heartbeats every 10s)

// Data Post Interval
unsigned long lastPostTime = 0;
const unsigned long postInterval = 30000;  // 30s Sensor Update

WiFiClientSecure streamClient;
HTTPClient sseHttp;
bool isStreamConnected = false;


void setup() {
  Serial.begin(115200);
  bmp.begin(0x76);
  delay(100);
  connectToWiFi();
  delay(500);
  sendSensorData("Temperature", String(bmp.readTemperature()));
}

void loop() {
  if (wifiMulti.run() != WL_CONNECTED) {
    connectToWiFi();
  }

  handleSSEStream();

  if (millis() - lastPostTime >= postInterval) {
    lastPostTime = millis();
    sendSensorData("Temperature", String(bmp.readTemperature()));
  }

  yield();  // Important for ESP8266 background stability
}


void connectToWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.mode(WIFI_STA);
  wifiMulti.addAP("PK_NEO", "cxa1619bs");
  wifiMulti.addAP("Home_Network", "cxa1619bs");

  deviceCode = WiFi.macAddress();
  deviceCode.replace(":", "");

  streamUrl = baseUrl + "/liveData?feedName=all&apiKey=" + apiKey + "&deviceCode=" + deviceCode;
}

void handleSSEStream() {
  if (!isStreamConnected) {
    streamClient.setInsecure();
    if (sseHttp.begin(streamClient, streamUrl)) {
      sseHttp.addHeader("Accept", "text/event-stream");
      int httpCode = sseHttp.GET();
      if (httpCode == 200 || httpCode == 307) {
        isStreamConnected = true;
        // Short timeout so readStringUntil doesn't hang the loop
        streamClient.setTimeout(100);
        lastStreamActivity = millis();
        Serial.println(">>> SSE Stream Connected");
      }
    }
  }

  if (isStreamConnected) {
    WiFiClient *stream = sseHttp.getStreamPtr();

    // 1. Check for Incoming Data
    if (stream->available()) {
      String line = stream->readStringUntil('\n');
      lastStreamActivity = millis();  // Reset Watchdog on data or heartbeat

      line.trim();

      if (line == "0") {
        Serial.println("0 String Detected.");
        isStreamConnected = false;
        sseHttp.end();
      }

      if (line.startsWith("data:")) {
        String jsonStr = line.substring(line.indexOf(':') + 1);
        jsonStr.trim();
        JSONVar data = JSON.parse(jsonStr);
        if (JSON.typeof(data) == "object") {
          processHardwareCommands(data);
        }
      }
    }

    // 2. Watchdog: If Vercel stops heartbeating for 35s, force reconnect
    if (millis() - lastStreamActivity > streamTimeout) {
      Serial.println("!!! Stream Watchdog Timeout. Force Reconnecting...");
      isStreamConnected = false;
      sseHttp.end();
    }

    // 3. Socket Check: Standard TCP closure
    if (!sseHttp.connected()) {
      Serial.println("!!! Stream Socket Closed. Reconnecting...");
      isStreamConnected = false;
      sseHttp.end();
    }
  }
}

void processHardwareCommands(JSONVar data) {
  if (JSON.typeof(data) != "object")
    return;

  JSONVar keys = data.keys();
  for (int i = 0; i < keys.length(); i++) {
    String type = (const char *)data[keys[i]]["type"];

    if (type == "Toggle") {
      int pin = (int)data[keys[i]]["GPIO"];
      int value = (int)data[keys[i]]["value"];
      bool isSwapped = (bool)data[keys[i]]["isSwapped"];

      pinMode(pin, OUTPUT);
      digitalWrite(pin, isSwapped ? !value : value);
      Serial.printf("Toggle -> GPIO:%d Value:%d", pin, value);
      Serial.println();
    }
  }
}

void sendSensorData(String feedName, String feedValue) {
  WiFiClientSecure postClient;
  postClient.setInsecure();
  postClient.setBufferSizes(512, 512);  // Reduce memory footprint

  HTTPClient http;
  String postUrl = baseUrl + "/setData";  // Your POST route

  if (http.begin(postClient, postUrl)) {
    http.addHeader("Content-Type", "application/json");

    JSONVar payload;
    payload["apiKey"] = apiKey;
    payload["deviceCode"] = deviceCode;
    payload["purpose"] = "FEED";
    payload["feedName"] = feedName;

    JSONVar data;
    data["value"] = feedValue;  // Example analog value
    payload["data"] = data;

    Serial.println("Sending POST update...");
    int httpResponseCode = http.POST(JSON.stringify(payload));

    if (httpResponseCode > 0) {
      Serial.printf("POST Success: %d\n", httpResponseCode);
    } else {
      Serial.printf("POST Error: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  }
}

`;




export { esp32Imports, esp8266Imports, esp32Code, esp8266Code };