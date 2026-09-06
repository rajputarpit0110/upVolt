import { API_BASE_URL, safeJson } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/reels`;

export const DEFAULT_REELS = [
  {
    id: 'reel-1',
    title: 'Soldering Custom ESP32 Smart Switch PCB',
    videoUrl: '/videos/reels/reel_soldering.mp4',
    components: ['ESP32 NodeMCU', '4-Channel Relay', 'OLED 0.96"'],
    difficulty: 'Intermediate',
    description: 'Precision soldering a compact dual-relay smart IoT switch for college hostel room automated lights and fan control.'
  },
  {
    id: 'reel-2',
    title: 'Assembling 4WD Obstacle Avoiding Robot Car',
    videoUrl: '/videos/reels/reel_robot.mp4',
    components: ['4WD Smart Chassis', 'L298N Driver', 'HC-SR04 Sensor', 'SG90 Servo'],
    difficulty: 'Beginner Friendly',
    description: 'Mounting ultrasonic sensor on a micro servo and wiring TT gear motors to the L298N driver for autonomous lab navigation.'
  },
  {
    id: 'reel-3',
    title: 'Testing IoT Sensor Node with Breadboard & PCB',
    videoUrl: '/videos/reels/reel_pcb.mp4',
    components: ['DHT11 Temp Sensor', 'Arduino Uno R3', '830-Pt Breadboard'],
    difficulty: 'Beginner',
    description: 'Live testing serial telemetry output from DHT11 humidity sensor hooked up to an Arduino Uno prototype with jumper wires.'
  },
  {
    id: 'reel-4',
    title: 'Microcontroller Pinout Wiring & Header Soldering',
    videoUrl: '/videos/reels/reel_assembly.mp4',
    components: ['STM32 Blue Pill', 'FTDI Programmer', 'Dupont Wires'],
    difficulty: 'Advanced',
    description: 'Hand soldering gold male pin headers onto STM32 Blue Pill ARM Cortex-M3 board for solderless breadboard prototyping.'
  },
  {
    id: 'reel-5',
    title: 'Multimeter Voltage Probing on Custom Power Rail',
    videoUrl: '/videos/reels/reel_testing.mp4',
    components: ['LM2596 Buck Converter', '18650 Battery Shield', 'Digital Multimeter'],
    difficulty: 'Intermediate',
    description: 'Calibrating 5V logic line voltages before powering sensitive ESP32 modules to prevent brownouts during wireless transmission.'
  }
];

/**
 * Fetch all active reels from backend with fallback
 */
export const fetchReels = async () => {
  try {
    const res = await fetch(API_BASE);
    const data = await safeJson(res);
    if (res.ok && data && data.reels && data.reels.length > 0) {
      return {
        reels: data.reels,
        count: data.count || data.reels.length,
        source: 'database'
      };
    }
    return { reels: DEFAULT_REELS, count: DEFAULT_REELS.length, source: 'fallback' };
  } catch (error) {
    console.warn('API fetch reels failed, using fallback:', error.message);
    return { reels: DEFAULT_REELS, count: DEFAULT_REELS.length, source: 'fallback' };
  }
};

/**
 * Create a new reel (Admin only)
 */
export const createReel = async (reelData, token) => {
  const headers = { 'Content-Type': 'application/json' };
  const effectiveToken = token || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(reelData)
  });

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create reel');
  }
  return data;
};

/**
 * Delete a reel by id (Admin only)
 */
export const deleteReel = async (id, token) => {
  const headers = {};
  const effectiveToken = token || localStorage.getItem('campuscircuit_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers
  });

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete reel');
  }
  return data;
};
