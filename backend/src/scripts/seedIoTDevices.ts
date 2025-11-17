import { db } from "../db";

/**
 * Seed script to populate IoT Device Library with common assistive tech and smart home devices
 * Run with: bun run src/scripts/seedIoTDevices.ts
 */

const iotDevices = [
  // Safety Devices
  {
    name: "Smart Fall Detection Sensor",
    manufacturer: "Vayyar",
    model: "Care",
    category: "safety",
    deviceType: "fall_detector",
    description: "AI-powered fall detection without wearables. Detects falls and alerts caregivers instantly.",
    technicalSpecs: {
      connectivity: "WiFi",
      power: "AC powered",
      range: "5m radius",
      dimensions: "14cm x 14cm x 3cm",
      weight: "250g",
      mounting: "wall or ceiling",
      waterproof: false,
    },
    placementRules: {
      idealHeight: 2.4,
      minDistance: 0.5,
      maxDistance: 5,
      avoidAreas: ["behind furniture", "near heat sources"],
      requirements: ["clear line of sight", "WiFi coverage"],
    },
    coverageArea: 78.5, // π * 5^2
    powerRequirements: "ac_power",
    connectivity: "wifi",
    price: 299,
    installationCost: 150,
    subscriptionCost: 29.99,
    subscriptionType: "monthly",
    approvedFor: ["ndis", "dva"],
  },
  {
    name: "Emergency Call Button",
    manufacturer: "Pers",
    model: "Guardian Pro",
    category: "safety",
    deviceType: "emergency_button",
    description: "Waterproof wearable emergency button with two-way voice communication.",
    technicalSpecs: {
      connectivity: "Cellular + WiFi",
      power: "Rechargeable battery (7 day life)",
      range: "Nationwide cellular",
      dimensions: "5cm x 4cm x 1.5cm",
      weight: "45g",
      mounting: "wearable (pendant or wristband)",
      waterproof: true,
    },
    placementRules: {
      requirements: ["cellular or WiFi coverage", "worn by user"],
    },
    coverageArea: null,
    powerRequirements: "battery",
    connectivity: "cellular",
    price: 199,
    installationCost: 0,
    subscriptionCost: 39.99,
    subscriptionType: "monthly",
    approvedFor: ["ndis", "dva", "insurance"],
  },
  {
    name: "Smart Smoke & CO Detector",
    manufacturer: "Nest",
    model: "Protect",
    category: "safety",
    deviceType: "smoke_detector",
    description: "Smart smoke and carbon monoxide detector with voice alerts and smartphone notifications.",
    technicalSpecs: {
      connectivity: "WiFi",
      power: "Battery (5 year life)",
      range: "Single room",
      dimensions: "13.5cm diameter x 4cm depth",
      weight: "380g",
      mounting: "ceiling or wall",
      waterproof: false,
    },
    placementRules: {
      idealHeight: 2.4,
      requirements: ["one per floor minimum", "near sleeping areas", "WiFi coverage"],
      avoidAreas: ["near bathrooms", "near cooking areas"],
    },
    coverageArea: 20,
    powerRequirements: "battery",
    connectivity: "wifi",
    price: 149,
    installationCost: 80,
    subscriptionCost: 0,
    subscriptionType: "one_time",
    approvedFor: [],
  },

  // Security Devices
  {
    name: "Smart Doorbell Camera",
    manufacturer: "Ring",
    model: "Video Doorbell Pro 2",
    category: "security",
    deviceType: "camera",
    description: "HD video doorbell with two-way talk, motion detection, and night vision.",
    technicalSpecs: {
      connectivity: "WiFi",
      power: "Hardwired or battery",
      range: "160° field of view",
      dimensions: "12.7cm x 6.4cm x 2.5cm",
      weight: "200g",
      mounting: "doorframe",
      waterproof: true,
    },
    placementRules: {
      idealHeight: 1.2,
      requirements: ["WiFi coverage", "view of entrance"],
    },
    coverageArea: 5,
    powerRequirements: "ac_power",
    connectivity: "wifi",
    price: 329,
    installationCost: 120,
    subscriptionCost: 4.99,
    subscriptionType: "monthly",
    approvedFor: [],
  },
  {
    name: "Smart Door/Window Sensor",
    manufacturer: "Samsung",
    model: "SmartThings",
    category: "security",
    deviceType: "door_sensor",
    description: "Wireless sensor to monitor doors and windows, with instant alerts.",
    technicalSpecs: {
      connectivity: "Zigbee",
      power: "Battery (1 year life)",
      range: "10m from hub",
      dimensions: "5cm x 2cm x 1cm",
      weight: "15g",
      mounting: "adhesive or screws",
      waterproof: false,
    },
    placementRules: {
      requirements: ["Zigbee hub nearby", "flat mounting surface"],
    },
    coverageArea: null,
    powerRequirements: "battery",
    connectivity: "zigbee",
    price: 29,
    installationCost: 40,
    subscriptionCost: 0,
    subscriptionType: "one_time",
    approvedFor: [],
  },
  {
    name: "Smart Lock",
    manufacturer: "August",
    model: "Smart Lock Pro",
    category: "security",
    deviceType: "smart_lock",
    description: "Retrofit smart lock with auto-lock, remote access, and guest access codes.",
    technicalSpecs: {
      connectivity: "WiFi + Bluetooth",
      power: "Battery (6 month life)",
      range: "N/A",
      dimensions: "8cm x 8cm x 6cm",
      weight: "450g",
      mounting: "existing deadbolt",
      waterproof: false,
    },
    placementRules: {
      requirements: ["compatible deadbolt", "WiFi coverage"],
    },
    coverageArea: null,
    powerRequirements: "battery",
    connectivity: "wifi",
    price: 279,
    installationCost: 150,
    subscriptionCost: 0,
    subscriptionType: "one_time",
    approvedFor: [],
  },

  // Accessibility Devices
  {
    name: "Voice Assistant Hub",
    manufacturer: "Amazon",
    model: "Echo Show 10",
    category: "accessibility",
    deviceType: "voice_assistant",
    description: "Smart display with Alexa voice control, video calling, and home automation.",
    technicalSpecs: {
      connectivity: "WiFi",
      power: "AC powered",
      range: "N/A",
      dimensions: "25cm x 23cm x 17cm",
      weight: "2.6kg",
      mounting: "countertop",
      waterproof: false,
    },
    placementRules: {
      idealHeight: 0.9,
      requirements: ["WiFi coverage", "accessible surface", "power outlet"],
    },
    coverageArea: 10,
    powerRequirements: "ac_power",
    connectivity: "wifi",
    price: 349,
    installationCost: 50,
    subscriptionCost: 0,
    subscriptionType: "one_time",
    approvedFor: ["ndis"],
  },
  {
    name: "Medication Reminder Device",
    manufacturer: "MedMinder",
    model: "Maya",
    category: "health",
    deviceType: "medication_reminder",
    description: "Automated pill dispenser with reminders, alerts, and caregiver notifications.",
    technicalSpecs: {
      connectivity: "Cellular",
      power: "AC powered with battery backup",
      range: "N/A",
      dimensions: "20cm x 15cm x 10cm",
      weight: "800g",
      mounting: "countertop",
      waterproof: false,
    },
    placementRules: {
      idealHeight: 0.9,
      requirements: ["cellular coverage", "power outlet", "accessible location"],
    },
    coverageArea: null,
    powerRequirements: "ac_power",
    connectivity: "cellular",
    price: 399,
    installationCost: 80,
    subscriptionCost: 39.99,
    subscriptionType: "monthly",
    approvedFor: ["ndis", "dva"],
  },

  // Lighting Devices
  {
    name: "Smart Motion-Activated Night Light",
    manufacturer: "Philips",
    model: "Hue Motion Sensor",
    category: "lighting",
    deviceType: "motion_sensor",
    description: "Wireless motion sensor that automatically turns on lights, ideal for hallways and bathrooms.",
    technicalSpecs: {
      connectivity: "Zigbee",
      power: "Battery (2 year life)",
      range: "5m detection",
      dimensions: "5cm diameter x 2.5cm depth",
      weight: "50g",
      mounting: "wall or shelf",
      waterproof: false,
    },
    placementRules: {
      idealHeight: 1.5,
      requirements: ["Zigbee hub", "paired with smart lights"],
      avoidAreas: ["near windows", "direct sunlight"],
    },
    coverageArea: 19.6,
    powerRequirements: "battery",
    connectivity: "zigbee",
    price: 49,
    installationCost: 40,
    subscriptionCost: 0,
    subscriptionType: "one_time",
    approvedFor: [],
  },
  {
    name: "Smart LED Bulb",
    manufacturer: "Philips",
    model: "Hue White & Color",
    category: "lighting",
    deviceType: "smart_light",
    description: "Color-changing smart bulb with dimming, scheduling, and voice control.",
    technicalSpecs: {
      connectivity: "Zigbee",
      power: "AC powered (standard socket)",
      range: "N/A",
      dimensions: "11cm x 6cm diameter",
      weight: "100g",
      mounting: "standard light socket",
      waterproof: false,
    },
    placementRules: {
      requirements: ["Zigbee hub", "standard E26/E27 socket"],
    },
    coverageArea: null,
    powerRequirements: "ac_power",
    connectivity: "zigbee",
    price: 59,
    installationCost: 30,
    subscriptionCost: 0,
    subscriptionType: "one_time",
    approvedFor: [],
  },

  // Climate Control
  {
    name: "Smart Thermostat",
    manufacturer: "Nest",
    model: "Learning Thermostat",
    category: "climate",
    deviceType: "thermostat",
    description: "Self-learning smart thermostat with energy savings and remote control.",
    technicalSpecs: {
      connectivity: "WiFi",
      power: "Hardwired or battery",
      range: "N/A",
      dimensions: "8.4cm diameter x 3.2cm depth",
      weight: "200g",
      mounting: "wall (replaces existing thermostat)",
      waterproof: false,
    },
    placementRules: {
      idealHeight: 1.5,
      requirements: ["WiFi coverage", "compatible HVAC system", "away from direct sunlight/drafts"],
    },
    coverageArea: null,
    powerRequirements: "ac_power",
    connectivity: "wifi",
    price: 249,
    installationCost: 180,
    subscriptionCost: 0,
    subscriptionType: "one_time",
    approvedFor: [],
  },

  // Comfort/Health
  {
    name: "Water Leak Detector",
    manufacturer: "Aqara",
    model: "Water Leak Sensor",
    category: "safety",
    deviceType: "water_leak_detector",
    description: "Detects water leaks and sends instant alerts to prevent damage.",
    technicalSpecs: {
      connectivity: "Zigbee",
      power: "Battery (2 year life)",
      range: "10m from hub",
      dimensions: "5cm x 5cm x 1.5cm",
      weight: "30g",
      mounting: "floor placement",
      waterproof: true,
    },
    placementRules: {
      idealHeight: 0,
      requirements: ["Zigbee hub", "placed on floor near potential leak sources"],
      recommendedLocations: ["under sinks", "near water heaters", "washing machines", "bathrooms"],
    },
    coverageArea: 0.25,
    powerRequirements: "battery",
    connectivity: "zigbee",
    price: 29,
    installationCost: 30,
    subscriptionCost: 0,
    subscriptionType: "one_time",
    approvedFor: [],
  },
];

async function seedIoTDevices() {
  console.log("🌱 Starting IoT Device Library seeding...");

  try {
    // Check if devices already exist
    const existingCount = await db.ioTDeviceLibrary.count();

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing devices. Skipping seed to avoid duplicates.`);
      console.log("   To re-seed, first delete existing devices from the database.");
      return;
    }

    // Create devices
    for (const device of iotDevices) {
      await db.ioTDeviceLibrary.create({
        data: {
          ...device,
          technicalSpecs: JSON.stringify(device.technicalSpecs),
          placementRules: JSON.stringify(device.placementRules),
          approvedFor: device.approvedFor.length > 0 ? JSON.stringify(device.approvedFor) : null,
        },
      });
      console.log(`✅ Created: ${device.name}`);
    }

    console.log(`\n🎉 Successfully seeded ${iotDevices.length} IoT devices!`);
    console.log("\nDevice categories:");
    console.log("  - Safety: 4 devices");
    console.log("  - Security: 3 devices");
    console.log("  - Accessibility: 1 device");
    console.log("  - Health: 1 device");
    console.log("  - Lighting: 2 devices");
    console.log("  - Climate: 1 device");

  } catch (error) {
    console.error("❌ Error seeding IoT devices:", error);
    throw error;
  }
}

// Run the seed function
seedIoTDevices()
  .then(() => {
    console.log("\n✨ Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
