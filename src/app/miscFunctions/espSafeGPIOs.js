const ESP8266SafeGPIOs = [
    { name: "D1", value: 5 },
    { name: "D2", value: 4 },
    { name: "D5", value: 14 },
    { name: "D6", value: 12 },
    { name: "D7", value: 13 },
];

const ESP32SafeGPIOs = [
    { name: "GPIO 2", value: 2 },
    { name: "GPIO 4", value: 4 },
    { name: "GPIO 5", value: 5 },
    { name: "GPIO 13", value: 13 },
    { name: "GPIO 14", value: 14 },
    { name: "GPIO 15", value: 15 },
    { name: "GPIO 16", value: 16 },
    { name: "GPIO 17", value: 17 },
    { name: "GPIO 18", value: 18 },
    { name: "GPIO 19", value: 19 },
    { name: "GPIO 21", value: 21 },
    { name: "GPIO 22", value: 22 },
    { name: "GPIO 23", value: 23 },
    { name: "GPIO 25", value: 25 },
    { name: "GPIO 26", value: 26 },
    { name: "GPIO 27", value: 27 },
    { name: "GPIO 32", value: 32 },
    { name: "GPIO 33", value: 33 },
];

const mcuTypes = {
    ESP8266: {
        name: "ESP8266",
        safeGPIOs: ESP8266SafeGPIOs
    },
    ESP32: {
        name: "ESP32",
        safeGPIOs: ESP32SafeGPIOs
    }
};


export { mcuTypes };