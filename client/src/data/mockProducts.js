import { INITIAL_PRODUCTS } from '../../../server/src/data/seedData.js';

export const CATEGORIES = [
  {
    id: 'dev-boards',
    name: 'Development Boards',
    count: 24,
    image: '/images/realistic/arduino_uno.jpg',
    slug: 'Development Boards'
  },
  {
    id: 'sensors',
    name: 'Sensors',
    count: 38,
    image: '/images/realistic/ultrasonic.jpg',
    slug: 'Sensors'
  },
  {
    id: 'modules',
    name: 'Modules',
    count: 29,
    image: '/images/realistic/esp32.jpg',
    slug: 'Modules'
  },
  {
    id: 'iot-kits',
    name: 'IoT Kits',
    count: 16,
    image: '/images/realistic/robotcar.jpg',
    slug: 'IoT Kits'
  },
  {
    id: 'motors-drivers',
    name: 'Motors & Drivers',
    count: 22,
    image: '/images/realistic/motor.jpg',
    slug: 'Motors & Drivers'
  },
  {
    id: 'power-components',
    name: 'Power & Components',
    count: 34,
    image: '/images/realistic/breadboard_wires.jpg',
    slug: 'Power & Components'
  },
  {
    id: 'cables-connectors',
    name: 'Cables & Connectors',
    count: 18,
    image: '/images/realistic/breadboard_wires.jpg',
    slug: 'Cables & Connectors'
  },
  {
    id: 'project-kits',
    name: 'Project Kits',
    count: 12,
    image: '/images/realistic/robotcar.jpg',
    slug: 'Project Kits'
  }
];

export const PRODUCTS = INITIAL_PRODUCTS.map((prod, idx) => ({
  ...prod,
  _id: prod._id || prod.id || prod.sku || `mock-prod-${idx + 1}`,
  id: prod._id || prod.id || prod.sku || `mock-prod-${idx + 1}`,
}));
