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
#include <Arduino_JSON.h>


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
const String baseUrl = "https://hommily.vercel.app/api";

const char *ssid = "PK_NEO";
const char *password = "cxa1619bs";

// 1. State & Timing Variables
String streamUrl = "";
String deviceCode = "";
unsigned long lastPostTime = 0;
const unsigned long postInterval = 30000; // 30s Sensor Update

// 2. Heartbeat Watchdog Variables
unsigned long lastStreamActivity = 0;
const unsigned long streamTimeout = 12000; // 35s (Vercel heartbeats every 10s)

WiFiClientSecure streamClient;
HTTPClient sseHttp;
bool isStreamConnected = false;

void connectToWiFi();
void handleSSEStream();
void sendSensorData();
void processHardwareCommands(JSONVar data);

void setup()
{
  Serial.begin(115200);
  delay(100);
  connectToWiFi();
}

void loop()
{
  handleSSEStream();

  if (millis() - lastPostTime >= postInterval)
  {
    lastPostTime = millis();
    sendSensorData();
  }

  yield();
}

void connectToWiFi()
{
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  // Generate Unique Device Code from MAC Address
  deviceCode = WiFi.macAddress();
  deviceCode.replace(":", "");

  // Build URL for the SSE Route
  streamUrl = baseUrl + "/liveData?feedName=all&apiKey=" + apiKey + "&deviceCode=" + deviceCode;
}

void handleSSEStream()
{
  if (!isStreamConnected)
  {
    streamClient.setInsecure();
    if (sseHttp.begin(streamClient, streamUrl))
    {
      sseHttp.addHeader("Accept", "text/event-stream");
      int httpCode = sseHttp.GET();
      if (httpCode == 200 || httpCode == 307)
      {
        isStreamConnected = true;
        streamClient.setTimeout(100);
        lastStreamActivity = millis();
        Serial.println(">>> SSE Stream Connected");
      }
    }
  }

  if (isStreamConnected)
  {
    WiFiClient *stream = sseHttp.getStreamPtr();

    if (stream->available())
    {
      String line = stream->readStringUntil('\n');
      lastStreamActivity = millis(); // Reset Watchdog on data or heartbeat

      line.trim();

      if (line == "0")
      {
        Serial.println("0 String Detected.");
        isStreamConnected = false;
        sseHttp.end();
      }

      if (line.startsWith("data:"))
      {
        String jsonStr = line.substring(line.indexOf(':') + 1);
        jsonStr.trim();
        JSONVar data = JSON.parse(jsonStr);
        if (JSON.typeof(data) == "object")
        {
          processHardwareCommands(data);
        }
      }
    }

    if (millis() - lastStreamActivity > streamTimeout)
    {
      Serial.println("!!! Stream Watchdog Timeout. Force Reconnecting...");
      isStreamConnected = false;
      sseHttp.end();
    }

    if (!sseHttp.connected())
    {
      Serial.println("!!! Stream Socket Closed. Reconnecting...");
      isStreamConnected = false;
      sseHttp.end();
    }
  }
}

void sendSensorData()
{
  WiFiClientSecure postClient;
  postClient.setInsecure();
  postClient.setBufferSizes(512, 512); // Reduce memory footprint

  HTTPClient http;
  String postUrl = baseUrl + "/setData"; // Your POST route

  if (http.begin(postClient, postUrl))
  {
    http.addHeader("Content-Type", "application/json");

    JSONVar payload;
    payload["apiKey"] = apiKey;
    payload["deviceCode"] = deviceCode;
    payload["purpose"] = "FEED";
    payload["feedName"] = "wemos_status";

    JSONVar data;
    data["value"] = random(0, 1024); // Example analog value
    payload["data"] = data;

    Serial.println("Sending POST update...");
    int httpResponseCode = http.POST(JSON.stringify(payload));

    if (httpResponseCode > 0)
    {
      Serial.printf("POST Success: %d\n", httpResponseCode);
    }
    else
    {
      Serial.printf("POST Error: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  }
}

void processHardwareCommands(JSONVar data)
{
  JSONVar keys = data.keys();
  for (int i = 0; i < keys.length(); i++)
  {
    if (data[keys[i]].hasOwnProperty("GPIO"))
    {
      int pin = (int)data[keys[i]]["GPIO"];
      int value = (int)data[keys[i]]["value"];
      pinMode(pin, OUTPUT);
      digitalWrite(pin, value);
      Serial.printf("GPIO %d -> %d\n", pin, value);
    }
  }
}

`;




export { esp32Imports, esp8266Imports, esp32Code, esp8266Code };