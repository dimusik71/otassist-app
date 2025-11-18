import { db } from './src/db';

const equipment = [
  // Mobility Aids
  { name: "Walking Frame", category: "mobility", price: 89.95, description: "Adjustable height walking frame with wheels", governmentApproved: true, approvalReference: "NDIS-MOB-001" },
  { name: "Wheelchair - Manual", category: "mobility", price: 450.00, description: "Lightweight manual wheelchair", governmentApproved: true, approvalReference: "NDIS-MOB-002" },
  { name: "Walking Cane", category: "mobility", price: 29.95, description: "Adjustable walking cane with non-slip grip", governmentApproved: true, approvalReference: "NDIS-MOB-003" },
  
  // Bathroom Safety
  { name: "Grab Rail - 600mm", category: "bathroom", price: 65.00, description: "Stainless steel bathroom grab rail", governmentApproved: true, approvalReference: "NDIS-BTH-001" },
  { name: "Shower Chair", category: "bathroom", price: 125.00, description: "Height adjustable shower chair with backrest", governmentApproved: true, approvalReference: "NDIS-BTH-002" },
  { name: "Raised Toilet Seat", category: "bathroom", price: 75.00, description: "Elevated toilet seat with armrests", governmentApproved: true, approvalReference: "NDIS-BTH-003" },
  { name: "Non-Slip Bath Mat", category: "bathroom", price: 35.00, description: "Anti-slip mat for bath/shower", governmentApproved: false },
  
  // Bedroom
  { name: "Bed Rail", category: "bedroom", price: 95.00, description: "Adjustable bed safety rail", governmentApproved: true, approvalReference: "NDIS-BED-001" },
  { name: "Overbed Table", category: "bedroom", price: 145.00, description: "Height adjustable overbed table with wheels", governmentApproved: true, approvalReference: "NDIS-BED-002" },
  { name: "Pressure Relief Cushion", category: "bedroom", price: 89.00, description: "Memory foam pressure relief cushion", governmentApproved: true, approvalReference: "NDIS-BED-003" },
  
  // Assistive Technology
  { name: "Medication Dispenser", category: "assistive_tech", price: 125.00, description: "Automatic medication dispenser with alarms", governmentApproved: false },
  { name: "Large Button Phone", category: "assistive_tech", price: 65.00, description: "Phone with large buttons and amplified sound", governmentApproved: false },
  { name: "Personal Alarm", category: "assistive_tech", price: 45.00, description: "Wearable personal emergency alarm", governmentApproved: true, approvalReference: "NDIS-AST-001" },
];

async function seedEquipment() {
  console.log('Seeding equipment...');
  
  for (const item of equipment) {
    await db.equipmentItem.create({
      data: {
        ...item,
        brand: "Healthcare Solutions",
      }
    });
  }
  
  console.log(`✓ Seeded ${equipment.length} equipment items`);
}

seedEquipment().catch(console.error).finally(() => process.exit(0));
