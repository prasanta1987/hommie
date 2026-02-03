const ESP8266SafeGPIOs = [
    0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16
];

const ESP32SafeGPIOs = [
    0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 23, 25, 26, 27, 32, 33, 34, 35, 36, 39
];

const boardName={
    ESP8266: "ESP8266",
    ESP32: "ESP32"
};
export { ESP8266SafeGPIOs, ESP32SafeGPIOs, boardName };