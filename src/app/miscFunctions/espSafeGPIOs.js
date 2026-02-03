const ESP8266SafeGPIOs = [
    { name: "D5", value: 5 },
];

const ESP32SafeGPIOs = [
    { name: "GPIO 2", value: 2 },
];

const boardName = {
    ESP8266: "ESP8266",
    ESP32: "ESP32"
};

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