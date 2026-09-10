import { PRODUCT_GUIDES } from './productGuides.js';

const RAW_PRODUCTS = [
  // 1. DEVELOPMENT BOARDS
  {
    name: 'ESP32 Wi-Fi + Bluetooth Dev Board (NodeMCU-32S)',
    category: 'Development Boards',
    price: 449,
    originalPrice: 699,
    rating: 4.8,
    reviewsCount: 120,
    badge: 'Bestseller',
    inStock: true,
    sku: 'CC-DEV-ESP32',
    image: '/images/realistic/esp32.jpg',
    images: ['/images/realistic/esp32.jpg', '/images/realistic/oled_display.jpg'],
    description: 'The ESP32 is a dual-core 32-bit MCU with integrated 2.4 GHz Wi-Fi and Bluetooth BLE. Perfect for smart home IoT projects, cloud monitoring, robotics, and academic thesis experiments.',
    specifications: {
      'Microcontroller': 'Tensilica Xtensa Dual-Core 32-bit LX6',
      'Operating Voltage': '3.3V (5V micro-USB input)',
      'Wi-Fi': '802.11 b/g/n (up to 150 Mbps)',
      'Bluetooth': 'v4.2 BR/EDR and BLE',
      'Flash Memory': '4MB SPI Flash',
      'Clock Speed': '240 MHz'
    },
    tags: ['IoT', 'Smart Home', 'WiFi', 'Bluetooth', 'College Projects'],
    perfectFor: ['Smart Home Automation', 'Cloud IoT Sensors', 'Robotics', 'Final Year Thesis']
  },
  {
    name: 'Arduino Uno R3 Compatible (ATmega328P + CH340G)',
    category: 'Development Boards',
    price: 699,
    originalPrice: 899,
    rating: 4.7,
    reviewsCount: 98,
    badge: 'Popular',
    inStock: true,
    sku: 'CC-DEV-UNO3',
    image: '/images/realistic/arduino_uno.jpg',
    images: ['/images/realistic/arduino_uno.jpg', '/images/realistic/breadboard_wires.jpg'],
    description: 'The world’s most popular electronics development board for students. Features 14 digital input/output pins, 6 analog inputs, a 16 MHz ceramic resonator, USB connection, and ICSP header.',
    specifications: {
      'Microcontroller': 'ATmega328P',
      'Operating Voltage': '5V',
      'Digital I/O Pins': '14 (6 PWM outputs)',
      'Analog Input Pins': '6',
      'Flash Memory': '32 KB'
    },
    tags: ['Microcontroller', 'Arduino', 'Beginners', 'Robotics'],
    perfectFor: ['First Year Engineering Labs', 'Robotics', 'Sensor Interfacing', 'School Exhibitions']
  },
  {
    name: 'Raspberry Pi 4 Model B (4GB RAM)',
    category: 'Development Boards',
    price: 5499,
    originalPrice: 6999,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'Hot',
    inStock: true,
    sku: 'CC-DEV-RPT4-4GB',
    image: '/images/realistic/raspberry_pi4.jpg',
    images: ['/images/realistic/raspberry_pi4.jpg', '/images/realistic/breadboard_wires.jpg'],
    description: 'Complete desktop-class single-board computer powered by a 64-bit quad-core Broadcom BCM2711 processor at 1.5GHz. Supports dual 4K micro-HDMI displays, Gigabit Ethernet, dual-band Wi-Fi, Bluetooth 5.0, and high-speed USB 3.0 ports.',
    specifications: {
      'Processor': 'Broadcom BCM2711, Quad-core Cortex-A72 (ARM v8) 64-bit SoC @ 1.5GHz',
      'Memory': '4GB LPDDR4-3200 SDRAM',
      'Connectivity': 'Dual-band 2.4GHz/5.0GHz IEEE 802.11b/g/n/ac WiFi, Bluetooth 5.0, BLE',
      'Ports': '2 × USB 3.0 ports; 2 × USB 2.0 ports; 2 × micro-HDMI ports (up to 4kp60)'
    },
    tags: ['Raspberry Pi', 'Single Board Computer', 'Linux', 'Python', 'AI Edge'],
    perfectFor: ['AI Vision Projects', 'Home Media Server', 'Computer Vision Labs', 'Robotics Brain']
  },
  {
    name: 'Raspberry Pi Pico RP2040 Dual-Core ARM Board',
    category: 'Development Boards',
    price: 389,
    originalPrice: 550,
    rating: 4.9,
    reviewsCount: 84,
    badge: 'Popular',
    inStock: true,
    sku: 'CC-DEV-PICO2040',
    image: '/images/realistic/arduino_uno.jpg',
    images: ['/images/realistic/arduino_uno.jpg', '/images/realistic/breadboard_wires.jpg'],
    description: 'High-performance microcontroller board featuring dual-core ARM Cortex-M0+ processor running up to 133 MHz with 2MB on-board QSPI Flash memory. Supports MicroPython and C/C++ SDK.',
    specifications: {
      'Processor': 'Dual-core ARM Cortex M0+ @ 133MHz',
      'SRAM': '264KB on-chip SRAM',
      'Flash Memory': '2MB On-Board QSPI Flash',
      'GPIO Pins': '26 Multi-function GPIO'
    },
    tags: ['ARM', 'MicroPython', 'Raspberry Pi', 'Embedded C'],
    perfectFor: ['MicroPython Coding', 'Wearables', 'TinyML Experiments', 'Embedded Systems']
  },
  {
    name: 'NodeMCU ESP8266 CP2102 Wi-Fi Development Board',
    category: 'Development Boards',
    price: 289,
    originalPrice: 420,
    rating: 4.6,
    reviewsCount: 65,
    badge: null,
    inStock: true,
    sku: 'CC-DEV-ESP8266',
    image: '/images/realistic/esp32.jpg',
    images: ['/images/realistic/esp32.jpg', '/images/realistic/breadboard_wires.jpg'],
    description: 'Affordable open-source IoT development platform based on ESP-12E Wi-Fi module. Easily connects sensors to Blynk, Adafruit IO, or custom MQTT brokers.',
    specifications: {
      'Microcontroller': 'Tensilica L106 32-bit RISC',
      'Operating Voltage': '3.3V',
      'Wi-Fi Standard': '802.11 b/g/n (2.4 GHz)',
      'USB Interface': 'CP2102 driver'
    },
    tags: ['ESP8266', 'WiFi', 'IoT', 'MQTT', 'Low Cost'],
    perfectFor: ['IoT Prototyping', 'Weather Monitoring', 'Smart Socket Control']
  },

  // 2. SENSORS
  {
    name: 'Ultrasonic Distance Sensor Module (HC-SR04)',
    category: 'Sensors',
    price: 120,
    originalPrice: 180,
    rating: 4.6,
    reviewsCount: 76,
    badge: null,
    inStock: true,
    sku: 'CC-SEN-HCSR04',
    image: '/images/realistic/ultrasonic.jpg',
    images: ['/images/realistic/ultrasonic.jpg', '/images/realistic/arduino_uno.jpg'],
    description: 'Provides 2cm to 400cm non-contact measurement function with ranging accuracy reaching up to 3mm. Essential for obstacle-avoiding robots and automated distance meters.',
    specifications: {
      'Operating Voltage': '5V DC',
      'Operating Current': '15mA',
      'Ranging Distance': '2cm – 400cm',
      'Measuring Angle': '15 degrees'
    },
    tags: ['Sensors', 'Distance', 'Robotics', 'Ultrasonic'],
    perfectFor: ['Obstacle Avoiding Robots', 'Smart Parking Systems', 'Liquid Level Detection']
  },
  {
    name: 'DHT11 Digital Temperature & Humidity Sensor',
    category: 'Sensors',
    price: 99,
    originalPrice: 150,
    rating: 4.5,
    reviewsCount: 54,
    badge: 'New',
    inStock: true,
    sku: 'CC-SEN-DHT11',
    image: '/images/realistic/dht11.jpg',
    images: ['/images/realistic/dht11.jpg', '/images/realistic/esp32.jpg'],
    description: 'A basic, low-cost digital temperature and humidity sensor. Utilizes a capacitive humidity sensor and a thermistor to measure surrounding air.',
    specifications: {
      'Supply Voltage': '3.5 to 5.5V DC',
      'Temperature Range': '0 to 50°C ± 2°C',
      'Humidity Range': '20 to 90% RH ± 5% RH'
    },
    tags: ['Weather', 'Environment', 'Sensors', 'IoT'],
    perfectFor: ['Weather Stations', 'Greenhouse Automation', 'Hostel Room Monitor']
  },
  {
    name: 'HC-SR501 PIR Motion Detector Sensor Module',
    category: 'Sensors',
    price: 135,
    originalPrice: 199,
    rating: 4.7,
    reviewsCount: 68,
    badge: null,
    inStock: true,
    sku: 'CC-SEN-PIR501',
    image: '/images/realistic/dht11.jpg',
    images: ['/images/realistic/dht11.jpg', '/images/realistic/arduino_uno.jpg'],
    description: 'Passive Infrared (PIR) sensor designed to detect human or pet motion. Features adjustable delay time and sensitivity potentiometer dials for security and automated lighting projects.',
    specifications: {
      'Voltage Range': '4.5V - 20V DC',
      'Detection Angle': '< 100 degrees cone',
      'Detection Range': '3m to 7m adjustable',
      'Delay Time': '0.3s to 200s'
    },
    tags: ['Motion', 'Security', 'Automation', 'Sensors'],
    perfectFor: ['Intruder Alarm Systems', 'Automatic Room Lighting', 'Visitor Announcer']
  },
  {
    name: 'MQ-2 Gas / Smoke / LPG Sensor Module',
    category: 'Sensors',
    price: 145,
    originalPrice: 220,
    rating: 4.6,
    reviewsCount: 47,
    badge: null,
    inStock: true,
    sku: 'CC-SEN-MQ2',
    image: '/images/realistic/dht11.jpg',
    images: ['/images/realistic/dht11.jpg', '/images/realistic/relay_module.jpg'],
    description: 'Sensitive gas detector module suitable for sensing LPG, i-butane, propane, methane, alcohol, hydrogen, and smoke concentrations in air.',
    specifications: {
      'Target Gases': 'LPG, Smoke, Alcohol, Propane, Hydrogen',
      'Operating Voltage': '5V DC',
      'Output Type': 'Analog and Digital (TTL Comparator)'
    },
    tags: ['Gas Sensor', 'Safety', 'Smoke Detector', 'Fire Alarm'],
    perfectFor: ['Kitchen Gas Leak Detector', 'Industrial Safety Prototype', 'Fire Alarm System']
  },
  {
    name: 'MPU-6050 6-Axis Accelerometer & Gyroscope Sensor (GY-521)',
    category: 'Sensors',
    price: 199,
    originalPrice: 299,
    rating: 4.8,
    reviewsCount: 91,
    badge: 'Popular',
    inStock: true,
    sku: 'CC-SEN-MPU6050',
    image: '/images/realistic/oled_display.jpg',
    images: ['/images/realistic/oled_display.jpg', '/images/realistic/arduino_uno.jpg'],
    description: 'Combines a 3-axis gyroscope and a 3-axis accelerometer on the same silicon die together with an onboard Digital Motion Processor (DMP) capable of processing complex 6-axis algorithms.',
    specifications: {
      'Communication Interface': 'I2C (Fast Mode 400kHz)',
      'Operating Voltage': '3.3V - 5V',
      'Gyro Range': '±250, 500, 1000, 2000 °/s',
      'Accel Range': '±2g, ±4g, ±8g, ±16g'
    },
    tags: ['Gyroscope', 'Accelerometer', 'Drones', 'Balance Robot', 'I2C'],
    perfectFor: ['Self-Balancing Two Wheel Robot', 'Drone Flight Controller', 'Gesture Control Glove']
  },
  {
    name: 'Soil Moisture Hygrometer Detection Sensor Kit',
    category: 'Sensors',
    price: 85,
    originalPrice: 140,
    rating: 4.5,
    reviewsCount: 39,
    badge: null,
    inStock: true,
    sku: 'CC-SEN-SOILM',
    image: '/images/realistic/dht11.jpg',
    images: ['/images/realistic/dht11.jpg', '/images/realistic/relay_module.jpg'],
    description: 'Detects moisture levels in soil using resistive fork probes. Features LM393 comparator with adjustable threshold pot for automatic watering irrigation systems.',
    specifications: {
      'Working Voltage': '3.3V - 5V',
      'Outputs': 'Analog (A0) and Digital (D0)',
      'Probe Material': 'Nickel coated corrosion resistant'
    },
    tags: ['AgriTech', 'Soil Moisture', 'Irrigation', 'Plants'],
    perfectFor: ['Smart Irrigation System', 'Automated Plant Watering', 'Soil Quality Monitoring']
  },

  // 3. MODULES & DISPLAYS
  {
    name: 'RFID RC522 Reader Module with Card & Keyfob (13.56 MHz)',
    category: 'Modules',
    price: 299,
    originalPrice: 399,
    rating: 4.6,
    reviewsCount: 63,
    badge: 'Hot',
    inStock: true,
    sku: 'CC-MOD-RC522',
    image: '/images/realistic/rfid.jpg',
    images: ['/images/realistic/rfid.jpg', '/images/realistic/rfid_rc522.jpg'],
    description: 'MFRC522 IC based contactless reader/writer card module. Widely used for student college attendance systems, smart locks, and access control prototypes.',
    specifications: {
      'Operating Frequency': '13.56 MHz',
      'Communication Interface': 'SPI',
      'Operating Voltage': '3.3V',
      'Read Distance': 'Up to 50mm'
    },
    tags: ['Security', 'Attendance', 'RFID', 'Access Control'],
    perfectFor: ['College Attendance Systems', 'Smart Door Locks', 'Library Management']
  },
  {
    name: '0.96 inch I2C OLED Display Module (128x64 Blue/Yellow)',
    category: 'Modules',
    price: 279,
    originalPrice: 399,
    rating: 4.9,
    reviewsCount: 112,
    badge: 'Bestseller',
    inStock: true,
    sku: 'CC-MOD-OLED96',
    image: '/images/realistic/oled_display.jpg',
    images: ['/images/realistic/oled_display.jpg', '/images/realistic/esp32.jpg'],
    description: 'Crystal-clear self-emitting graphical OLED display with high contrast and wide viewing angle. Requires only 4 pins (VCC, GND, SCL, SDA) to display text, graphs, and custom bitmap icons.',
    specifications: {
      'Resolution': '128 x 64 pixels',
      'Driver IC': 'SSD1306',
      'Interface': 'I2C (Address 0x3C / 0x3D)',
      'Operating Voltage': '3.3V - 5V'
    },
    tags: ['OLED', 'Display', 'I2C', 'SSD1306', 'Mini Screen'],
    perfectFor: ['Crypto Trackers', 'Smart Watches', 'Weather Dashboards', 'Game Consoles']
  },
  {
    name: '16x2 Character LCD Display with I2C Backpack',
    category: 'Modules',
    price: 249,
    originalPrice: 360,
    rating: 4.7,
    reviewsCount: 78,
    badge: null,
    inStock: true,
    sku: 'CC-MOD-LCD1602',
    image: '/images/realistic/lcd1602.jpg',
    images: ['/images/realistic/lcd1602.jpg', '/images/realistic/arduino_uno.jpg'],
    description: 'Standard 16-character by 2-line alphanumeric LCD pre-soldered with PCF8574 I2C expansion adapter. Frees up valuable microcontroller GPIO pins by communicating over just 2 I2C wires.',
    specifications: {
      'Display Format': '16 characters x 2 lines',
      'Backlight': 'Blue LED with white characters',
      'Operating Voltage': '5V DC',
      'Default I2C Address': '0x27 or 0x3F'
    },
    tags: ['LCD', 'Display', 'I2C', 'PCF8574', 'Alphanumeric'],
    perfectFor: ['Digital Clocks', 'Voting Machine Prototypes', 'Billing Systems', 'Lab Demonstrations']
  },
  {
    name: '4-Channel 5V Relay Module with Optocoupler Isolation',
    category: 'Modules',
    price: 229,
    originalPrice: 340,
    rating: 4.8,
    reviewsCount: 82,
    badge: 'Popular',
    inStock: true,
    sku: 'CC-MOD-RELAY4',
    image: '/images/realistic/relay_module.jpg',
    images: ['/images/realistic/relay_module.jpg', '/images/realistic/esp32.jpg'],
    description: 'Enables microcontrollers to safely switch high-voltage AC appliances up to 250V AC / 10A. Built with optical isolators to protect delicate controller logic from inductive voltage spikes.',
    specifications: {
      'Channels': '4 Independent Relay Channels',
      'Trigger Current': '5mA per channel',
      'Max Load': 'AC 250V/10A, DC 30V/10A',
      'Control Voltage': '5V Active LOW / HIGH'
    },
    tags: ['Relay', 'Home Automation', 'AC Switching', 'Smart Sockets'],
    perfectFor: ['Smart Home Switchboards', 'Fan/Light Control', 'Appliance Automation']
  },

  // 4. MOTORS & DRIVERS
  {
    name: 'L298N Dual H-Bridge Motor Driver Board',
    category: 'Motors & Drivers',
    price: 189,
    originalPrice: 280,
    rating: 4.7,
    reviewsCount: 42,
    badge: 'Popular',
    inStock: true,
    sku: 'CC-DRV-L298N',
    image: '/images/realistic/l298n_driver.jpg',
    images: ['/images/realistic/l298n_driver.jpg', '/images/realistic/motor.jpg'],
    description: 'High-power motor driver module perfect for driving DC motors and stepper motors. Controls direction and speed of two DC motors simultaneously.',
    specifications: {
      'Driver Chip': 'L298N Dual H Bridge',
      'Drive Voltage': '5V - 35V',
      'Drive Current': '2A (MAX single bridge)',
      'Logic Voltage': '5V'
    },
    tags: ['Motors', 'Robotics', 'Driver', 'RC Cars'],
    perfectFor: ['Line Following Robots', 'RC Bluetooth Cars', 'Autonomous Rover']
  },
  {
    name: 'SG90 9g Micro Servo Motor 180 Degree',
    category: 'Motors & Drivers',
    price: 110,
    originalPrice: 170,
    rating: 4.6,
    reviewsCount: 135,
    badge: 'Bestseller',
    inStock: true,
    sku: 'CC-MOT-SG90',
    image: '/images/realistic/motor.jpg',
    images: ['/images/realistic/motor.jpg', '/images/realistic/sg90_servo.jpg'],
    description: 'Lightweight, high-torque micro servo with nylon gears. Turns approximately 180 degrees via standard 50Hz PWM signal. Includes horn arms and mounting screws.',
    specifications: {
      'Weight': '9 grams',
      'Operating Speed': '0.12s / 60 degrees (4.8V)',
      'Stall Torque': '1.8 kg-cm',
      'Operating Voltage': '4.8V - 6V'
    },
    tags: ['Servo', 'SG90', 'Robotics', 'Gimbal', 'Arms'],
    perfectFor: ['Robotic Arms', 'Camera Pan/Tilt Gimbals', 'Smart Dustbins', 'R/C Airplanes']
  },
  {
    name: '28BYJ-48 5V Stepper Motor with ULN2003 Driver Board',
    category: 'Motors & Drivers',
    price: 199,
    originalPrice: 299,
    rating: 4.7,
    reviewsCount: 51,
    badge: null,
    inStock: true,
    sku: 'CC-MOT-STEPPER',
    image: '/images/realistic/motor.jpg',
    images: ['/images/realistic/motor.jpg', '/images/realistic/l298n_driver.jpg'],
    description: 'Geared unipolar 4-phase stepper motor complete with ULN2003 transistor array driver board with on-board phase indicator LEDs. Offers precise angle stepping.',
    specifications: {
      'Rated Voltage': '5V DC',
      'Step Angle': '5.625° / 64 gear reduction ratio',
      'Driver Board': 'ULN2003 Darlington array with 4-phase LEDs'
    },
    tags: ['Stepper Motor', 'Precision', 'CNC', 'Robotics'],
    perfectFor: ['Automated Curtains', 'Rotary Turntables', 'Mini CNC Plotters']
  },

  // 5. IOT KITS
  {
    name: '4WD Smart Robot Car Chassis Kit with TT Motors',
    category: 'IoT Kits',
    price: 999,
    originalPrice: 1499,
    rating: 4.9,
    reviewsCount: 88,
    badge: 'Bestseller',
    inStock: true,
    sku: 'CC-KIT-4WDCAR',
    image: '/images/realistic/robotcar.jpg',
    images: ['/images/realistic/robotcar.jpg', '/images/realistic/robotcar_chassis.jpg', '/images/realistic/l298n_driver.jpg'],
    description: 'Complete 4-wheel drive robotics platform including acrylic chassis, 4 TT gear motors, wheels, speed encoders, and battery holder. The foundation for all college robotics projects.',
    specifications: {
      'Chassis Material': 'Laser-cut Acrylic',
      'Motors': '4 x TT Gear Motors (3-6V)',
      'Wheels': '4 x Rubber Grip Tires (65mm)',
      'Speed Encoder Discs': '4 included'
    },
    tags: ['Robotics', '4WD', 'Student Kit', 'Autonomous'],
    perfectFor: ['RoboWars', 'Obstacle Avoidance', 'App Controlled Car']
  },
  {
    name: 'ESP32 Smart Home IoT Automation Kit with Sensors & Relays',
    category: 'IoT Kits',
    price: 1499,
    originalPrice: 2199,
    rating: 4.9,
    reviewsCount: 64,
    badge: 'Hot',
    inStock: true,
    sku: 'CC-KIT-SMARTHOME',
    image: '/images/realistic/esp32.jpg',
    images: ['/images/realistic/esp32.jpg', '/images/realistic/relay_module.jpg', '/images/realistic/dht11.jpg'],
    description: 'Comprehensive IoT training package: includes ESP32 board, 4-channel relay, DHT11 temp/humidity sensor, PIR motion sensor, MQ-2 smoke detector, jumper wires, and breadboard with full source code for Blynk 2.0 app.',
    specifications: {
      'Main Controller': 'ESP32 NodeMCU-32S Wi-Fi + BLE',
      'Cloud Support': 'Blynk IoT, Adafruit IO, ThingSpeak, MQTT',
      'Included Components': '10+ modules & sensor boards'
    },
    tags: ['IoT Kit', 'Smart Home', 'Blynk', 'ESP32', 'College Project'],
    perfectFor: ['Semester Minor Projects', 'IoT Lab Demonstrations', 'Home Automation DIY']
  },

  // 6. POWER & COMPONENTS
  {
    name: 'MB102 Breadboard Power Supply Module 3.3V / 5V Dual Rail',
    category: 'Power & Components',
    price: 129,
    originalPrice: 199,
    rating: 4.7,
    reviewsCount: 93,
    badge: 'Popular',
    inStock: true,
    sku: 'CC-PWR-MB102',
    image: '/images/realistic/breadboard_wires.jpg',
    images: ['/images/realistic/breadboard_wires.jpg', '/images/realistic/arduino_uno.jpg'],
    description: 'Plugs directly into standard 830-point or 400-point breadboard power rails. Delivers clean, switchable 3.3V and 5V outputs powered by DC barrel jack (6.5-12V) or USB port.',
    specifications: {
      'Input Voltage': '6.5V - 12V DC via 5.5mm Barrel or USB 5V',
      'Output Voltage': '3.3V / 5V switchable per rail',
      'Max Output Current': '< 700mA'
    },
    tags: ['Power Supply', 'Breadboard', 'MB102', 'Regulator'],
    perfectFor: ['Lab Prototyping', 'Dual Voltage Breadboard Circuits', 'MCU Testing']
  },
  {
    name: '830-Point Solderless Breadboard with Power Rails',
    category: 'Power & Components',
    price: 149,
    originalPrice: 220,
    rating: 4.8,
    reviewsCount: 110,
    badge: null,
    inStock: true,
    sku: 'CC-CMP-BREAD830',
    image: '/images/realistic/breadboard_wires.jpg',
    images: ['/images/realistic/breadboard_wires.jpg', '/images/realistic/arduino_uno.jpg'],
    description: 'High-quality transparent/white ABS plastic breadboard with adhesive backing. Features nickel-plated phosphor bronze spring clips for tight, reliable component connections.',
    specifications: {
      'Tie-Points': '830 total (630 terminal + 200 distribution)',
      'Wire Size': '21 - 26 AWG',
      'Dimensions': '16.5cm x 5.5cm x 0.85cm'
    },
    tags: ['Breadboard', 'Solderless', 'Electronics Lab', 'Prototyping'],
    perfectFor: ['Hardware Lab Circuits', 'Temporary Prototyping', 'Breadboard Layouts']
  },

  // 7. CABLES & CONNECTORS
  {
    name: '120-Piece Multicolor Dupont Jumper Wire Bundle (M-M, M-F, F-F)',
    category: 'Cables & Connectors',
    price: 199,
    originalPrice: 299,
    rating: 4.9,
    reviewsCount: 154,
    badge: 'Bestseller',
    inStock: true,
    sku: 'CC-CAB-DUPONT120',
    image: '/images/realistic/breadboard_wires.jpg',
    images: ['/images/realistic/breadboard_wires.jpg', '/images/realistic/arduino_uno.jpg'],
    description: 'Complete 3-pack assortment containing 40 Male-to-Male, 40 Male-to-Female, and 40 Female-to-Female flexible 20cm jumper wires in 10 vivid rainbow colors.',
    specifications: {
      'Total Count': '120 wires (3 sets of 40-pin ribbons)',
      'Length': '20cm each',
      'Pitch': 'Standard 2.54mm pin spacing',
      'Conductor': 'Copper-clad aluminum high flexibility'
    },
    tags: ['Jumper Wires', 'Dupont', 'Cables', 'Breadboard Wires'],
    perfectFor: ['Breadboard Hookups', 'Arduino Interfacing', 'Raspberry Pi GPIO Pinouts']
  },

  // 8. PROJECT KITS
  {
    name: 'upVolt Complete 45-in-1 IoT & Sensor Starter Kit',
    category: 'Project Kits',
    price: 1899,
    originalPrice: 2899,
    rating: 5.0,
    reviewsCount: 114,
    badge: 'Bestseller',
    inStock: true,
    sku: 'CC-KIT-STARTER45',
    image: '/images/realistic/robotcar.jpg',
    images: ['/images/realistic/robotcar.jpg', '/images/realistic/arduino_uno.jpg', '/images/realistic/breadboard_wires.jpg'],
    description: 'Everything a tech student needs in one durable organizer box: Uno R3, 16x2 LCD, Ultrasonic, Relay, Servos, Breadboard, 65 Jumper Wires, and step-by-step PDF project guide.',
    specifications: {
      'Total Components': '45+ items',
      'Container': 'Heavy-duty Dual Layer Grid Box',
      'Includes': 'Uno R3, Sensors, Cables, Displays, Actuators',
      'Bonus': 'Direct WhatsApp mentor support included'
    },
    tags: ['Complete Kit', 'All in One', 'Lab Starter', 'Top Choice'],
    perfectFor: ['Beginner Engineers', 'Semester Projects', 'Hackathons']
  }
];

export const INITIAL_PRODUCTS = RAW_PRODUCTS.map(prod => ({
  ...prod,
  ...(PRODUCT_GUIDES[prod.sku] || {})
}));
