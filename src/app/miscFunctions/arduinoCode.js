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

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <WiFiUdp.h>
#include <Preferences.h>

#include <ArduinoOTA.h>
#include <Arduino_JSON.h>
#include <TelnetStream.h>

// Built-in LED D0(GPIO16) or D4(GPIO2)
#define LED_PIN D4

const char *mySSID = "PK_NEO";
const char *myPASSWORD = "cxa1619bs";

std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);

Preferences preferences;

String FB_Email = "abc@xyz.com";
String FB_Password = "123456";
String deviceName = "NodeMCU";
String host = "https://hommily.vercel.app/api/";

String uid, authCode, devCode, httpRes;

JSONVar httpResponse;

void initDevice();
String genRandString(int digit);
void sendData(String FEED, String VALUE);
void httpRequest(String reqMethode, String PATH, String data);
void setupWifiOTA();

void setup(void)
{

  Serial.begin(115200);
  setupWifiOTA();

  preferences.begin("IOT", false);
  // preferences.clear();

  uid = preferences.getString("uid", "NONE");
  devCode = preferences.getString("devCode", "NONE");

  initDevice();
  
  Serial.println("Device Setup Completed...");
}

void myTask()
{
  // sendData("Temperature", String(random(10, 50)));
  // sendData("Random", genRandString(4));
}

void loop()
{
  // ===============Only For OTA===============
  ArduinoOTA.handle();
  // ===============Only For OTA===============

  myTask();
}

void initDevice()
{

  Serial.println("UID ==>  " + uid);
  Serial.println("DevCode ==>  " + devCode);

  if (uid == "NONE")
  {
    JSONVar data;
    data["email"] = FB_Email;
    data["password"] = FB_Password;

    Serial.println(data);
    httpRequest("POST", "sign-in", JSON.stringify(data));

    uid = String(httpResponse["uid"]);
    Serial.println(uid);

    if (uid == "NONE")
    {
      Serial.println("Wrong Credential");
      while (true)
      {
        digitalWrite(LED_PIN, !digitalRead(LED_PIN));
        delay(500);
      }
    }
    else
    {
      Serial.println("Sign in Successfull");

      devCode = genRandString(8);

      JSONVar devCreate;
      devCreate["uid"] = uid;
      devCreate["purpose"] = "deviceAuth";
      devCreate["data"]["deviceCode"] = devCode;
      devCreate["data"]["deviceName"] = deviceName;

      httpRequest("POST", "setData", JSON.stringify(devCreate));

      if (String(httpResponse["msg"]) != "Addition Request Sent")
      {
        Serial.println("Device Restarting");
        delay(2000);
        ESP.restart();
      }
    }

    JSONVar devGet;
    devGet["uid"] = uid;
    devGet["purpose"] = "getAuth";
    devGet["deviceCode"] = devCode;

    while (true)
    {

      httpRequest("POST", "getData", JSON.stringify(devGet));
      Serial.println("Waiting for Approval from Web Portal");
      if (bool(httpResponse["allowedStat"]) == true)
      {
        preferences.putString("uid", uid);
        preferences.putString("devCode", devCode);
        Serial.println("DeviceConfigured");

        break;
      }
      delay(1000);
    }
  }
  else
  {
    Serial.println(uid);
    Serial.println(devCode);
  }
}

void httpRequest(String reqMethode, String PATH, String data)
{

  HTTPClient http;

  if (client)
  {
    client->setInsecure();
    HTTPClient https;

    if (https.begin(*client, host + PATH))
    {

      int httpCode;

      if (reqMethode == "POST")
      {
        https.addHeader("Content-Type", "application/json");
        httpCode = https.POST(data);
      }
      else if (reqMethode == "PATCH")
      {
        https.addHeader("Content-Type", "application/json");
        httpCode = https.PATCH(data);
      }
      else
      {
        httpCode = https.GET();
      }

      if (httpCode > 0)
      {
        String httpRes = https.getString();
        httpResponse = JSON.parse(httpRes);

        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY)
        {
          Serial.print("==>  ");
          Serial.println(httpRes);
        }
        else if (httpCode == HTTP_CODE_UNAUTHORIZED)
        {
          Serial.println(httpRes);
        }
        else
        {
          Serial.println(httpRes);
        }
      }
      else
      {
        Serial.println("HTTP ERROR");
        httpRes = "HTTP_ERROR";
      }
      https.end();
    }
  }
}
void sendData(String FEED, String VALUE)
{

  JSONVar data;

  data["uid"] = uid;
  data["path"] = devCode + "/devFeeds";
  data["data"][FEED] = VALUE;

  Serial.println(data);

  // httpRequest(String httpMethod, String URL, JSONVar data)
  httpRequest("POST", "setArduinoData", JSON.stringify(data));
}

String genRandString(int digit)
{

  String rndString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  String rndGenString;

  for (int i = 0; i < digit; i++)
  {
    rndGenString += rndString.charAt(random(rndString.length()));
  }

  return rndGenString;
}

void setupWifiOTA()
{

  WiFi.begin(mySSID, myPASSWORD);

  while (WiFi.waitForConnectResult() != WL_CONNECTED)
  {
    Serial.println("Connection Failed! Rebooting...");
    delay(10000);
    ESP.restart();
    // WiFi.softAP("NODE_MCU", "1234567890");
    // break;
  }

  ArduinoOTA.setHostname("PK_NODE_MCU");
  // ArduinoOTA.setPassword("cxa1619bs");

  ArduinoOTA.onStart([]()
                     {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH) {
      type = "sketch";
    } else {  // U_FS
      type = "filesystem";
    }

    // NOTE: if updating FS this would be the place to unmount FS using FS.end()
    Serial.println("Start updating " + type); });
  ArduinoOTA.onEnd([]()
                   { Serial.println("\nEnd"); });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total)
                        { Serial.printf("Progress: %u%%\r", (progress / (total / 100))); });
  ArduinoOTA.onError([](ota_error_t error)
                     {
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
    } });
  ArduinoOTA.begin();
  TelnetStream.begin();
  Serial.println("Ready");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}
`;
const esp8266Code = `

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <WiFiUdp.h>
#include <Preferences.h>

#include <ArduinoOTA.h>
#include <Arduino_JSON.h>
#include <TelnetStream.h>

// Built-in LED D0(GPIO16) or D4(GPIO2)
#define SUCCESS_LED_PIN D0
#define ERROR_LED_PIN D4

const char *mySSID = "";
const char *myPASSWORD = "";

std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);

Preferences preferences;

String FB_Email = "abcd@xyz.com";
String FB_Password = "123456";

String host = "https://hommily.vercel.app/api/";

String uid, authCode, devCode, devName;
int httpResCode;

JSONVar httpResponse;

void initDevice();
String genRandString(int digit);
void sendData(String FEED, String VALUE);
void httpRequest(String reqMethode, String PATH, String data);
void setupWifiOTA();
void getAuthFromPortal();
void signInDevice();
void deviceAuth();
void setDeviceProfile();
void delDeviceProfile();
void receivingTask();
void getDeviceData();
void handleDeviceProps();

void setup(void) {

  pinMode(SUCCESS_LED_PIN, OUTPUT);
  pinMode(ERROR_LED_PIN, OUTPUT);

  digitalWrite(SUCCESS_LED_PIN, HIGH);
  digitalWrite(ERROR_LED_PIN, HIGH);

  Serial.begin(115200);
  setupWifiOTA();

  preferences.begin("IOT", false);

  uid = preferences.getString("uid", "NONE");
  devCode = preferences.getString("devCode", "NONE");
  devName = preferences.getString("devName", "ESP_Device");

  initDevice();

  Serial.println("Device Setup Completed...");
}

void sendingTask() {
  sendData("Temperature", String(random(0, 1000)));
}

void receivingTask() {
}

void loop() {
  // ===============Only For OTA===============
  ArduinoOTA.handle();
  // ===============Only For OTA===============

  // getDeviceData(); //Skip if Device is Not Required Frequently.
  sendingTask();  // Also gets device data from DB just like getDeviceData()
}

void handleDeviceProps() {
  if (bool(httpResponse["isDeleted"])) {
    Serial.println("Deleted Requested...");
    delDeviceProfile();
    preferences.clear();
    ESP.restart();
  }

  if (String(httpResponse["deviceName"]) != devName) {
    preferences.putString("devName", String(httpResponse["deviceName"]));
  }

  receivingTask();
}

void getDeviceData() {
  JSONVar devData;
  devData["uid"] = uid;
  devData["purpose"] = "getDevices";
  devData["deviceCode"] = devCode;

  httpRequest("POST", "getData", JSON.stringify(devData));

  handleDeviceProps();
}

void deviceAuth() {
  devCode = preferences.getString("devCode", "NONE");

  while (true) {
    JSONVar devCreate;
    devCreate["uid"] = uid;
    devCreate["purpose"] = "deviceAuth";
    devCreate["data"]["deviceCode"] = devCode;
    devCreate["data"]["deviceName"] = devName;

    httpRequest("POST", "setData", JSON.stringify(devCreate));

    if (httpResCode == 200) {
      break;
    }
  }
}

void getAuthFromPortal() {

  JSONVar devGet;
  devGet["uid"] = uid;
  devGet["purpose"] = "getAuth";
  devGet["deviceCode"] = devCode;

  while (true) {
    httpRequest("POST", "getData", JSON.stringify(devGet));
    Serial.println("Waiting for Approval from Web Portal");
    if (bool(httpResponse["allowedStat"]) == true) {

      preferences.putString("uid", uid);
      preferences.putString("devCode", devCode);
      preferences.putString("devName", String(httpResponse["deviceName"]));

      Serial.println("DeviceConfigured");

      break;
    }
    delay(1000);
  }
}

void setDeviceProfile() {

  while (true) {

    JSONVar devCreate;
    devCreate["uid"] = uid;
    devCreate["purpose"] = "setDeviceProfile";
    devCreate["data"]["deviceCode"] = devCode;
    devCreate["data"]["deviceName"] = preferences.getString("devName", "ESP_Device");

    httpRequest("POST", "setData", JSON.stringify(devCreate));

    if (httpResCode == 200) {
      break;
    }
  }
}

void delDeviceProfile() {

  while (true) {
    JSONVar devDel;
    devDel["uid"] = uid;
    devDel["purpose"] = "delDeviceProfile";
    devDel["data"]["deviceCode"] = devCode;

    httpRequest("POST", "setData", JSON.stringify(devDel));

    if (httpResCode == 200) {
      break;
    }
  }
}

void signInDevice() {

  JSONVar data;
  data["email"] = FB_Email;
  data["password"] = FB_Password;

  // Serial.println(data);
  httpRequest("POST", "sign-in", JSON.stringify(data));

  uid = String(httpResponse["uid"]);

  if (httpResCode != 200) {
    Serial.println("Wrong Credential");
    while (true) {
      digitalWrite(ERROR_LED_PIN, !digitalRead(ERROR_LED_PIN));
      delay(200);
    }
  } else {
    Serial.println("Sign in Successfull");
    preferences.putString("devCode", genRandString(8));
  }
}

void initDevice() {

  if (uid == "NONE") {
    signInDevice();
    deviceAuth();
    getAuthFromPortal();
  }

  setDeviceProfile();
}

void httpRequest(String reqMethode, String PATH, String data) {

  String httpRes;

  HTTPClient http;

  if (client) {
    client->setInsecure();
    HTTPClient https;

    if (https.begin(*client, host + PATH)) {

      if (reqMethode == "POST") {
        https.addHeader("Content-Type", "application/json");
        httpResCode = https.POST(data);
      } else if (reqMethode == "PATCH") {
        https.addHeader("Content-Type", "application/json");
        httpResCode = https.PATCH(data);
      } else {
        httpResCode = https.GET();
      }

      if (httpResCode > 0) {
        httpRes = https.getString();
        httpResponse = JSON.parse(httpRes);

        if (httpResCode == HTTP_CODE_OK || httpResCode == HTTP_CODE_MOVED_PERMANENTLY) {
          Serial.print("==>  ");
          Serial.println(httpRes);
        } else if (httpResCode == HTTP_CODE_UNAUTHORIZED) {
          Serial.println(httpRes);
        } else if (httpResCode == HTTP_CODE_INTERNAL_SERVER_ERROR) {
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

void sendData(String FEED, String VALUE) {

  JSONVar data;

  data["uid"] = uid;
  data["purpose"] = "FEED";
  data["deviceCode"] = devCode;
  data["feedName"] = FEED;
  data["data"]["value"] = VALUE;

  httpRequest("POST", "setData", JSON.stringify(data));

  handleDeviceProps();
}

String genRandString(int digit) {

  String rndString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  String rndGenString;

  for (int i = 0; i < digit; i++) {
    rndGenString += rndString.charAt(random(rndString.length()));
  }

  return rndGenString;
}

void setupWifiOTA() {

  WiFi.begin(mySSID, myPASSWORD);

  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    Serial.println("Connection Failed! Rebooting...");
    delay(10000);
    ESP.restart();
    // WiFi.softAP("NODE_MCU", "1234567890");
    // break;
  }

  ArduinoOTA.setHostname("PK_NODE_MCU");
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
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.println("Progress");
    Serial.print(progress / (total / 100)));
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

`;


const commonCode = `

`






export { esp32Imports, esp32Code, esp8266Imports, esp8266Code };