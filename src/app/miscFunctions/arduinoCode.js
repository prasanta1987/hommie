const esp32Imports = String.raw
  `

#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <NetworkClientSecure.h>
#include <Arduino_JSON.h>
#include <map>

#include "Hommily.h"

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
#define hostUrl "https://hommily.vercel.app/api/iot";

HommilyIoT iot;

void setup() {
  Serial.begin(115200);
  iot.addWiFi("SSID1", "PASSWORD1");
  iot.addWiFi("SSID2", "PASSWORD2");
  iot.begin(apiKey, hostUrl);
}

void loop() {
  iot.handleStream();

  int freeRAM = ESP.getFreeHeap();
  iot.sendData("FreeRAM", freeRAM, 30000);

  yield();
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

const esp32Class = String.raw
  `

class HommilyIoT {
  private:
    String _apiKey, _baseUrl, _deviceCode, _streamUrl, _postUrl;
    WiFiMulti _wifiMulti;
    NetworkClientSecure _streamClient;
    HTTPClient _sseHttp;

    std::map<String, unsigned long> _feedTimers;
    bool _isStreamConnected = false;
    unsigned long _lastStreamActivity = 0;
    const unsigned long _streamTimeout = 35000;

    // Internal "Worker" that handles the actual HTTP logic
    void _internalSend(String feedName, String feedValue, unsigned long interval);

    void setHexColor(String hex, int rPin, int gPin, int bPin);
    void handleHardwareCommands(JSONVar data);

  public:
    HommilyIoT() {}
    void addWiFi(const char* ssid, const char* pass) {
      _wifiMulti.addAP(ssid, pass);
    }
    void begin(String apiKey, String baseUrl);
    void handleStream();

    // PUBLIC Overloads so they can be called from loop()
    void sendData(String feedName, String feedValue, unsigned long interval);
    void sendData(String feedName, int feedValue, unsigned long interval);
    void sendData(String feedName, float feedValue, int decimals, unsigned long interval);
};

// --- Scope Resolution Definitions ---

void HommilyIoT::begin(String apiKey, String baseUrl) {
  _apiKey = apiKey;
  _baseUrl = baseUrl;
  _deviceCode = WiFi.macAddress();
  _deviceCode.replace(":", "");
  _streamUrl = _baseUrl + "/liveData?feedName=all&apiKey=" + _apiKey + "&deviceCode=" + _deviceCode;
  _postUrl = _baseUrl + "/setData"; // Verified endpoint from previous context

  Serial.print("Connecting WiFi");
  while (_wifiMulti.run() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nAuthenticated: " + _deviceCode);
}

// Overload 1: String
void HommilyIoT::sendData(String feedName, String feedValue, unsigned long interval) {
  _internalSend(feedName, feedValue, interval);
}

// Overload 2: Int
void HommilyIoT::sendData(String feedName, int feedValue, unsigned long interval) {
  _internalSend(feedName, String(feedValue), interval);
}

// Overload 3: Float
void HommilyIoT::sendData(String feedName, float feedValue, int decimals, unsigned long interval) {
  _internalSend(feedName, String(feedValue, decimals), interval);
}

// The Worker Function
void HommilyIoT::_internalSend(String feedName, String feedValue, unsigned long interval) {
  if (millis() - _feedTimers[feedName] >= interval) {
    _feedTimers[feedName] = millis();

    NetworkClientSecure postClient;
    postClient.setInsecure();
    HTTPClient http;

    if (http.begin(postClient, _postUrl)) {
      http.addHeader("Content-Type", "application/json");

      JSONVar payload;
      payload["apiKey"] = _apiKey;
      payload["deviceCode"] = _deviceCode;
      payload["purpose"] = "FEED";
      payload["feedName"] = feedName;

      JSONVar data;
      data["value"] = feedValue;
      payload["data"] = data;

      int httpCode = http.POST(JSON.stringify(payload));
      if (httpCode > 0) {
        Serial.printf("[%s] Success %d: %s\n", feedName.c_str(), httpCode, feedValue.c_str());
      } else {
        Serial.printf("[%s] Error: %s\n", feedName.c_str(), http.errorToString(httpCode).c_str());
      }
      http.end();
    }
  }
}

void HommilyIoT::setHexColor(String hex, int rPin, int gPin, int bPin) {
  if (hex.startsWith("#")) hex = hex.substring(1);
  long number = strtol(hex.c_str(), NULL, 16);
  int r = (number >> 16) & 0xFF;
  int g = (number >> 8) & 0xFF;
  int b = number & 0xFF;

  ledcAttach(rPin, 5000, 8);
  ledcAttach(gPin, 5000, 8);
  ledcAttach(bPin, 5000, 8);

  ledcWrite(rPin, 255 - r);
  ledcWrite(gPin, 255 - g);
  ledcWrite(bPin, 255 - b);
}

void HommilyIoT::handleHardwareCommands(JSONVar data) {
  if (JSON.typeof(data) != "object") return;
  JSONVar keys = data.keys();
  for (int i = 0; i < keys.length(); i++) {
    String type = (const char*)data[keys[i]]["type"];
    if (type == "Toggle") {
      int pin = (int)data[keys[i]]["GPIO"];
      int value = (int)data[keys[i]]["value"];
      bool isSwapped = (bool)data[keys[i]]["isSwapped"];
      pinMode(pin, OUTPUT);
      digitalWrite(pin, isSwapped ? !value : value);
    }

    if (type == "Colour") {
      setHexColor((const char*)data[keys[i]]["value"],
                  (int)data[keys[i]]["rPIN"],
                  (int)data[keys[i]]["gPIN"],
                  (int)data[keys[i]]["bPIN"]);
    }
    // ... add Colour type here if needed ...
  }
}

void HommilyIoT::handleStream() {
  if (_wifiMulti.run() != WL_CONNECTED) return;
  if (!_isStreamConnected) {
    _streamClient.setInsecure();
    if (_sseHttp.begin(_streamClient, _streamUrl)) {
      _sseHttp.addHeader("Accept", "text/event-stream");
      if (_sseHttp.GET() == 200) {
        _isStreamConnected = true;
        _streamClient.setTimeout(50);
        _lastStreamActivity = millis();
        Serial.println(">>> SSE Connected");
      }
    }
  } else {
    if (_streamClient.available()) {
      String line = _streamClient.readStringUntil('\n');
      _lastStreamActivity = millis();
      if (line.startsWith("data:")) {
        JSONVar data = JSON.parse(line.substring(5));
        handleHardwareCommands(data);
      }
    }
    if (millis() - _lastStreamActivity > _streamTimeout || !_sseHttp.connected()) {
      _isStreamConnected = false;
      _sseHttp.end();
    }
  }
}

`


const esp8266Class = String.raw
`
`


export { esp32Imports, esp8266Imports, esp32Code, esp8266Code, esp32Class,esp8266Class };