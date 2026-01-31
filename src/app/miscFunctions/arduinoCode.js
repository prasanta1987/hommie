const esp32Imports=`
#include <WiFi.h>
#include <HTTPClient.h>

`
const esp8266Imports=`
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
`;

const esp32Code = `

void setup(void) {

}


void loop() {

}

`;

const esp8266Code = `

void setup(void) {

}


void loop() {

}
`;




export { esp32Imports, esp8266Imports, esp32Code, esp8266Code };