export const PRODUCT_GUIDES = {
  'CC-DEV-ESP32': {
    youtubeUrl: 'https://www.youtube.com/watch?v=k_D_Qu0cgu8',
    researchUrl: 'https://ieeexplore.ieee.org/document/8703358',
    datasheetUrl: 'https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf',
    documentationUrl: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/',
    howToUse: {
      overview: 'Connect the ESP32 to your PC using a micro-USB cable with data lines. The board features dual-core processing, built-in 2.4GHz Wi-Fi, and Bluetooth BLE.',
      steps: [
        '1. Hardware Connection: Plug micro-USB into ESP32 and PC USB port. Ensure CP2102/CH340 driver is installed.',
        '2. IDE Setup: Open Arduino IDE -> Preferences -> Add Espressif Board URL (https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json).',
        '3. Board Selection: Select "DOIT ESP32 DEVKIT V1" and select the detected COM / Serial Port.',
        '4. Code Upload: Paste the Wi-Fi scan or web server sketch. Press the "BOOT" button on the board if upload hangs at "Connecting......".'
      ],
      pinoutSummary: 'VIN/5V (Power input), 3V3 (3.3V LDO output, max 500mA), GND (Ground), GPIO 21 (I2C SDA), GPIO 22 (I2C SCL), GPIO 1 (TX), GPIO 3 (RX). Note: ADC2 pins cannot be used when Wi-Fi is active.',
      sampleCode: `#include <WiFi.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nConnected! IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Your IoT logic here
}`
    },
    whereToUse: [
      {
        title: 'Smart Home Automation & Relay Control',
        description: 'Host a local web server or connect to MQTT / Blynk cloud to remotely trigger 220V appliances, fans, and ambient lighting from your phone.',
        category: 'IoT & Smart Home'
      },
      {
        title: 'Cloud Environmental Telemetry Station',
        description: 'Read multi-sensor telemetry (DHT11, MQ-2, BME280) and publish live data streams to AWS IoT Core, ThingSpeak, or Firebase Realtime Database.',
        category: 'Environmental Monitoring'
      },
      {
        title: 'BLE Beacon & Proximity Attendance Tracker',
        description: 'Broadcast or scan for student Bluetooth BLE tags to automatically record room presence and lab entry in college buildings.',
        category: 'Campus Security & Automation'
      }
    ],
    safetyPrecautions: [
      'GPIO pins operate strictly at 3.3V logic level. Connecting 5V signals directly to GPIOs can permanently damage the silicon die.',
      'Always power via either USB or 5V VIN pin, never both simultaneously with different voltage levels.'
    ]
  },

  'CC-DEV-UNO3': {
    youtubeUrl: 'https://www.youtube.com/watch?v=d8_xXNcGYgo',
    researchUrl: 'https://www.researchgate.net/publication/341999805_Arduino_Based_Automated_System_Design_and_Implementation',
    datasheetUrl: 'https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf',
    documentationUrl: 'https://docs.arduino.cc/hardware/uno-rev3/',
    howToUse: {
      overview: 'The industry-standard teaching microcontroller board. Features 5V logic tolerance, built-in polyfuse protection, and 14 digital I/O pins.',
      steps: [
        '1. Connect Uno to computer via standard USB Type-B cable.',
        '2. In Arduino IDE, go to Tools -> Board -> "Arduino Uno".',
        '3. Select the correct Port under Tools -> Port.',
        '4. Go to File -> Examples -> 01.Basics -> Blink and click "Upload". The onboard L LED (pin 13) will start blinking at 1Hz.'
      ],
      pinoutSummary: '5V (Regulated 5V out), 3.3V (50mA out), GND, Vin (7-12V external input), Digital Pins 0-13 (D3, D5, D6, D9, D10, D11 support 8-bit PWM), Analog Pins A0-A5 (10-bit ADC).',
      sampleCode: `const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  delay(1000);
}`
    },
    whereToUse: [
      {
        title: 'Engineering Lab Experiments & Sensor Interfacing',
        description: 'Ideal for understanding fundamentals of ADC, DAC, interrupts, PWM motor control, and UART/SPI/I2C communication protocols.',
        category: 'Academics & Labs'
      },
      {
        title: 'Autonomous Mobile Robotics',
        description: 'Drive dual DC motors using an L298N driver and navigate tracks using ultrasonic sensors or infrared line follower arrays.',
        category: 'Robotics'
      },
      {
        title: 'Industrial Process Automation Prototypes',
        description: 'Read analog pressure, strain gauge, and temperature transmitters, switching high-current contactor coils safely.',
        category: 'Automation'
      }
    ],
    safetyPrecautions: [
      'Maximum current per I/O pin is 40mA (20mA recommended). Exceeding this will destroy the ATmega328P pin output buffer.',
      'Never short 5V directly to GND.'
    ]
  },

  'CC-DEV-RPT4-4GB': {
    youtubeUrl: 'https://www.youtube.com/watch?v=BpJCAafw2qE',
    researchUrl: 'https://ieeexplore.ieee.org/document/9210214',
    datasheetUrl: 'https://datasheets.raspberrypi.com/rpi4/raspberry-pi-4-datasheet.pdf',
    documentationUrl: 'https://www.raspberrypi.com/documentation/computers/raspberry-pi.html',
    howToUse: {
      overview: 'Full 64-bit quad-core Linux mini computer capable of dual 4K video output, computer vision inference, and ROS (Robot Operating System).',
      steps: [
        '1. Download and run "Raspberry Pi Imager" on your PC. Select Raspberry Pi OS (64-bit) and flash onto a high-speed Class 10 MicroSD card (32GB+).',
        '2. Configure Wi-Fi credentials and SSH user login in the Imager settings gear icon before writing.',
        '3. Insert MicroSD card into the slot underneath the Pi.',
        '4. Power the board using a dedicated 5V 3A USB Type-C supply. Connect to HDMI display or SSH directly from terminal: \`ssh pi@raspberrypi.local\`.'
      ],
      pinoutSummary: '40-pin GPIO header: Pin 1 (3.3V), Pin 2/4 (5V), Pin 6/9/14/20/25/30/34/39 (GND), Pin 3 (SDA/GPIO 2), Pin 5 (SCL/GPIO 3), Pin 8 (TXD/GPIO 14), Pin 10 (RXD/GPIO 15). All GPIO pins are 3.3V logic!',
      sampleCode: `import RPi.GPIO as GPIO
import time

LED_PIN = 18
GPIO.setmode(GPIO.BCM)
GPIO.setup(LED_PIN, GPIO.OUT)

try:
    while True:
        GPIO.output(LED_PIN, GPIO.HIGH)
        time.sleep(1)
        GPIO.output(LED_PIN, GPIO.LOW)
        time.sleep(1)
except KeyboardInterrupt:
    GPIO.cleanup()`
    },
    whereToUse: [
      {
        title: 'Edge AI & Computer Vision with OpenCV',
        description: 'Deploy MobileNet / YOLO models with a USB webcam or Pi Camera to recognize faces, vehicle license plates, and defects in real-time.',
        category: 'Artificial Intelligence'
      },
      {
        title: 'Autonomous Robot Brain (ROS 2 / Navigation)',
        description: 'Process LiDAR point clouds, execute SLAM mapping algorithms, and send motor velocity commands to low-level motor controllers.',
        category: 'Advanced Robotics'
      },
      {
        title: 'Local Network Home Server / Docker Host',
        description: 'Host Home Assistant, Pi-hole network ad-blocker, Nextcloud private storage, and MQTT brokers running 24/7 silently.',
        category: 'Networking & Servers'
      }
    ],
    safetyPrecautions: [
      'GPIO pins are NOT 5V tolerant. Connecting a 5V signal directly will destroy the Broadcom SoC.',
      'Use a quality 5V 3.0A power supply; undervoltage can cause SD card filesystem corruption.'
    ]
  },

  'CC-DEV-PICO2040': {
    youtubeUrl: 'https://www.youtube.com/watch?v=mD_g2_T2O1c',
    researchUrl: 'https://ieeexplore.ieee.org/document/9623821',
    datasheetUrl: 'https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf',
    documentationUrl: 'https://www.raspberrypi.com/documentation/microcontrollers/raspberry-pi-pico.html',
    howToUse: {
      overview: 'Raspberry Pi RP2040 dual ARM Cortex-M0+ chip with unique Programmable I/O (PIO) blocks, ideal for MicroPython and high-speed embedded logic.',
      steps: [
        '1. Hold down the "BOOTSEL" button on the Pico board while plugging it into your computer USB port.',
        '2. A mass storage drive named "RPI-RP2" will appear on your desktop.',
        '3. Download the latest MicroPython UF2 firmware and drag-and-drop it into the RPI-RP2 drive. The Pico will reboot automatically.',
        '4. Open Thonny IDE, set interpreter to "MicroPython (Raspberry Pi Pico)", and start writing Python interactively!'
      ],
      pinoutSummary: 'Pin 40 (VBUS 5V from USB), Pin 39 (VSYS), Pin 36 (3V3 Out), Pin 38/33/28/23/18/13/8/3 (GND), 26 multi-function 3.3V GPIOs including 3 ADC channels (GP26, GP27, GP28).',
      sampleCode: `from machine import Pin
import time

led = Pin(25, Pin.OUT)  # Onboard LED

while True:
    led.toggle()
    time.sleep(0.5)`
    },
    whereToUse: [
      {
        title: 'MicroPython Embedded Prototyping',
        description: 'Quickly build sensor loggers, USB HID custom macro keyboards, and MIDI audio controllers in clear, high-level Python syntax.',
        category: 'Python Prototyping'
      },
      {
        title: 'High-Speed Custom Protocols with PIO',
        description: 'Emulate VGA display output, WS2812B NeoPixel drivers, and DMX lighting protocols without consuming main CPU clock cycles.',
        category: 'Signal Processing'
      },
      {
        title: 'TinyML Machine Learning Inference',
        description: 'Run lightweight TensorFlow Lite for Microcontrollers models to classify gestures or detect anomalous acoustic vibrations.',
        category: 'Edge Machine Learning'
      }
    ],
    safetyPrecautions: [
      'Pico GPIOs are 3.3V logic. Do not connect 5V logic sensor outputs directly.',
      'Ensure proper decoupling capacitors if powering via external DC-DC converter.'
    ]
  },

  'CC-DEV-ESP8266': {
    youtubeUrl: 'https://www.youtube.com/watch?v=71bX6Yw_f_U',
    researchUrl: 'https://ieeexplore.ieee.org/document/8301777',
    datasheetUrl: 'https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf',
    documentationUrl: 'https://arduino-esp8266.readthedocs.io/en/latest/',
    howToUse: {
      overview: 'Ultra low-cost Wi-Fi IoT microcontroller board (NodeMCU v3 / CP2102) with integrated TCP/IP stack.',
      steps: [
        '1. Connect NodeMCU to PC via micro-USB cable.',
        '2. Add ESP8266 board manager URL in Arduino IDE preferences (http://arduino.esp8266.com/stable/package_esp8266com_index.json).',
        '3. Select Tools -> Board -> "NodeMCU 1.0 (ESP-12E Module)".',
        '4. Set Upload Speed to 115200 and select your USB COM port.'
      ],
      pinoutSummary: 'VIN (5V input), 3V3 (3.3V out), GND, D0-D8 (GPIO pins), A0 (ADC pin, 0-1.0V max range or 0-3.3V with onboard voltage divider).',
      sampleCode: `#include <ESP8266WiFi.h>

void setup() {
  Serial.begin(115200);
  WiFi.begin("SSID", "PASSWORD");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nConnected! IP: " + WiFi.localIP().toString());
}

void loop() {}`
    },
    whereToUse: [
      {
        title: 'Smart Wi-Fi Socket & Appliance Switch',
        description: 'Integrate with Sinric Pro or Alexa Voice to switch lights and appliances remotely via your home Wi-Fi network.',
        category: 'Smart Home'
      },
      {
        title: 'Wireless Temperature & Humidity Beacon',
        description: 'Broadcast ambient room metrics to a central college lab dashboard over MQTT protocol.',
        category: 'Telemetry'
      },
      {
        title: 'Remote Agricultural Soil Alert System',
        description: 'Send SMS or Telegram alerts when farm soil dries below critical threshold.',
        category: 'Smart Agriculture'
      }
    ],
    safetyPrecautions: [
      'NodeMCU onboard ADC A0 only tolerates up to 3.3V max. Never apply unfiltered 5V analog signals.'
    ]
  },

  'CC-SEN-HCSR04': {
    youtubeUrl: 'https://www.youtube.com/watch?v=ZejQOX69K5M',
    researchUrl: 'https://ieeexplore.ieee.org/document/8977660',
    datasheetUrl: 'https://www.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf',
    documentationUrl: 'https://github.com/Martinsos/arduino-lib-hc-sr04',
    howToUse: {
      overview: 'Non-contact ultrasonic distance measuring module providing 2cm to 400cm ranging accuracy with high precision sound wave reflection timing.',
      steps: [
        '1. Connect VCC pin to 5V on Arduino and GND to GND.',
        '2. Connect TRIG pin to digital pin 9 and ECHO pin to digital pin 10.',
        '3. Send a 10-microsecond HIGH pulse on the TRIG pin to trigger ultrasonic bursts.',
        '4. Read the pulse duration on the ECHO pin using pulseIn() and calculate distance: Distance = (Duration * 0.0343) / 2.'
      ],
      pinoutSummary: 'VCC (5V DC power), TRIG (Trigger pulse input), ECHO (Echo pulse output, 5V TTL), GND (Power ground).',
      sampleCode: `const int trigPin = 9;
const int echoPin = 10;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");
  delay(100);
}`
    },
    whereToUse: [
      {
        title: 'Autonomous Obstacle Avoiding Robots',
        description: 'Mounted onto front chassis or micro servos to scan left/right and prevent robots from colliding with walls or obstacles.',
        category: 'Robotics'
      },
      {
        title: 'Touchless Overhead Water Tank Level Meter',
        description: 'Measure fluid level from the top of the water tank without contacting liquid, preventing sensor corrosion.',
        category: 'Fluid Management'
      },
      {
        title: 'Automatic Touchless Sanitizer & Bin Opener',
        description: 'Detect approaching hands or footsteps within 15cm to trigger a servo-driven lid or relay-activated pump.',
        category: 'Smart Devices'
      }
    ],
    safetyPrecautions: [
      'When using with 3.3V microcontrollers (ESP32 / Raspberry Pi), use a resistor voltage divider (1kΩ + 2kΩ) on ECHO pin to reduce 5V to 3.3V.'
    ]
  },

  'CC-SEN-DHT11': {
    youtubeUrl: 'https://www.youtube.com/watch?v=wXWp_hM4jT8',
    researchUrl: 'https://ieeexplore.ieee.org/document/8777519',
    datasheetUrl: 'https://www.mouser.com/datasheet/2/758/DHT11-Technical-Data-Sheet-Translated-Version-1143054.pdf',
    documentationUrl: 'https://github.com/adafruit/DHT-sensor-library',
    howToUse: {
      overview: 'Digital composite sensor with calibrated digital signal output for ambient temperature (0°C to 50°C) and relative humidity (20% to 90% RH).',
      steps: [
        '1. Connect VCC to 3.3V or 5V and GND to GND.',
        '2. Connect DATA pin to any digital GPIO (e.g. Pin 2 on Arduino or GPIO 4 on ESP32).',
        '3. If using bare sensor (without 3-pin breakout board), add a 4.7kΩ - 10kΩ pull-up resistor between VCC and DATA pin.',
        '4. Install "DHT sensor library" by Adafruit via Arduino Library Manager and run the "DHTtester" example.'
      ],
      pinoutSummary: 'Pin 1: VCC (3.3V - 5.5V), Pin 2: DATA (Single-bus bidirectional data), Pin 3: NC (Not connected), Pin 4: GND (Ground).',
      sampleCode: `#include "DHT.h"

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print("%  Temperature: ");
  Serial.print(t);
  Serial.println("°C");
}`
    },
    whereToUse: [
      {
        title: 'College Hostel & Room Comfort Logger',
        description: 'Track room heat index and ventilation quality, automatically turning on ceiling fans or exhaust vents via relay.',
        category: 'Building Automation'
      },
      {
        title: 'Smart Greenhouse Climate Controller',
        description: 'Monitor micro-climate conditions and trigger water misting or heat lamps when parameters stray from crop targets.',
        category: 'Precision Agriculture'
      },
      {
        title: 'IoT Weather Station Dashboard',
        description: 'Display live temperature and humidity metrics on an OLED screen and upload historical hourly logs to cloud servers.',
        category: 'Weather Telemetry'
      }
    ],
    safetyPrecautions: [
      'Do not sample DHT11 faster than once every 1 to 2 seconds, otherwise readings will return stale or corrupted data.'
    ]
  },

  'CC-SEN-PIR501': {
    youtubeUrl: 'https://www.youtube.com/watch?v=6FeXAPqlPio',
    researchUrl: 'https://ieeexplore.ieee.org/document/8663189',
    datasheetUrl: 'https://www.mpja.com/download/31227sc.pdf',
    documentationUrl: 'https://docs.arduino.cc/tutorials/generic/pir-sensor/',
    howToUse: {
      overview: 'Passive Infrared (PIR) motion detector module utilizing pyroelectric sensors and Fresnel lenses to detect body thermal signatures up to 7 meters.',
      steps: [
        '1. Connect VCC to 5V and GND to GND.',
        '2. Connect OUT pin to digital input pin (e.g. Pin 2 on Arduino).',
        '3. Adjust the two onboard potentiometers: left pot adjusts delay time (0.5s to 200s), right pot adjusts sensing distance (3m to 7m).',
        '4. Set the trigger mode jumper: "H" for repeatable re-triggering (recommended for alarms).'
      ],
      pinoutSummary: 'VCC (4.5V - 20V DC), OUT (Digital 3.3V HIGH when motion detected), GND (Ground). Note: OUT is 3.3V logic level, safe for ESP32 and Raspberry Pi!',
      sampleCode: `const int pirPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int motion = digitalRead(pirPin);
  if (motion == HIGH) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Motion detected! Turning ON lights.");
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(200);
}`
    },
    whereToUse: [
      {
        title: 'Automated Energy-Saving Corridor Lighting',
        description: 'Automatically illuminate staircase and hallway lamps when someone walks in, shutting off 60 seconds after motion ceases.',
        category: 'Energy Conservation'
      },
      {
        title: 'Intruder Detection & Campus Security Alarm',
        description: 'Detect unauthorized entry into lab rooms after hours and trigger buzzer sirens or send WhatsApp alert notifications.',
        category: 'Security Systems'
      },
      {
        title: 'Smart Restroom Occupancy Indicator',
        description: 'Detect stall presence and update external LED indicators (Red for Occupied, Green for Vacant).',
        category: 'Facility Management'
      }
    ],
    safetyPrecautions: [
      'Allow 30 to 60 seconds warm-up time after powering on for the pyroelectric sensor element to calibrate against background IR.'
    ]
  },

  'CC-SEN-MQ2': {
    youtubeUrl: 'https://www.youtube.com/watch?v=F3_Jb1a2EaU',
    researchUrl: 'https://ieeexplore.ieee.org/document/8982463',
    datasheetUrl: 'https://www.pololu.com/file/0J309/MQ2.pdf',
    documentationUrl: 'https://github.com/miguel5612/MQSensorsLib',
    howToUse: {
      overview: 'Electrochemical gas and smoke sensor sensitive to LPG, propane, methane, hydrogen, alcohol, and combustion smoke particles.',
      steps: [
        '1. Connect VCC to 5V (requires ~150mA heating element current) and GND to GND.',
        '2. Connect A0 to Arduino Analog Input A0 for proportional gas concentration ppm readings.',
        '3. Connect D0 to digital pin if you only need threshold trigger switching (set threshold with onboard potentiometer).',
        '4. Burn-in note: Sensor surface will feel warm to the touch; this is normal internal heater operation.'
      ],
      pinoutSummary: 'VCC (5V DC), GND, A0 (Analog voltage output 0.1V - 4.5V proportional to gas density), D0 (Digital comparator output).',
      sampleCode: `const int smokePin = A0;
const int threshold = 400;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(smokePin);
  Serial.print("Smoke Level: ");
  Serial.println(sensorValue);

  if (sensorValue > threshold) {
    Serial.println("ALERT! Gas/Smoke leak detected!");
  }
  delay(500);
}`
    },
    whereToUse: [
      {
        title: 'Kitchen LPG Cylinder Leakage Alarm',
        description: 'Detect dangerous gas leaks before explosion limits are reached, auto-closing solenoid valves and sounding buzzers.',
        category: 'Home Safety'
      },
      {
        title: 'Hostel Fire & Smoke Early Warning System',
        description: 'Monitor dorm rooms for smoke buildup and broadcast alerts to campus wardens via Wi-Fi IoT gateways.',
        category: 'Disaster Prevention'
      },
      {
        title: 'Industrial Chemical Leak Monitoring',
        description: 'Continuous sampling of flammable gas vapor concentrations in battery storage and solvent chemical labs.',
        category: 'Industrial Safety'
      }
    ],
    safetyPrecautions: [
      'Do not touch internal ceramic heating mesh while powered. Requires 5V; does not operate reliably on 3.3V rails.'
    ]
  },

  'CC-SEN-MPU6050': {
    youtubeUrl: 'https://www.youtube.com/watch?v=M9lZ5Qy5S2w',
    researchUrl: 'https://ieeexplore.ieee.org/document/9084883',
    datasheetUrl: 'https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet1.pdf',
    documentationUrl: 'https://github.com/ElectronicCats/mpu6050',
    howToUse: {
      overview: '6-Degrees-of-Freedom motion tracking device combining 3-axis gyroscope, 3-axis accelerometer, and Digital Motion Processor (DMP) over I2C.',
      steps: [
        '1. Connect VCC to 3.3V or 5V (board has 3.3V LDO regulator) and GND to GND.',
        '2. Connect SCL to Arduino A5 (or ESP32 GPIO 22) and SDA to Arduino A4 (or ESP32 GPIO 21).',
        '3. In Arduino IDE, install "Adafruit MPU6050" and "Adafruit Sensor" libraries.',
        '4. Run the "basic_readings" example to observe pitch, roll, and yaw angular velocities in real-time serial plotter.'
      ],
      pinoutSummary: 'VCC (3.3V - 5V), GND, SCL (I2C Clock), SDA (I2C Data), XDA/XCL (Auxiliary I2C for external magnetometer), AD0 (I2C address select: LOW = 0x68, HIGH = 0x69), INT (Interrupt).',
      sampleCode: `#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) { delay(10); }
  }
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  Serial.print("Accel X: "); Serial.print(a.acceleration.x);
  Serial.print(" Y: "); Serial.print(a.acceleration.y);
  Serial.print(" Z: "); Serial.println(a.acceleration.z);
  delay(100);
}`
    },
    whereToUse: [
      {
        title: 'Two-Wheeled Self-Balancing Robot',
        description: 'Execute high-speed PID control loop using complementary filter fused pitch angle to continuously keep robot upright.',
        category: 'Control Systems & Robotics'
      },
      {
        title: 'Quadcopter & Drone Flight Controller',
        description: 'Provide low-latency angular rate feedback for ESC motor speed stabilization during hovering and maneuvers.',
        category: 'Aerospace & UAVs'
      },
      {
        title: 'Hand Gesture Controlled Wheelchair & Mouse',
        description: 'Map tilt gestures to wireless mouse movements or wheelchair directional drive motors for assistive tech projects.',
        category: 'Biomedical & Assistive Tech'
      }
    ],
    safetyPrecautions: [
      'Keep I2C wiring under 20cm to avoid bus noise and lockups; place module firmly flat on project chassis.'
    ]
  },

  'CC-SEN-SOILM': {
    youtubeUrl: 'https://www.youtube.com/watch?v=udmJyncDvw0',
    researchUrl: 'https://ieeexplore.ieee.org/document/9253457',
    datasheetUrl: 'https://media.digikey.com/pdf/data%20sheets/dfrobot%20pdfs/sen0193_web.pdf',
    documentationUrl: 'https://github.com/DFRobot/DFRobot_SoilMoistureSensor',
    howToUse: {
      overview: 'Capacitive soil moisture sensor made of corrosion-resistant material. Unlike cheap resistive probes, capacitive sensing does not electrolyze or corrode when embedded in moist soil.',
      steps: [
        '1. Connect VCC to 3.3V or 5V and GND to GND.',
        '2. Connect AOUT to an analog pin (e.g., A0 on Arduino).',
        '3. Calibrate reading in air (dry value ~520-590) and submerged in water (wet value ~240-280).',
        '4. Use the map() function in your code to translate voltage into 0-100% soil moisture percentage.'
      ],
      pinoutSummary: 'VCC (3.3V - 5.5V), GND (Ground), AOUT (Analog voltage output, inverse proportional to moisture).',
      sampleCode: `const int sensorPin = A0;
const int AirValue = 580;   // Value when sensor is dry in air
const int WaterValue = 260; // Value when sensor is in water

void setup() {
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(sensorPin);
  int moisturePercent = map(sensorValue, AirValue, WaterValue, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  Serial.print("Soil Moisture: ");
  Serial.print(moisturePercent);
  Serial.println("%");
  delay(1000);
}`
    },
    whereToUse: [
      {
        title: 'Automated Drip Irrigation System',
        description: 'Auto-activate 12V submersible water pumps through a relay whenever root zone moisture drops below 35%.',
        category: 'Precision Agriculture'
      },
      {
        title: 'Smart College Campus Plant Wall',
        description: 'Ensure ornamental flora in college libraries and corridors receive optimum water without manual intervention.',
        category: 'Smart Campus'
      },
      {
        title: 'Soil Salinity and Erosion Research',
        description: 'Record moisture retention curves across sandy, loamy, and clay soil variants for environmental research projects.',
        category: 'Soil Science'
      }
    ],
    safetyPrecautions: [
      'Do not submerge the electronic components above the white silkscreen boundary line into water; only insert the probe fork.'
    ]
  },

  'CC-MOD-RC522': {
    youtubeUrl: 'https://www.youtube.com/watch?v=d_kH1_o80wU',
    researchUrl: 'https://ieeexplore.ieee.org/document/8929712',
    datasheetUrl: 'https://www.nxp.com/docs/en/data-sheet/MFRC522.pdf',
    documentationUrl: 'https://github.com/miguelbalboa/rfid',
    howToUse: {
      overview: '13.56 MHz RFID reader/writer module supporting ISO 14443A cards and MIFARE transponders for smart card authentication and payment tokens.',
      steps: [
        '1. Connect to SPI bus: MOSI -> Pin 11, MISO -> Pin 12, SCK -> Pin 13 on Arduino Uno.',
        '2. Connect SDA (SS) to Pin 10, RST to Pin 9, and GND to GND.',
        '3. CRITICAL: Connect VCC to 3.3V (do NOT connect to 5V; chip will be destroyed).',
        '4. Install "MFRC522" library by Github Community and upload the "DumpInfo" example.'
      ],
      pinoutSummary: 'VCC (3.3V ONLY), RST (Reset), GND, IRQ (Interrupt, optional), MISO (Master-In-Slave-Out), MOSI (Master-Out-Slave-In), SCK (SPI Clock), SDA/SS (Slave Select).',
      sampleCode: `#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 10
#define RST_PIN 9

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("Scan an RFID tag or card...");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  Serial.print("Card UID: ");
  for (byte i = 0; i < rfid.uid.size; i++) {
    Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(rfid.uid.uidByte[i], HEX);
  }
  Serial.println();
  rfid.PICC_HaltA();
}`
    },
    whereToUse: [
      {
        title: 'RFID Student Attendance & Classroom Access',
        description: 'Read student college ID cards at door frames, logging arrival timestamps into Google Sheets or MySQL database.',
        category: 'Campus Automation'
      },
      {
        title: 'Electronic Hostel Door Lock with Solenoid',
        description: 'Verify encrypted card UID; energize a 12V door latch strike for 3 seconds if authorized, else sound error beep.',
        category: 'Access Control'
      },
      {
        title: 'College Canteen Cashless Payment Token',
        description: 'Store balance tokens inside MIFARE 1K EEPROM blocks for tap-and-pay meal transactions.',
        category: 'Smart Payment'
      }
    ],
    safetyPrecautions: [
      'VCC pin must strictly receive 3.3V. Applying 5V will burn the NXP MFRC522 silicon transceiver immediately.'
    ]
  },

  'CC-MOD-OLED96': {
    youtubeUrl: 'https://www.youtube.com/watch?v=7_bWjB876-Q',
    researchUrl: 'https://ieeexplore.ieee.org/document/8389445',
    datasheetUrl: 'https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf',
    documentationUrl: 'https://github.com/adafruit/Adafruit_SSD1306',
    howToUse: {
      overview: 'Crisp 128x64 self-illuminating monochrome OLED display with internal charge-pump SSD1306 controller operating over 2-wire I2C.',
      steps: [
        '1. Connect VCC to 3.3V or 5V (module has internal regulator) and GND to GND.',
        '2. Connect SCL to A5 and SDA to A4 on Arduino Uno (or GPIO 22/21 on ESP32).',
        '3. Install "Adafruit SSD1306" and "Adafruit GFX" libraries.',
        '4. Set I2C address to 0x3C in code and run example sketches to draw text, bitmaps, and telemetry plots.'
      ],
      pinoutSummary: 'VCC (3.3V - 5V), GND, SCL (I2C Clock line), SDA (I2C Data line). Standard address is 0x3C (some boards configurable to 0x3D via rear resistor).',
      sampleCode: `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(10, 20);
  display.println("upVolt IoT");
  display.setCursor(10, 36);
  display.println("Status: ONLINE");
  display.display();
}

void loop() {}`
    },
    whereToUse: [
      {
        title: 'Portable IoT Device Status Display',
        description: 'Show Wi-Fi SSID, IP address, sensor readings, and battery level in high-contrast blue pixels visible even under bright sunlight.',
        category: 'User Interface'
      },
      {
        title: 'Mini Gaming Console (Tetris / Flappy Bird)',
        description: 'Build pocket-sized Arduino games with tactile buttons and 60FPS fluid graphics using Adafruit GFX library.',
        category: 'Consumer Electronics'
      },
      {
        title: 'Digital Multimeter & Oscilloscope Screen',
        description: 'Plot real-time waveform signals and frequency counters for portable lab testing gear.',
        category: 'Instrumentation'
      }
    ],
    safetyPrecautions: [
      'Do not apply excessive pressure on the thin glass substrate during breadboard insertion.'
    ]
  },

  'CC-MOD-LCD1602': {
    youtubeUrl: 'https://www.youtube.com/watch?v=P_3kLpW_Vl0',
    researchUrl: 'https://ieeexplore.ieee.org/document/8697693',
    datasheetUrl: 'https://www.sparkfun.com/datasheets/LCD/HD44780.pdf',
    documentationUrl: 'https://github.com/johnrickman/LiquidCrystal_I2C',
    howToUse: {
      overview: 'Standard 16 characters by 2 lines alphanumeric display with pre-soldered PCF8574 I2C backpack, reducing wiring from 16 pins down to just 4 pins.',
      steps: [
        '1. Connect VCC to 5V and GND to GND.',
        '2. Connect SDA to A4 and SCL to A5 on Arduino Uno.',
        '3. If text does not show after uploading code, turn the small blue potentiometer on the back of the backpack with a screwdriver to adjust contrast.',
        '4. Install "LiquidCrystal_I2C" library and initialize with LiquidCrystal_I2C lcd(0x27, 16, 2).'
      ],
      pinoutSummary: 'GND, VCC (5V), SDA (I2C Data), SCL (I2C Clock). Address is usually 0x27 or 0x3F.',
      sampleCode: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Welcome Maker!");
  lcd.setCursor(0, 1);
  lcd.print("upVolt.in");
}

void loop() {}`
    },
    whereToUse: [
      {
        title: 'Smart Energy Metering Display',
        description: 'Show cumulative kWh units consumed and estimated electric bill amount beside college room switchboards.',
        category: 'Smart Metering'
      },
      {
        title: 'Automated Token & Queue Dispenser',
        description: 'Display current counter token number and customer queuing status in campus fee offices.',
        category: 'Commercial Automation'
      },
      {
        title: 'Automated Weather Station Dashboard',
        description: 'Continuous readout of temperature on Row 1 and humidity on Row 2 with periodic backlight flashing on warning conditions.',
        category: 'Monitoring'
      }
    ],
    safetyPrecautions: [
      'Operates reliably at 5V; 3.3V logic microcontrollers can read it fine, but VCC must receive 5V for crisp backlight contrast.'
    ]
  },

  'CC-MOD-RELAY4': {
    youtubeUrl: 'https://www.youtube.com/watch?v=LLMQsmw7xPo',
    researchUrl: 'https://ieeexplore.ieee.org/document/8821867',
    datasheetUrl: 'https://www.circuitbasics.com/wp-content/uploads/2015/11/SRD-05VDC-SL-C-Datasheet.pdf',
    documentationUrl: 'https://docs.arduino.cc/tutorials/generic/relay-module/',
    howToUse: {
      overview: '4-channel electro-mechanical relay board with EL817 optocoupler galvanic isolation, allowing 5V microcontrollers to safely switch 250V AC 10A mains loads.',
      steps: [
        '1. Connect VCC to 5V and GND to GND.',
        '2. Connect IN1, IN2, IN3, IN4 to digital output pins on your microcontroller.',
        '3. Understand Relay logic: Most modules are Active-LOW (writing LOW turns the relay ON, HIGH turns it OFF).',
        '4. On AC load side: Wire live line through COM (Common) and NO (Normally Open) terminals.'
      ],
      pinoutSummary: 'VCC (5V), GND, IN1-IN4 (Input control signals). Output side: NO (Normally Open), COM (Common), NC (Normally Closed). Rating: 10A 250VAC / 10A 30VDC.',
      sampleCode: `const int relayPin1 = 7;

void setup() {
  pinMode(relayPin1, OUTPUT);
  digitalWrite(relayPin1, HIGH); // Start with Relay OFF (Active LOW)
}

void loop() {
  digitalWrite(relayPin1, LOW);  // Turn ON 220V appliance
  delay(5000);
  digitalWrite(relayPin1, HIGH); // Turn OFF
  delay(5000);
}`
    },
    whereToUse: [
      {
        title: 'Hostel Room Smart Lighting & Fan Controller',
        description: 'Safely switch 220V ceiling fans and tube lights via voice commands or mobile app triggers.',
        category: 'Home Automation'
      },
      {
        title: 'Automated Pump Controller for Water Reservoirs',
        description: 'Switch heavy inductive single-phase induction pumps safely with snubber surge protection.',
        category: 'Agriculture & Water'
      },
      {
        title: 'Industrial Machine Sequencing',
        description: 'Step through solenoid air valves and heating elements in automated laboratory testing fixtures.',
        category: 'Industrial Systems'
      }
    ],
    safetyPrecautions: [
      'DANGER: 220V AC mains electricity can be fatal. Always insulate high-voltage terminals and disconnect power before touching wires!'
    ]
  },

  'CC-DRV-L298N': {
    youtubeUrl: 'https://www.youtube.com/watch?v=dyjo_ggEtVU',
    researchUrl: 'https://ieeexplore.ieee.org/document/8906958',
    datasheetUrl: 'https://www.sparkfun.com/datasheets/Robotics/L298_H_Bridge.pdf',
    documentationUrl: 'https://dronebotworkshop.com/l298n-motor-driver-arduino/',
    howToUse: {
      overview: 'High-power dual H-bridge motor driver module capable of driving two DC motors bidirectionally with speed control (PWM) or one 4-wire stepper motor up to 2A per channel.',
      steps: [
        '1. Connect external motor power (e.g. 7.4V - 12V battery) to 12V and GND terminals.',
        '2. If motor power is under 12V, keep the onboard 5V regulator jumper on to get 5V power out on the 5V terminal.',
        '3. Connect Arduino GND to L298N GND to establish common ground reference.',
        '4. Connect IN1, IN2, IN3, IN4 to Arduino digital pins for direction; connect ENA and ENB to PWM pins for speed control.'
      ],
      pinoutSummary: '12V Power Terminal, GND Terminal, 5V Regulated Terminal. Output: OUT1 & OUT2 (Motor A), OUT3 & OUT4 (Motor B). Control: ENA (Speed Motor A), IN1/IN2 (Direction Motor A), IN3/IN4 (Direction Motor B), ENB (Speed Motor B).',
      sampleCode: `const int in1 = 8;
const int in2 = 9;
const int ena = 5; // PWM pin

void setup() {
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);
  pinMode(ena, OUTPUT);
}

void loop() {
  // Motor A Forward at half speed
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
  analogWrite(ena, 150);
  delay(2000);

  // Stop
  analogWrite(ena, 0);
  delay(1000);
}`
    },
    whereToUse: [
      {
        title: 'Autonomous Mobile Robot (4WD / 2WD)',
        description: 'Provide independent differential steering and velocity ramps for autonomous navigation bots and obstacle avoiders.',
        category: 'Robotics'
      },
      {
        title: 'CNC Slider & Linear Actuator Control',
        description: 'Drive bi-directional lead screw motorized carriages for camera sliders and small automated gantries.',
        category: 'Mechatronics'
      },
      {
        title: 'RC Bluetooth Controlled Car',
        description: 'Receive joystick coordinates from smartphone app via HC-05 Bluetooth and translate into smooth proportional wheel speeds.',
        category: 'RC Systems'
      }
    ],
    safetyPrecautions: [
      'Always tie Arduino GND and Battery GND together. If powering motors with >12V, remove the 5V regulator jumper to avoid thermal burnout.'
    ]
  },

  'CC-MOT-SG90': {
    youtubeUrl: 'https://www.youtube.com/watch?v=kU_LhW_O-68',
    researchUrl: 'https://ieeexplore.ieee.org/document/8925431',
    datasheetUrl: 'http://www.towerpro.com.tw/product/sg90-7/',
    documentationUrl: 'https://docs.arduino.cc/learn/electronics/servo-motors/',
    howToUse: {
      overview: 'Lightweight 9-gram micro servo motor offering 180 degrees precise angular positioning controlled via 50Hz PWM signals.',
      steps: [
        '1. Connect Brown wire to GND.',
        '2. Connect Red wire to 5V power (use external 5V supply if driving multiple servos).',
        '3. Connect Orange wire to PWM digital pin (e.g. Pin 9 on Arduino).',
        '4. Use the built-in \`#include <Servo.h>\` library and call \`servo.write(angle)\` from 0 to 180 degrees.'
      ],
      pinoutSummary: 'Brown: GND, Red: VCC (4.8V - 6V), Orange/Yellow: PWM Signal (1ms = 0°, 1.5ms = 90°, 2ms = 180° at 50Hz).',
      sampleCode: `#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9);
}

void loop() {
  for (int pos = 0; pos <= 180; pos += 1) {
    myServo.write(pos);
    delay(15);
  }
  for (int pos = 180; pos >= 0; pos -= 1) {
    myServo.write(pos);
    delay(15);
  }
}`
    },
    whereToUse: [
      {
        title: 'Ultrasonic Sensor Panning Turret',
        description: 'Sweep HC-SR04 ultrasonic sensor left and right on robot chassis to map out 180-degree obstacle radar field.',
        category: 'Robotics'
      },
      {
        title: 'Robotic Gripper & Bionic Hand Fingers',
        description: 'Pull nylon tendon cords to actuate miniature mechanical fingers and soft grip mechanisms.',
        category: 'Prosthetics & Grippers'
      },
      {
        title: 'Dual-Axis Solar Tracker',
        description: 'Continuously angle solar panels toward highest LDR light readings to maximize daily electrical generation efficiency.',
        category: 'Renewable Energy'
      }
    ],
    safetyPrecautions: [
      'Do not mechanically force the servo arm by hand when powered, as plastic gears can strip easily.'
    ]
  },

  'CC-MOT-STEPPER': {
    youtubeUrl: 'https://www.youtube.com/watch?v=0qwrnUeSpYQ',
    researchUrl: 'https://ieeexplore.ieee.org/document/8907865',
    datasheetUrl: 'https://components101.com/motors/28byj-48-stepper-motor',
    documentationUrl: 'https://www.arduino.cc/reference/en/libraries/stepper/',
    howToUse: {
      overview: '5V unipolar 4-phase gear reduction stepper motor with matching ULN2003 Darlington transistor array driver board offering 2048 steps per full output revolution.',
      steps: [
        '1. Plug 5-pin white motor connector into the ULN2003 board.',
        '2. Connect ULN2003 "+" to 5V and "-" to GND.',
        '3. Connect IN1, IN2, IN3, IN4 to digital pins 8, 9, 10, 11 on Arduino.',
        '4. Use Stepper library with sequence: \`Stepper myStepper(2048, 8, 10, 9, 11);\` (note swapped middle pins for this motor gear train).'
      ],
      pinoutSummary: 'Motor driver: 5V-12V Power, GND, IN1-IN4 Inputs. Onboard status LEDs A, B, C, D indicate energized coils.',
      sampleCode: `#include <Stepper.h>

const int stepsPerRevolution = 2048;
Stepper myStepper(stepsPerRevolution, 8, 10, 9, 11);

void setup() {
  myStepper.setSpeed(10); // 10 RPM
}

void loop() {
  myStepper.step(stepsPerRevolution);
  delay(1000);
  myStepper.step(-stepsPerRevolution);
  delay(1000);
}`
    },
    whereToUse: [
      {
        title: 'Automated Window Blinds & Curtains',
        description: 'Precise revolution counting to open and close dormitory window shades based on sunlight intensity.',
        category: 'Home Automation'
      },
      {
        title: 'Mini 360-Degree Photography Turntable',
        description: 'Rotate e-commerce products smoothly in exact 5-degree increments to capture high-definition catalog photos.',
        category: 'Photography Gear'
      },
      {
        title: 'Laboratory Peristaltic Dosing Pump',
        description: 'Accurately pump microliters of liquid reagents in chemistry experiments using calibrated step counts.',
        category: 'Lab Equipment'
      }
    ],
    safetyPrecautions: [
      'Power the ULN2003 driver with an independent 5V power supply rather than drawing current through Arduino USB 5V pin.'
    ]
  },

  'CC-KIT-4WDCAR': {
    youtubeUrl: 'https://www.youtube.com/watch?v=O1_s3wA9Gtc',
    researchUrl: 'https://ieeexplore.ieee.org/document/8966453',
    datasheetUrl: 'https://components101.com/modules/l298n-motor-driver-module',
    documentationUrl: 'https://github.com/upvolt/4wd-robot-chassis',
    howToUse: {
      overview: 'Comprehensive 4-wheel drive mobile robotics platform containing laser-cut acrylic chassis plates, 4 TT gear motors, encoder speed discs, and battery holder.',
      steps: [
        '1. Peel protective brown paper off the dual acrylic chassis plates.',
        '2. Mount four TT gear motors using the included M3 brass standoffs and brackets.',
        '3. Solder 100nF decoupling capacitors across motor terminals to filter RF electrical noise.',
        '4. Mount L298N driver and microcontroller on top plate, wiring left pair of motors in parallel and right pair in parallel.'
      ],
      pinoutSummary: '4x DC TT Gear Motors (3V-6V rated, 1:48 gear ratio), 4x 65mm rubber grip wheels, optical speed discs, 4x AA battery pack (6V).',
      sampleCode: `// 4WD Dual Motor Control Skeleton
const int leftMotorFwd = 5;
const int leftMotorRev = 6;
const int rightMotorFwd = 9;
const int rightMotorRev = 10;

void setup() {
  pinMode(leftMotorFwd, OUTPUT);
  pinMode(leftMotorRev, OUTPUT);
  pinMode(rightMotorFwd, OUTPUT);
  pinMode(rightMotorRev, OUTPUT);
}

void loop() {
  // Move Forward
  digitalWrite(leftMotorFwd, HIGH);
  digitalWrite(leftMotorRev, LOW);
  digitalWrite(rightMotorFwd, HIGH);
  digitalWrite(rightMotorRev, LOW);
  delay(2000);
}`
    },
    whereToUse: [
      {
        title: 'Autonomous Maze Navigation Robot',
        description: 'Combine chassis with ultrasonic sensor or LiDAR to autonomously solve labyrinth courses without touching walls.',
        category: 'Robotics Competitions'
      },
      {
        title: 'Line Following Warehouse AGV',
        description: 'Attach 4-channel infrared sensor array underneath to follow high-contrast floor routes accurately.',
        category: 'Logistics'
      },
      {
        title: 'Wi-Fi / Bluetooth Camera Surveillance Buggy',
        description: 'Mount an ESP32-CAM to stream live first-person video over local Wi-Fi while driving through tight spaces.',
        category: 'Surveillance'
      }
    ],
    safetyPrecautions: [
      'Ensure wheel nuts are tightened securely; do not overload chassis with weights exceeding 1.2 kg.'
    ]
  },

  'CC-KIT-SMARTHOME': {
    youtubeUrl: 'https://www.youtube.com/watch?v=FqY-Zc_uR8E',
    researchUrl: 'https://ieeexplore.ieee.org/document/8892408',
    datasheetUrl: 'https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf',
    documentationUrl: 'https://github.com/upvolt/smart-home-kit',
    howToUse: {
      overview: 'All-in-one IoT learning kit pairing ESP32, multi-channel relays, OLED screen, gas/flame sensors, and buzzer with ready-to-flash mobile dashboard code.',
      steps: [
        '1. Connect the ESP32 to the 4-channel relay board (IN1->D18, IN2->D19, IN3->D23, IN4->D25).',
        '2. Power the relay board with an external 5V 2A DC adapter; do not draw relay coil current from ESP32 3.3V pin.',
        '3. Flash the provided upVolt Smart Home firmware in Arduino IDE, entering your room Wi-Fi credentials.',
        '4. Find your ESP32 IP address from the Serial Monitor (115200 baud) and open it in any smartphone browser on the same Wi-Fi.',
        '5. Tap any virtual appliance toggle on the local web server dashboard to switch room lights/fans.'
      ],
      pinoutSummary: 'Integrated layout: ESP32 + 4-channel opto-relay + DHT11 (GPIO 4) + MQ-2 (GPIO 34) + PIR (GPIO 27) + I2C OLED (GPIO 21/22).',
      sampleCode: `// upVolt Smart Home Automation Web Server (ESP32)
#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

WebServer server(80);
const int RELAY_PIN = 18;

void handleRoot() {
  server.send(200, "text/plain", "upVolt Smart Home Server Online!");
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  server.handleClient();
}`
    },
    whereToUse: [
      {
        title: 'College Final Year Engineering Major Project',
        description: 'Complete capstone demonstration covering IoT networking, cloud dashboards, sensor fusion, and power relay management.',
        category: 'Capstone & Degree'
      },
      {
        title: 'Smart Energy Optimization Testbed',
        description: 'Test automated load-shedding algorithms that cut power to non-critical circuits during peak tariff hours.',
        category: 'Green Tech'
      },
      {
        title: 'Home Hazard & Gas Safety System',
        description: 'Dual fire and gas smoke sensing with automated buzzer sirens and instant smartphone notification dispatcher.',
        category: 'Safety & Security'
      }
    ],
    safetyPrecautions: [
      'Keep low-voltage microcontroller logic boards insulated from high-voltage relay output blocks.'
    ]
  },

  'CC-PWR-MB102': {
    youtubeUrl: 'https://www.youtube.com/watch?v=48_O3w2wS_Q',
    researchUrl: 'https://ieeexplore.ieee.org/document/8710200',
    datasheetUrl: 'https://www.ti.com/lit/ds/symlink/ams1117.pdf',
    documentationUrl: 'https://components101.com/modules/mb102-breadboard-power-supply-module',
    howToUse: {
      overview: 'Dedicated plug-in breadboard power supply providing independent dual rail outputs switchable between 3.3V, 5V, or OFF via jumpers.',
      steps: [
        '1. Align the module pins with the positive (+) and negative (-) rails of a standard MB-102 830-point breadboard and push down firmly.',
        '2. Configure voltage selection jumpers: set left jumper to 3.3V or 5V; set right jumper to 3.3V or 5V.',
        '3. Plug in 6.5V - 12V DC wall adapter into the 2.1mm DC barrel jack or plug USB into standard USB port.',
        '4. Press the self-locking power latch button. Green LED will illuminate confirming regulated power on both rails.'
      ],
      pinoutSummary: 'Input: 6.5V - 12V DC Barrel jack or 5V USB. Output: Independent Dual 3.3V / 5V rails, max 700mA combined current.',
      sampleCode: `// No coding required - Pure hardware voltage regulator module!
// Connect your Arduino / ESP32 GND to the breadboard GND rail to maintain common reference.`
    },
    whereToUse: [
      {
        title: 'Prototyping Mixed 3.3V and 5V Circuits',
        description: 'Power 3.3V ESP32 on the top breadboard power rail while simultaneously powering 5V relays and sensors on the bottom rail.',
        category: 'Lab Prototyping'
      },
      {
        title: 'Relieving Microcontroller LDO Regulators',
        description: 'Prevent onboard microcontroller regulators from overheating when driving multiple high-current sensors or buzzers.',
        category: 'Power Management'
      },
      {
        title: 'Portable Battery Prototyping Station',
        description: 'Power test fixtures directly from 9V batteries through the barrel jack connector for mobile lab demos.',
        category: 'Mobile Testing'
      }
    ],
    safetyPrecautions: [
      'Maximum continuous output current is 700mA. Do not power heavy inductive DC motors through this module; AMS1117 chip will overheat.'
    ]
  },

  'CC-CMP-BREAD830': {
    youtubeUrl: 'https://www.youtube.com/watch?v=0_u6eJ6-vVo',
    researchUrl: 'https://www.instructables.com/How-to-Use-a-Breadboard/',
    datasheetUrl: 'https://cdn-learn.adafruit.com/downloads/pdf/breadboards-for-beginners.pdf',
    documentationUrl: 'https://docs.arduino.cc/learn/electronics/breadboard-basics/',
    howToUse: {
      overview: 'Heavy-duty 830 tie-point solderless breadboard featuring nickel-plated spring clips, self-adhesive backing, and interlocking tabs for modular expansion.',
      steps: [
        '1. Notice the center divider trench: ICs and microcontrollers are placed straddling this divider.',
        '2. Terminal strips: Each 5-hole vertical column (a-e and f-j) is internally connected as a single electrical node.',
        '3. Bus strips: The horizontal colored rails (+ and -) at top and bottom run continuous voltage lines across the board.',
        '4. Insert standard 22-29 AWG solid jumper wire or component leads firmly at 90-degree angles.'
      ],
      pinoutSummary: '830 total tie points: 630 tie-point IC circuit area + 200 tie-point distribution power buses.',
      sampleCode: `// Passive electronic prototyping canvas.
// Connect standard jumpers and verify connections before applying DC power.`
    },
    whereToUse: [
      {
        title: 'Electronics Circuit Design & Testing',
        description: 'Rapidly test analog op-amp filters, 555 timer oscillators, and transistor switching circuits without soldering.',
        category: 'Electronics Labs'
      },
      {
        title: 'Microcontroller Sensor Interfacing',
        description: 'Wire prototype connections between development boards and displays before producing finalized printed circuit boards.',
        category: 'Embedded Systems'
      },
      {
        title: 'Classroom & Workshop Hands-on Training',
        description: 'Reusable platform for college students to build, test, and dismantle circuits quickly during laboratory exams.',
        category: 'STEM Education'
      }
    ],
    safetyPrecautions: [
      'Never exceed 30V or 2A current per rail on breadboard spring contacts to avoid melting the ABS plastic casing.'
    ]
  },

  'CC-CAB-DUPONT120': {
    youtubeUrl: 'https://www.youtube.com/watch?v=R5pE82_B-YQ',
    researchUrl: 'https://www.electronics-tutorials.ws/blog/breadboard-jumper-wires.html',
    datasheetUrl: 'https://components101.com/wires/dupont-jumper-wires',
    documentationUrl: 'https://github.com/upvolt/starter-guide',
    howToUse: {
      overview: '120-piece assorted high-grade copper jumper wire ribbon cable: 40x Male-to-Male (M-M), 40x Male-to-Female (M-F), and 40x Female-to-Female (F-F) in 20cm length.',
      steps: [
        '1. Peel off desired number of wire strands from the rainbow ribbon strip as needed.',
        '2. Use Male-to-Male wires for breadboard-to-breadboard connections.',
        '3. Use Male-to-Female wires to connect breadboard rails directly to module male pin headers.',
        '4. Use Female-to-Female wires for direct module-to-microcontroller pin header connections (e.g. ESP32 to I2C OLED).'
      ],
      pinoutSummary: '20cm wire length, 2.54mm standard pitch DuPont connectors, high-purity stranded copper core.',
      sampleCode: `// Color coding best practices:
// Red wire = VCC (+5V / +3.3V)
// Black / Brown wire = Ground (GND)
// Blue / Yellow / Green = Data & Signal lines (SDA, SCL, TX, RX)`
    },
    whereToUse: [
      {
        title: 'Solderless Prototyping Interconnections',
        description: 'Connect sensors, drivers, and displays to development boards without messy soldering irons.',
        category: 'Prototyping'
      },
      {
        title: 'Logic Analyzer & Oscilloscope Hookups',
        description: 'Tap test points on custom PCBs to monitor bus traffic (I2C, SPI, UART) using protocol analyzers.',
        category: 'Testing & Debugging'
      },
      {
        title: 'Modular Robotics Harnessing',
        description: 'Quickly extend wiring runs between robot chassis sensors and high-mounted mainboard controllers.',
        category: 'Robotics'
      }
    ],
    safetyPrecautions: [
      'Do not pull on the thin PVC wire insulation when disconnecting; grip the black square DuPont plastic housing firmly.'
    ]
  },

  'CC-KIT-STARTER45': {
    youtubeUrl: 'https://www.youtube.com/watch?v=F3_Jb1a2EaU',
    researchUrl: 'https://ieeexplore.ieee.org/document/8920114',
    datasheetUrl: 'https://github.com/upvolt/45-in-1-sensor-kit-datasheets',
    documentationUrl: 'https://github.com/upvolt/45-in-1-sensor-kit-code',
    howToUse: {
      overview: 'The definitive all-in-one component & sensor kit for college engineering students containing 45 individual sensors, modules, and transducers in a rugged organizer case.',
      steps: [
        '1. Match the labeled sensor module number with the included upVolt quick-reference pinout cheat sheet.',
        '2. Identify whether the sensor outputs digital (HIGH/LOW) or analog (0-1023 continuous) voltages.',
        '3. Connect VCC and GND, attach signal pin to microcontroller, and open the corresponding open-source code sketch from our documentation repo.',
        '4. Observe readings on Serial Monitor and calibrate sensitivity potentiometers as necessary.'
      ],
      pinoutSummary: 'Includes: Ultrasonic, PIR, DHT11, MQ-2, Flame, Tilt, Sound, Joystick, LDR, Reed switch, Touch sensor, Buzzer, Relay, RGB LED, and 30+ more modules with 2.54mm pin headers.',
      sampleCode: `// Master Sensor Reading Example
void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT); // Digital sensor pin
}

void loop() {
  int digitalVal = digitalRead(2);
  int analogVal = analogRead(A0);
  Serial.print("Digital: "); Serial.print(digitalVal);
  Serial.print(" | Analog: "); Serial.println(analogVal);
  delay(300);
}`
    },
    whereToUse: [
      {
        title: 'College Mini-Projects & Practical Lab Work',
        description: 'Fulfill all syllabus experiments for Microcontroller & Embedded Systems lab courses across 4 years of engineering.',
        category: 'Engineering Academics'
      },
      {
        title: 'Hackathons & Rapid Invention Challenges',
        description: 'Have every sensor immediately on-hand during 24-hour hackathons to prototype any idea in minutes.',
        category: 'Hackathons'
      },
      {
        title: 'Maker Innovations & STEM Workshops',
        description: 'Conduct interactive IoT workshops training students on robotics, smart cities, and healthcare electronics.',
        category: 'Workshops & Training'
      }
    ],
    safetyPrecautions: [
      'Check sensor operating voltage label before powering; some components are strictly 3.3V while others require 5V.'
    ]
  }
};
