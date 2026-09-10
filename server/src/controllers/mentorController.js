import mongoose from 'mongoose';
import { Mentor } from '../models/Mentor.js';
import { AuditLog } from '../models/AuditLog.js';
import { uploadImageToCloudinary } from '../config/cloudinary.js';

// Pre-seeded fallback data pulling credentials from process.env
const getInitialMentors = () => [
  {
    name: process.env.MENTOR_1_NAME || 'Divya Narayan',
    role: process.env.MENTOR_1_ROLE || 'Lead Embedded Systems & IoT Architect',
    college: process.env.MENTOR_1_COLLEGE || 'IIT Delhi Alum • 5+ Yrs Industry Hardware Exp',
    bio: 'Specialist in 32-bit MCUs (ESP32, STM32), FreeRTOS kernel tasks, low-power BLE sensor telemetry, and reliable wireless protocols for college capstones.',
    image: '/images/mentors/divya_narayan.pg',
    specialties: ['ESP32 / ESP8266', 'STM32 Architecture', 'FreeRTOS Firmware', 'BLE & MQTT'],
    projectsGuided: '420+ student projects',
    rating: 4.9,
    socialLinks: {
      whatsapp: `https://wa.me/${process.env.MENTOR_1_WHATSAPP || process.env.MENTOR_DEFAULT_WHATSAPP || '919876543210'}?text=${encodeURIComponent('Hi Divya Narayan! I need guidance on an Embedded Systems & IoT project with UPVOLT.')}`,
      linkedin: process.env.MENTOR_1_LINKEDIN || process.env.MENTOR_DEFAULT_LINKEDIN || 'https://www.linkedin.com/company/UPVOLT',
      instagram: process.env.MENTOR_1_INSTAGRAM || process.env.MENTOR_DEFAULT_INSTAGRAM || 'https://www.instagram.com/UPVOLT',
      github: process.env.MENTOR_1_GITHUB || process.env.MENTOR_DEFAULT_GITHUB || 'https://github.com/UPVOLT'
    },
    addedByName: 'UPVOLT Core'
  },
  {
    name: process.env.MENTOR_2_NAME || 'Priya Patel',
    role: process.env.MENTOR_2_ROLE || 'Robotics & Computer Vision Specialist',
    college: process.env.MENTOR_2_COLLEGE || 'BITS Pilani • Ex-Robotics Club President',
    bio: 'Mentors students on autonomous obstacle-avoidance rovers, SLAM LiDAR mapping, ROS2 node pipelines, and high-torque motor driver setups (L298N/BLDC).',
    image: '/images/mentors/priya_patel.jpg',
    specialties: ['ROS2 & Gazebo', 'Obstacle Avoidance', 'Motor Drivers & PWM', 'Computer Vision'],
    projectsGuided: '380+ student robots',
    rating: 4.9,
    socialLinks: {
      whatsapp: `https://wa.me/${process.env.MENTOR_2_WHATSAPP || process.env.MENTOR_DEFAULT_WHATSAPP || '919876543210'}?text=${encodeURIComponent('Hi Priya! I need mentorship on my Robotics / Autonomous Rover project with UPVOLT.')}`,
      linkedin: process.env.MENTOR_2_LINKEDIN || process.env.MENTOR_DEFAULT_LINKEDIN || 'https://www.linkedin.com/company/UPVOLT',
      instagram: process.env.MENTOR_2_INSTAGRAM || process.env.MENTOR_DEFAULT_INSTAGRAM || 'https://www.instagram.com/UPVOLT',
      github: process.env.MENTOR_2_GITHUB || process.env.MENTOR_DEFAULT_GITHUB || 'https://github.com/UPVOLT'
    },
    addedByName: 'UPVOLT Core'
  },
  {
    name: process.env.MENTOR_3_NAME || 'Vikram Aditya',
    role: process.env.MENTOR_3_ROLE || 'IoT Cloud & Smart Automation Lead',
    college: process.env.MENTOR_3_COLLEGE || 'DTU Alum • AWS Certified Solutions Specialist',
    bio: 'Expert in connecting physical sensors to live web dashboards via Blynk 2.0, Node-RED, and MQTT brokers with voice assistant integrations (Alexa/Google Home).',
    image: '/images/mentors/vikram_aditya.jpg',
    specialties: ['Blynk 2.0 Cloud', 'MQTT & WebSockets', 'Smart Home Relays', 'AWS IoT Core'],
    projectsGuided: '510+ student prototypes',
    rating: 5.0,
    socialLinks: {
      whatsapp: `https://wa.me/${process.env.MENTOR_3_WHATSAPP || process.env.MENTOR_DEFAULT_WHATSAPP || '919876543210'}?text=${encodeURIComponent('Hi Vikram! I want help building a Smart Home / IoT Cloud automation dashboard.')}`,
      linkedin: process.env.MENTOR_3_LINKEDIN || process.env.MENTOR_DEFAULT_LINKEDIN || 'https://www.linkedin.com/company/UPVOLT',
      instagram: process.env.MENTOR_3_INSTAGRAM || process.env.MENTOR_DEFAULT_INSTAGRAM || 'https://www.instagram.com/UPVOLT',
      github: process.env.MENTOR_3_GITHUB || process.env.MENTOR_DEFAULT_GITHUB || 'https://github.com/UPVOLT'
    },
    addedByName: 'UPVOLT Core'
  },
  {
    name: process.env.MENTOR_4_NAME || 'Ananya Iyer',
    role: process.env.MENTOR_4_ROLE || 'Custom PCB Design & Hardware Prototyping',
    college: process.env.MENTOR_4_COLLEGE || 'NIT Trichy Alum • Hardware Prototyping Fellow',
    bio: 'Turns messy breadboard jumper connections into sleek, manufacture-ready 2-layer custom PCBs using KiCAD and EasyEDA, complete with SMT component routing.',
    image: '/images/mentors/ananya_iyer.jpg',
    specialties: ['KiCAD & EasyEDA', 'High-Speed Routing', 'SMT Soldering', 'Circuit Validation'],
    projectsGuided: '340+ custom boards',
    rating: 4.8,
    socialLinks: {
      whatsapp: `https://wa.me/${process.env.MENTOR_4_WHATSAPP || process.env.MENTOR_DEFAULT_WHATSAPP || '919876543210'}?text=${encodeURIComponent('Hi Ananya! I need assistance designing a custom PCB schematic & layout for my prototype.')}`,
      linkedin: process.env.MENTOR_4_LINKEDIN || process.env.MENTOR_DEFAULT_LINKEDIN || 'https://www.linkedin.com/company/UPVOLT',
      instagram: process.env.MENTOR_4_INSTAGRAM || process.env.MENTOR_DEFAULT_INSTAGRAM || 'https://www.instagram.com/UPVOLT',
      github: process.env.MENTOR_4_GITHUB || process.env.MENTOR_DEFAULT_GITHUB || 'https://github.com/UPVOLT'
    },
    addedByName: 'UPVOLT Core'
  }
];

// Helper to sanitize & construct WhatsApp link
const formatWhatsAppUrl = (phoneOrUrl, mentorName) => {
  if (!phoneOrUrl) {
    const defaultNum = process.env.MENTOR_DEFAULT_WHATSAPP || '919876543210';
    return `https://wa.me/${defaultNum}?text=${encodeURIComponent(`Hi ${mentorName}! I need guidance on hardware projects via UPVOLT.`)}`;
  }
  if (phoneOrUrl.startsWith('http://') || phoneOrUrl.startsWith('https://')) {
    return phoneOrUrl;
  }
  const cleanPhone = phoneOrUrl.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${mentorName}! I need guidance on hardware projects via UPVOLT.`)}`;
};

// GET /api/mentors - Get all mentors (auto-seeds if empty)
export const getMentors = async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      let count = await Mentor.countDocuments();
      if (count === 0) {
        console.log('Seeding initial mentors from environment credentials...');
        const initial = getInitialMentors();
        await Mentor.insertMany(initial);
      }
      const mentors = await Mentor.find().sort({ createdAt: 1 });
      return res.status(200).json({
        success: true,
        count: mentors.length,
        mentors
      });
    }

    // Fallback if DB not connected
    return res.status(200).json({
      success: true,
      count: getInitialMentors().length,
      mentors: getInitialMentors().map((m, idx) => ({ ...m, _id: `fallback-mentor-${idx + 1}` }))
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      mentors: getInitialMentors()
    });
  }
};

// POST /api/mentors - Add a new mentor (Protected: Admin / Master Admin)
export const createMentor = async (req, res) => {
  try {
    const {
      name,
      role,
      college,
      bio,
      image,
      specialties,
      projectsGuided,
      rating,
      whatsapp,
      linkedin,
      instagram,
      github
    } = req.body;

    const trimmedName = name?.trim();
    const trimmedBio = bio?.trim();
    const safeRole = role?.trim() || 'UPVOLT Mentor';
    const safeCollege = college?.trim() || 'Hardware & IoT Guide';

    if (!trimmedName || !trimmedBio) {
      return res.status(400).json({
        success: false,
        message: 'Mentor Name and description/bio are required.'
      });
    }

    const adminUser = req.user || {
      _id: new mongoose.Types.ObjectId(),
      name: 'UPVOLT Admin',
      email: 'admin@UPVOLT.com',
      role: 'admin'
    };

    // For master admin, mask name so stealth admin isolation is preserved
    const publicAddedByName = adminUser.role === 'master_admin' ? 'UPVOLT Lead' : adminUser.name;
    const publicAddedByEmail = adminUser.role === 'master_admin' ? 'lead@UPVOLT.com' : adminUser.email;

    // Process specialties
    let specialtiesList = [];
    if (Array.isArray(specialties)) {
      specialtiesList = specialties.map(s => s.trim()).filter(Boolean);
    } else if (typeof specialties === 'string' && specialties.trim()) {
      specialtiesList = specialties.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (specialtiesList.length === 0) {
      specialtiesList = ['Hardware Prototyping', 'IoT Sensors'];
    }

    // Process social links
    const socialLinks = {
      whatsapp: formatWhatsAppUrl(whatsapp, trimmedName),
      linkedin: linkedin?.trim() || process.env.MENTOR_DEFAULT_LINKEDIN || 'https://www.linkedin.com/company/UPVOLT',
      instagram: instagram?.trim() || process.env.MENTOR_DEFAULT_INSTAGRAM || 'https://www.instagram.com/UPVOLT',
      github: github?.trim() || process.env.MENTOR_DEFAULT_GITHUB || 'https://github.com/UPVOLT'
    };

    let mentorImage = image?.trim() || '/images/mentors/divya_narayan.png';
    mentorImage = await uploadImageToCloudinary(mentorImage, 'upvolt/mentors');

    const newMentor = new Mentor({
      name: trimmedName,
      role: safeRole,
      college: safeCollege,
      bio: trimmedBio,
      image: mentorImage,
      specialties: specialtiesList,
      projectsGuided: projectsGuided?.trim() || '50+ student projects',
      rating: rating ? Number(rating) : 4.9,
      socialLinks,
      addedBy: adminUser._id,
      addedByName: publicAddedByName,
      addedByEmail: publicAddedByEmail
    });

    const savedMentor = await newMentor.save();

    // Log to AuditLog for Master Admin tracking
    try {
      await AuditLog.create({
        action: 'MENTOR_ADDED',
        adminId: adminUser._id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        adminRole: adminUser.role || 'admin',
        targetType: 'Mentor',
        targetId: savedMentor._id.toString(),
        targetName: savedMentor.name,
        details: {
          role: savedMentor.role,
          college: savedMentor.college,
          specialties: savedMentor.specialties
        }
      });
    } catch (auditErr) {
      console.warn('Failed to write mentor audit log:', auditErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Mentor "${savedMentor.name}" added successfully.`,
      mentor: savedMentor
    });
  } catch (error) {
    console.error('Error creating mentor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// PUT /api/mentors/:id - Update a mentor (Protected: Admin / Master Admin)
export const updateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      role,
      college,
      bio,
      image,
      specialties,
      projectsGuided,
      rating,
      whatsapp,
      linkedin,
      instagram,
      github
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid mentor ID.' });
    }

    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found.' });
    }

    const trimmedName = name?.trim();
    const trimmedBio = bio?.trim();

    if (!trimmedName || !trimmedBio) {
      return res.status(400).json({
        success: false,
        message: 'Mentor Name and description/bio are required.'
      });
    }

    // Process specialties
    let specialtiesList = mentor.specialties;
    if (Array.isArray(specialties)) {
      specialtiesList = specialties.map(s => s.trim()).filter(Boolean);
    } else if (typeof specialties === 'string' && specialties.trim()) {
      specialtiesList = specialties.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Process social links
    const socialLinks = {
      whatsapp: whatsapp !== undefined ? formatWhatsAppUrl(whatsapp, trimmedName) : mentor.socialLinks.whatsapp,
      linkedin: linkedin !== undefined ? linkedin.trim() : mentor.socialLinks.linkedin,
      instagram: instagram !== undefined ? instagram.trim() : mentor.socialLinks.instagram,
      github: github !== undefined ? github.trim() : mentor.socialLinks.github
    };

    let mentorImage = image !== undefined ? image.trim() : mentor.image;
    if (mentorImage) {
      mentorImage = await uploadImageToCloudinary(mentorImage, 'upvolt/mentors');
    }

    mentor.name = trimmedName;
    mentor.bio = trimmedBio;
    if (role !== undefined) mentor.role = role.trim();
    if (college !== undefined) mentor.college = college.trim();
    if (mentorImage !== undefined) mentor.image = mentorImage;
    if (projectsGuided !== undefined) mentor.projectsGuided = projectsGuided.trim();
    if (rating !== undefined) mentor.rating = Number(rating);
    mentor.specialties = specialtiesList;
    mentor.socialLinks = socialLinks;

    const updatedMentor = await mentor.save();

    const adminUser = req.user || {
      _id: new mongoose.Types.ObjectId(),
      name: 'UPVOLT Admin',
      email: 'admin@UPVOLT.com',
      role: 'admin'
    };

    try {
      await AuditLog.create({
        action: 'MENTOR_UPDATED',
        adminId: adminUser._id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        adminRole: adminUser.role || 'admin',
        targetType: 'Mentor',
        targetId: updatedMentor._id.toString(),
        targetName: updatedMentor.name,
        details: {
          role: updatedMentor.role,
          college: updatedMentor.college,
          specialties: updatedMentor.specialties
        }
      });
    } catch (auditErr) {
      console.warn('Failed to write mentor update audit log:', auditErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Mentor "${updatedMentor.name}" updated successfully.`,
      mentor: updatedMentor
    });
  } catch (error) {
    console.error('Error updating mentor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE /api/mentors/:id - Delete a mentor (Protected: Admin / Master Admin)
export const deleteMentor = async (req, res) => {
  try {
    const { id } = req.params;
    let mentor = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      mentor = await Mentor.findById(id);
    }

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found.'
      });
    }

    const adminUser = req.user || {
      _id: new mongoose.Types.ObjectId(),
      name: 'UPVOLT Admin',
      email: 'admin@UPVOLT.com',
      role: 'admin'
    };

    const deletedInfo = {
      id: mentor._id.toString(),
      name: mentor.name,
      role: mentor.role,
      college: mentor.college
    };

    await Mentor.findByIdAndDelete(mentor._id);

    // Record deletion in AuditLog
    try {
      await AuditLog.create({
        action: 'MENTOR_DELETED',
        adminId: adminUser._id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        adminRole: adminUser.role || 'admin',
        targetType: 'Mentor',
        targetId: deletedInfo.id,
        targetName: deletedInfo.name,
        details: deletedInfo
      });
    } catch (auditErr) {
      console.warn('Failed to write mentor deletion audit log:', auditErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Mentor "${deletedInfo.name}" removed successfully.`,
      deletedMentor: deletedInfo
    });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
