import mongoose from 'mongoose';
import { Reel } from '../models/Reel.js';
import { AuditLog } from '../models/AuditLog.js';

// Pre-seeded starter reels
const getInitialReels = () => [
  {
    title: 'Soldering Custom ESP32 Smart Switch PCB',
    videoUrl: '/videos/reels/reel_soldering.mp4',
    components: ['ESP32 NodeMCU', '4-Channel Relay', 'OLED 0.96"'],
    difficulty: 'Intermediate',
    description: 'Precision soldering a compact dual-relay smart IoT switch for college hostel room automated lights and fan control.',
    addedByName: 'upVolt Core'
  },
  {
    title: 'Assembling 4WD Obstacle Avoiding Robot Car',
    videoUrl: '/videos/reels/reel_robot.mp4',
    components: ['4WD Smart Chassis', 'L298N Driver', 'HC-SR04 Sensor', 'SG90 Servo'],
    difficulty: 'Beginner Friendly',
    description: 'Mounting ultrasonic sensor on a micro servo and wiring TT gear motors to the L298N driver for autonomous lab navigation.',
    addedByName: 'upVolt Core'
  },
  {
    title: 'Testing IoT Sensor Node with Breadboard & PCB',
    videoUrl: '/videos/reels/reel_pcb.mp4',
    components: ['DHT11 Temp Sensor', 'Arduino Uno R3', '830-Pt Breadboard'],
    difficulty: 'Beginner',
    description: 'Live testing serial telemetry output from DHT11 humidity sensor hooked up to an Arduino Uno prototype with jumper wires.',
    addedByName: 'upVolt Core'
  },
  {
    title: 'Microcontroller Pinout Wiring & Header Soldering',
    videoUrl: '/videos/reels/reel_assembly.mp4',
    components: ['STM32 Blue Pill', 'FTDI Programmer', 'Dupont Wires'],
    difficulty: 'Advanced',
    description: 'Hand soldering gold male pin headers onto STM32 Blue Pill ARM Cortex-M3 board for solderless breadboard prototyping.',
    addedByName: 'upVolt Core'
  },
  {
    title: 'Multimeter Voltage Probing on Custom Power Rail',
    videoUrl: '/videos/reels/reel_testing.mp4',
    components: ['LM2596 Buck Converter', '18650 Battery Shield', 'Digital Multimeter'],
    difficulty: 'Intermediate',
    description: 'Calibrating 5V logic line voltages before powering sensitive ESP32 modules to prevent brownouts during wireless transmission.',
    addedByName: 'upVolt Core'
  }
];

// GET /api/reels - Fetch all active reels (auto-seeds if empty)
export const getReels = async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      let count = await Reel.countDocuments();
      if (count === 0) {
        console.log('Seeding initial maker reels...');
        await Reel.insertMany(getInitialReels());
      }
      const reels = await Reel.find({ isActive: true }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: reels.length,
        reels
      });
    }

    // Fallback if DB not connected
    return res.status(200).json({
      success: true,
      count: getInitialReels().length,
      reels: getInitialReels().map((r, idx) => ({ ...r, _id: `fallback-reel-${idx + 1}` }))
    });
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      reels: getInitialReels()
    });
  }
};

// POST /api/reels - Add a new reel (Protected: Admin / Master Admin)
export const createReel = async (req, res) => {
  try {
    const {
      title,
      videoUrl,
      components,
      difficulty,
      description
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reel title is required.'
      });
    }

    if (!videoUrl || !videoUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Video URL or file path is required.'
      });
    }

    // Process components array
    let processedComponents = [];
    if (Array.isArray(components)) {
      processedComponents = components.map(c => typeof c === 'string' ? c.trim() : '').filter(Boolean);
    } else if (typeof components === 'string' && components.trim()) {
      processedComponents = components.split(',').map(c => c.trim()).filter(Boolean);
    }

    const adminUser = req.user || {
      _id: new mongoose.Types.ObjectId(),
      name: 'upVolt Admin',
      email: 'admin@upvolt.in',
      role: 'admin',
      username: 'admin'
    };

    const newReel = new Reel({
      title: title.trim(),
      videoUrl: videoUrl.trim(),
      components: processedComponents,
      difficulty: difficulty || 'Intermediate',
      description: description ? description.trim() : '',
      addedByName: adminUser.name || 'upVolt Admin',
      addedByUsername: adminUser.username || ''
    });

    const savedReel = await newReel.save();

    // Audit log
    try {
      await AuditLog.create({
        action: 'REEL_CREATED',
        adminId: adminUser._id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        adminRole: adminUser.role || 'admin',
        targetType: 'Reel',
        targetId: savedReel._id.toString(),
        targetName: savedReel.title,
        details: {
          title: savedReel.title,
          difficulty: savedReel.difficulty,
          components: savedReel.components
        }
      });
    } catch (auditErr) {
      console.warn('Failed to write reel audit log:', auditErr.message);
    }

    return res.status(201).json({
      success: true,
      message: `Reel "${savedReel.title}" added successfully.`,
      reel: savedReel
    });
  } catch (error) {
    console.error('Error creating reel:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create reel.'
    });
  }
};

// DELETE /api/reels/:id - Delete a reel (Protected: Admin / Master Admin)
export const deleteReel = async (req, res) => {
  try {
    const { id } = req.params;
    let reel = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      reel = await Reel.findById(id);
    }

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found.'
      });
    }

    const adminUser = req.user || {
      _id: new mongoose.Types.ObjectId(),
      name: 'upVolt Admin',
      email: 'admin@upvolt.in',
      role: 'admin'
    };

    const deletedInfo = {
      id: reel._id.toString(),
      title: reel.title,
      difficulty: reel.difficulty
    };

    await Reel.findByIdAndDelete(reel._id);

    // Audit log
    try {
      await AuditLog.create({
        action: 'REEL_DELETED',
        adminId: adminUser._id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        adminRole: adminUser.role || 'admin',
        targetType: 'Reel',
        targetId: deletedInfo.id,
        targetName: deletedInfo.title,
        details: deletedInfo
      });
    } catch (auditErr) {
      console.warn('Failed to write reel deletion audit log:', auditErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Reel "${deletedInfo.title}" deleted successfully.`,
      deletedReel: deletedInfo
    });
  } catch (error) {
    console.error('Error deleting reel:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete reel.'
    });
  }
};
