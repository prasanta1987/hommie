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
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <WiFiUdp.h>
#include <Preferences.h>

#include <ArduinoOTA.h>
#include <Arduino_JSON.h>
#include <TelnetStream.h>

const char* mySSID = "PK_NEO";
const char* myPASSWORD = "cxa1619bs";

Preferences preferences;

String FB_Email = "abc@xyz.com";
String FB_Password = "123456";
String deviceName = "NodeMCU";

//Built-in LED D0(GPIO16) or D4(GPIO2)
#define LED_PIN D4

String authCode, devCode, httpRes;

class HttpReq {

private:

  String host = "https://hommily.vercel.app/api/";
  JSONVar httpResponse;


  String uid = preferences.getString("uid", "NONE");
  String devCode = preferences.getString("devCode", "NONE");


  void httpRequest(String reqMethode, String PATH, String data) {

    std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
    HTTPClient http;

    if (client) {
      client->setInsecure();
      HTTPClient https;

      if (https.begin(*client, this->host + PATH)) {

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
          String httpRes = https.getString();
          this->httpResponse = JSON.parse(httpRes);

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


public:

  void initDevice() {
    Serial.printf("UID: %s", this->uid);

    if (this->uid == "NONE") {
      JSONVar data;
      data["email"] = FB_Email;
      data["password"] = FB_Password;

      Serial.println(data);
      this->httpRequest("POST", "arduinoSignIn", JSON.stringify(data));

      this->uid = String(this->httpResponse["uid"]);
      Serial.print(this->uid);
      Serial.println();

      if (this->uid == "NONE") {
        Serial.println("Wrong Credential");
        while (true) {
          digitalWrite(LED_PIN, !digitalRead(LED_PIN));
          delay(500);
        }
      } else {
        Serial.println("Sign in Successfull");

        this->devCode = this->genRandString(8);
        preferences.putString("uid", this->uid);
        preferences.putString("devCode", this->devCode);


        JSONVar devCreate;
        devCreate["uid"] = this->uid;
        devCreate["path"] = this->devCode;
        devCreate["data"]["name"] = deviceName;
        devCreate["data"]["deviceCode"] = this->devCode;

        this->httpRequest("POST", "setArduinoData", JSON.stringify(devCreate));
      }
    }
  }



  void sendData(String FEED, String VALUE) {

    JSONVar data;


    data["uid"] = this->uid;
    data["path"] = this->devCode + "/devFeeds/" + FEED;
    data["data"]["value"] = VALUE;

    Serial.println(data);

    // httpRequest(String httpMethod, String URL, JSONVar data)
    this->httpRequest("POST", "setArduinoData", JSON.stringify(data));
  }

  String genRandString(int digit) {

    String rndString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    String rndGenString;

    for (int i = 0; i < digit; i++) {
      rndGenString += rndString.charAt(random(rndString.length()));
    }

    return rndGenString;
  }
};

HttpReq EQ;

void setup(void) {

  Serial.begin(115200);
  setupWifiOTA();

  preferences.begin("device", false);
  preferences.clear();
  EQ.initDevice();
}


void myTask() {
  // sendData("Temperature", String(random(10, 50)));
  // sendData("Random", genRandString(4));
}



void loop() {
  // ===============Only For OTA===============
  ArduinoOTA.handle();
  // ===============Only For OTA===============

  myTask();
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
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
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