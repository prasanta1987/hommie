const esp32Imports = `
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <Arduino_JSON.h>   //https://github.com/arduino-libraries/Arduino_JSON
#include <Preferences.h>    //https://github.com/vshymanskyy/Preferences
`
const esp8266Imports = `
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <WiFiUdp.h>
#include <Preferences.h>    //https://github.com/vshymanskyy/Preferences
#include <NTPClient.h>
#include <ArduinoOTA.h>
#include <Arduino_JSON.h>   //https://github.com/arduino-libraries/Arduino_JSON
#include <TelnetStream.h>
`

const esp32Code = `

// Add your WiFi credentials
char ssid[] = "YOUR_SSID";
char pass[] = "YOUR_PASSWORD";

// WiFiClientSecure client for ESP32 Boards;
WiFiClientSecure *client = new WiFiClientSecure;

void setup() {

    Serial.begin(115200);  //If Required for Debuging
    preferences.begin("IOT", false);

};
    
void loop(){
    // Void Loop Section
};

`;




const esp8266Code = `

// Add your WiFi credentials
const char* mySSID = "";
const char* myPASSWORD = "";

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);

Preferences preferences;

//Built-in LED D0(GPIO16) or D4(GPIO2)
#define LED_PIN D4

std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);

String authCode, deviceName, devCode, httpRes;

void setup() {
  Serial.begin(115200);
  setupWifiOTA();

  preferences.begin("device", false);
  timeClient.begin();

  setUpDevice();
};

void myTask() {
  sendData("Temperature", String(random(10, 50)));
  sendData("Random", genRandString(4));
}



void loop() {
  timeClient.update();
  // ===============Only For OTA===============
  ArduinoOTA.handle();
  // ===============Only For OTA===============

  refreshData();
  myTask();
}

void refreshData() {

  sendRequest("GET", host + "/" + uid + "/" + devCode + ".json?auth=" + authCode, "");

  String webDevName = String(JSON.parse(httpRes)["name"]);

  if (webDevName != deviceName) {
    preferences.putString("devName", webDevName);
  };

  if (JSON.parse(httpRes)["isDeleted"]) {
    sendRequest("PATCH", host + "/" + uid + "/" + devCode + ".json?auth=" + authCode, "null");
    preferences.clear();
    ESP.restart();
  }
}


void setUpDevice() {
  authCode = preferences.getString("auth", "NONE");
  deviceName = preferences.getString("devName", "NONE");
  devCode = preferences.getString("devCode", "NONE");

  if (authCode == "NONE") {

    devCode = genRandString(8);

    JSONVar devObj;

    devObj[devCode]["uid"] = uid;
    devObj[devCode]["deviceCode"] = devCode;
    devObj[devCode]["deviceName"] = "Node MCU";

    sendRequest("PATCH", host + "/device.json", JSON.stringify(devObj));

    while (true) {

      sendRequest("GET", host + "/device/" + devCode + ".json", "");

      authCode = String(JSON.parse(httpRes)["authCode"]);
      deviceName = String(JSON.parse(httpRes)["deviceName"]);


      if (authCode == "") {
        Serial.println("Add Device on Portal");
      } else {
        Serial.println(authCode);
        Serial.println(deviceName);
        preferences.putString("devName", deviceName);
        preferences.putString("auth", authCode);
        preferences.putString("devCode", devCode);

        sendRequest("PATCH", host + "/device/" + devCode + ".json", "null");
        displayConfig();
        break;
      }
    }
  } else {
    displayConfig();
  }

  deviceConfig();
}


void deviceConfig() {

  JSONVar devObj;

  devObj["deviceCode"] = devCode;
  devObj["name"] = deviceName;

  String pathName = host + "/" + uid + "/" + devCode + ".json?auth=" + authCode;

  sendRequest("PATCH", pathName, JSON.stringify(devObj));
}


void sendData(String feedName, String feedValue) {

  JSONVar data;

  data["value"] = feedValue;
  data["time"] = String(timeClient.getEpochTime());
  String pathName = host + "/" + uid + "/" + devCode + "/" + "devFeeds/" + feedName + ".json?auth=" + authCode;

  sendRequest("PATCH", pathName, JSON.stringify(data));
}

void displayConfig() {

  authCode = preferences.getString("auth", "NONE");
  deviceName = preferences.getString("devName", "NONE");


  Serial.print("UID ==>   ");
  Serial.println(uid);
  Serial.print("Auth Code ==>   ");
  Serial.println(authCode);
  Serial.print("Device Name ==>   ");
  Serial.println(deviceName);
  Serial.print("Device Code ==>   ");
  Serial.println(devCode);
}


void setupWifiOTA() {

  WiFi.begin(mySSID, myPASSWORD);

  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    Serial.println("Connection Failed! Rebooting...");
    delay(10000);
    ESP.restart();
  }

  ArduinoOTA.setHostname("NODE_MCU");
  // ArduinoOTA.setPassword("cxa1619bs");

  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH) {
      type = "sketch";
    } else {  // U_FS
      type = "filesystem";
    }

    // NOTE: if updating FS this would be the place to unmount FS using FS.end()
    Serial.println("Start updating " + type);
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("End");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) {
      Serial.println("Auth Failed");
    } else if (error == OTA_BEGIN_ERROR) {
      Serial.println("Begin Failed");
    } else if (error == OTA_CONNECT_ERROR) {
      Serial.println("Connect Failed");
    } else if (error == OTA_RECEIVE_ERROR) {
      Serial.println("Receive Failed");
    } else if (error == OTA_END_ERROR) {
      Serial.println("End Failed");
    }
  });
  ArduinoOTA.begin();
  TelnetStream.begin();
  Serial.println("Ready");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void sendRequest(String reqMethode, String PATH, String data) {

  HTTPClient http;

  if (client) {
    client->setInsecure();
    HTTPClient https;

    if (https.begin(*client, PATH)) {

      int httpCode;

      if (reqMethode == "POST") {
        https.addHeader("Content-Type", "application/json");
        httpCode = https.POST(data);
      } else if (reqMethode == "PATCH") {
        https.addHeader("Content-Type", "application/json");
        httpCode = https.PATCH(data);
      } else {
        httpCode = https.GET();
      }

      if (httpCode > 0) {
        httpRes = https.getString();

        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
          Serial.print("==>  ");
          Serial.println(httpRes);
        } else if (httpCode == HTTP_CODE_UNAUTHORIZED) {
          Serial.println(httpRes);
        } else {
          Serial.println(httpRes);
        }
      } else {
        Serial.println("HTTP ERROR");
        httpRes = "HTTP_ERROR";
      }
      https.end();
    }
  }
}

String genRandString(int digit) {

  String rndString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  String rndGenString;

  for (int i = 0; i < digit; i++) {
    rndGenString += rndString.charAt(random(rndString.length()));
  }

  return rndGenString;
}
`;


const commonCode = `

`






export { esp32Imports, esp32Code, esp8266Imports, esp8266Code };