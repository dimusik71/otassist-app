/**
 * Clinical Assessment Forms
 * Based on Australian Standards, NDIS Practice Standards, and Aged Care Quality Standards
 * Includes Falls Risk, Movement & Mobility, and Functional Assessments
 */

import type { AssessmentSection } from "./assessmentForm";

/**
 * FALLS RISK ASSESSMENT
 * Based on:
 * - Falls Risk Assessment Tool (FRAT)
 * - Aged Care Quality Standard 3
 * - NDIS Practice Standards
 */
export const FALLS_RISK_ASSESSMENT: AssessmentSection[] = [
  {
    id: "falls_history",
    title: "Falls History",
    description: "Previous falls and circumstances",
    icon: "history",
    questions: [
      {
        id: "falls_1",
        question: "Has the client experienced any falls in the past 12 months?",
        description: "Number and circumstances",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Analyze falls history. Multiple falls (2+) indicate high risk. Document frequency, locations, circumstances, injuries sustained, and whether medical attention was required. Identify patterns and contributing factors.",
      },
      {
        id: "falls_2",
        question: "Were any injuries sustained from previous falls?",
        type: "text",
        requiresMedia: true,
        aiPrompt: "Document injury severity from falls. Fractures, head injuries, or hospitalization indicate serious consequences. Assess current injury healing and impact on function and confidence.",
      },
      {
        id: "falls_3",
        question: "Does the client express fear of falling?",
        description: "Fear can lead to reduced activity and deconditioning",
        type: "yes_no",
        requiresMedia: false,
        aiPrompt: "Assess fear of falling and its impact on activity levels. Fear-related activity restriction leads to deconditioning, further increasing fall risk. This may require psychological support and confidence-building interventions.",
      },
      {
        id: "falls_4",
        question: "What activities or situations does the client avoid due to fall concern?",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Identify activity restrictions due to fall fear. Common avoidances: showering alone, stairs, going outside, bending. Assess impact on independence and quality of life. Recommend graded exposure therapy.",
      },
    ],
  },
  {
    id: "falls_mobility",
    title: "Mobility & Balance",
    description: "Physical function and stability assessment",
    icon: "activity",
    questions: [
      {
        id: "falls_mob_1",
        question: "Perform Timed Up and Go (TUG) Test",
        description: "Time to stand from chair, walk 3m, return, and sit. >12 seconds = fall risk",
        type: "text",
        requiresMedia: true,
        aiPrompt: "Analyze TUG test performance in this video. Score: <10s=normal, 10-12s=borderline, >12s=high fall risk. Observe gait pattern, balance, transfers, and use of arms. Document time and observations.",
      },
      {
        id: "falls_mob_2",
        question: "Can the client stand from a chair without using arms?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess sit-to-stand transfer. Inability to rise without arm support indicates lower limb weakness and increased fall risk. Observe technique, speed, and stability. Recommend strength training if deficient.",
      },
      {
        id: "falls_mob_3",
        question: "Can the client maintain balance while standing on one leg?",
        description: "Each leg for 5 seconds",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate single-leg stance balance. Inability to maintain 5 seconds indicates balance impairment and fall risk. Compare left vs right. Recommend balance exercises and consider referral to physiotherapy.",
      },
      {
        id: "falls_mob_4",
        question: "Observe gait pattern and note any abnormalities",
        description: "Shuffling, wide base, unsteadiness, asymmetry",
        type: "text",
        requiresMedia: true,
        aiPrompt: "Analyze gait in this video. Assess: step length, width, symmetry, foot clearance, trunk stability, arm swing. Identify abnormalities: shuffling, dragging, limping, wide base, reduced speed. Each indicates specific fall risks.",
      },
      {
        id: "falls_mob_5",
        question: "Does the client use a mobility aid?",
        description: "Type and appropriateness",
        type: "multiple_choice",
        options: ["No aid", "Single cane", "Quad cane", "Walker (wheeled)", "Walker (non-wheeled)", "Wheelchair"],
        requiresMedia: true,
        aiPrompt: "Assess mobility aid suitability. Is it: correct height, proper fit, used correctly, well-maintained? Does the aid match the client's needs or should it be upgraded/downgraded? Provide recommendations.",
      },
      {
        id: "falls_mob_6",
        question: "Perform Functional Reach Test",
        description: "Forward reach distance while standing. <15cm = high fall risk",
        type: "text",
        requiresMedia: true,
        aiPrompt: "Measure functional reach in this video/photo. Normal: >25cm, Moderate risk: 15-25cm, High risk: <15cm. Limited reach indicates balance impairment. Recommend balance training and environmental modifications.",
      },
    ],
  },
  {
    id: "falls_medical",
    title: "Medical Risk Factors",
    description: "Health conditions contributing to fall risk",
    icon: "heart-pulse",
    questions: [
      {
        id: "falls_med_1",
        question: "List all current medications",
        description: "Particular focus on 4+ medications or high-risk drugs",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Analyze medications for fall risk. High-risk classes: sedatives, antihypertensives, antidepressants, antipsychotics, opioids. Polypharmacy (4+ drugs) increases risk. Recommend medication review by GP or pharmacist.",
      },
      {
        id: "falls_med_2",
        question: "Does the client experience dizziness or lightheadedness?",
        description: "Especially with position changes",
        type: "yes_no",
        requiresMedia: false,
        aiPrompt: "Assess for orthostatic hypotension and vestibular dysfunction. Dizziness with standing, head turning, or in mornings suggests postural hypotension. Recommend medical review, hydration, compression stockings, and slow position changes.",
      },
      {
        id: "falls_med_3",
        question: "Does the client have any visual impairments?",
        description: "Cataracts, glaucoma, reduced acuity, depth perception",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Document visual deficits. Poor vision increases fall risk 2-3 times. Assess: acuity, peripheral vision, depth perception, glare sensitivity. Recommend optometry review, updated glasses, improved home lighting.",
      },
      {
        id: "falls_med_4",
        question: "Does the client have any diagnosed conditions affecting balance or mobility?",
        description: "Parkinson's, stroke, arthritis, neuropathy, etc.",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Identify conditions increasing fall risk: neurological (Parkinson's, stroke, MS), musculoskeletal (arthritis, osteoporosis), cardiovascular (arrhythmias), metabolic (diabetes with neuropathy). Link to specific interventions.",
      },
      {
        id: "falls_med_5",
        question: "Does the client experience urinary urgency or frequency?",
        description: "Rushing to toilet is a common fall situation",
        type: "yes_no",
        requiresMedia: false,
        aiPrompt: "Assess toileting-related fall risk. Urinary urgency leads to rushing, night-time falls, and reduced fluid intake (causing orthostatic issues). Recommend: commode, urinal, pelvic floor exercises, medical review, night lighting.",
      },
      {
        id: "falls_med_6",
        question: "Record blood pressure (sitting and standing)",
        description: "Check for orthostatic hypotension (drop >20mmHg systolic)",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Analyze blood pressure readings. Orthostatic hypotension (drop ≥20mmHg systolic or ≥10mmHg diastolic within 3 minutes of standing) significantly increases fall risk. Requires medical management and postural strategies.",
      },
    ],
  },
  {
    id: "falls_environment",
    title: "Environmental Hazards",
    description: "Home safety and fall hazards",
    icon: "home",
    questions: [
      {
        id: "falls_env_1",
        question: "Are there loose mats, rugs, or floor coverings?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Identify trip hazards in flooring. Loose rugs are a major fall cause. Assess: rug edges, transitions, carpet condition, electrical cords. Recommend: removal, non-slip backing, cord management, or floor repairs.",
      },
      {
        id: "falls_env_2",
        question: "Is lighting adequate throughout the home?",
        description: "Including night lights for bedroom-bathroom path",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate lighting for fall prevention. Assess: overall brightness, switches at room entry/exit, night lights for bathroom path, stair lighting, glare reduction. Poor lighting doubles fall risk. Provide specific recommendations.",
      },
      {
        id: "falls_env_3",
        question: "Are stairs safe with handrails and good condition?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess stair safety. Check: bilateral handrails, contrast marking on edges, even rise/tread, good lighting, no clutter. Stairs account for 25% of fall-related injuries. Document specific hazards and solutions.",
      },
      {
        id: "falls_env_4",
        question: "Are grab rails installed in bathroom (toilet and shower)?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate bathroom grab rail installation. Bathrooms are high-risk fall locations (wet surfaces, transfers). Assess: rail locations, mounting security, placement for specific activities. Recommend additional rails.",
      },
      {
        id: "falls_env_5",
        question: "Is footwear appropriate and safe?",
        description: "Enclosed, non-slip, supportive, correct fit",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess footwear safety. Unsafe footwear (slippers, loose shoes, socks only) significantly increases fall risk. Recommend: enclosed shoes, non-slip soles, firm heel counter, proper fit, low heel height (<2cm).",
      },
      {
        id: "falls_env_6",
        question: "Are frequently used items stored within easy reach?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate storage accessibility. Reaching overhead or bending to floor increases fall risk. Assess: kitchen items, clothing, bathroom supplies. Recommend reorganization to place daily items at waist-to-shoulder height.",
      },
    ],
  },
  {
    id: "falls_score",
    title: "Falls Risk Score & Plan",
    description: "Risk stratification and intervention planning",
    icon: "clipboard-list",
    questions: [
      {
        id: "falls_score_1",
        question: "Overall Falls Risk Rating",
        description: "Low, Moderate, or High based on assessment findings",
        type: "multiple_choice",
        options: ["Low risk (0-1 risk factors)", "Moderate risk (2-3 risk factors)", "High risk (4+ risk factors or fall history)"],
        requiresMedia: false,
        aiPrompt: "Calculate overall fall risk score. Risk factors: prior falls, medications, gait/balance issues, vision problems, environmental hazards, medical conditions. High risk requires immediate intervention. Provide risk stratification rationale.",
      },
      {
        id: "falls_score_2",
        question: "Priority interventions recommended",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Develop prioritized falls prevention plan. Address: highest risk factors first, quick wins (environmental modifications), medium-term (exercise programs), long-term (strength/balance training). Include timelines and responsible parties.",
      },
      {
        id: "falls_score_3",
        question: "Referrals required",
        description: "Physiotherapy, GP, optometry, podiatry, OT, pharmacist",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Identify appropriate referrals. Physiotherapy: balance/strength training. GP: medication review, orthostatic hypotension. Optometry: vision. Podiatry: footwear, foot problems. OT: home modifications. Pharmacist: medication rationalization.",
      },
      {
        id: "falls_score_4",
        question: "Equipment recommended",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Specify equipment needs for fall prevention: mobility aids (walker, cane), bathroom equipment (grab rails, shower chair, raised toilet), bed safety (bed rail, height adjustment), lighting (night lights, motion sensors), personal alarm.",
      },
      {
        id: "falls_score_5",
        question: "Follow-up and review timeline",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Establish review schedule. High risk: 1-2 weeks for urgent modifications, monthly for first 3 months. Moderate risk: 6-8 weeks. Low risk: 3-6 months. Document follow-up plan and monitoring strategy.",
      },
    ],
  },
];

/**
 * MOVEMENT & MOBILITY ASSESSMENT
 * Based on:
 * - Functional Independence Measure (FIM)
 * - Barthel Index
 * - Modified Rankin Scale
 */
export const MOVEMENT_MOBILITY_ASSESSMENT: AssessmentSection[] = [
  {
    id: "transfers",
    title: "Transfers",
    description: "Ability to move between positions",
    icon: "move",
    questions: [
      {
        id: "mobility_trans_1",
        question: "Bed mobility - Can the client roll, sit up, and reposition independently in bed?",
        type: "multiple_choice",
        options: ["Independent", "Requires equipment/aids", "Requires minimal assistance", "Requires moderate assistance", "Requires maximum assistance", "Dependent - 2 person assist"],
        requiresMedia: true,
        aiPrompt: "Assess bed mobility in this video. Evaluate: rolling left/right, supine to sit, repositioning, managing bedding. Score using FIM levels (7=independent to 1=dependent). Identify specific difficulties and recommend bed rails, electric bed, positioning aids.",
      },
      {
        id: "mobility_trans_2",
        question: "Chair/wheelchair transfers - Can the client transfer to/from chair independently?",
        type: "multiple_choice",
        options: ["Independent", "Requires equipment/aids", "Requires minimal assistance", "Requires moderate assistance", "Requires maximum assistance", "Dependent - 2 person assist"],
        requiresMedia: true,
        aiPrompt: "Evaluate chair transfer technique. Assess: stand pivot, approach angle, weight shifting, balance, safety. Score independence level. Recommend: transfer aids, chair height adjustment, grab bars, lift equipment if needed.",
      },
      {
        id: "mobility_trans_3",
        question: "Toilet transfers - Can the client safely transfer on/off toilet?",
        type: "multiple_choice",
        options: ["Independent", "Requires equipment/aids", "Requires minimal assistance", "Requires moderate assistance", "Requires maximum assistance", "Dependent - 2 person assist"],
        requiresMedia: true,
        aiPrompt: "Assess toilet transfer safety and independence. Critical for dignity and continence. Evaluate: approach, lowering control, arising ability, balance. Recommend: grab rails, raised toilet seat, frame, commode, or hoist.",
      },
      {
        id: "mobility_trans_4",
        question: "Shower/bath transfers - Can the client safely enter/exit shower or bath?",
        type: "multiple_choice",
        options: ["Independent", "Requires equipment/aids", "Requires minimal assistance", "Requires moderate assistance", "Requires maximum assistance", "Dependent - 2 person assist"],
        requiresMedia: true,
        aiPrompt: "Evaluate bathing transfer safety. High-risk activity due to wet surfaces. Assess: step-over height, balance, wet surface negotiation. Recommend: shower chair, transfer bench, hoist, or level-access shower conversion.",
      },
      {
        id: "mobility_trans_5",
        question: "Car transfers - Can the client transfer in/out of vehicle?",
        type: "multiple_choice",
        options: ["Independent", "Requires equipment/aids", "Requires minimal assistance", "Requires moderate assistance", "Requires maximum assistance", "Unable to transfer"],
        requiresMedia: true,
        aiPrompt: "Assess vehicle transfer ability for community access. Evaluate: door opening, pivoting, leg lifting, bending. Essential for medical appointments and social participation. Recommend: swivel cushion, grab handle, vehicle modifications.",
      },
    ],
  },
  {
    id: "ambulation",
    title: "Walking & Ambulation",
    description: "Walking ability and endurance",
    icon: "footprints",
    questions: [
      {
        id: "mobility_amb_1",
        question: "Walking distance - How far can the client walk without rest?",
        type: "multiple_choice",
        options: ["150+ meters (unlimited)", "50-150 meters", "15-50 meters (room to room)", "Less than 15 meters", "Cannot walk"],
        requiresMedia: true,
        aiPrompt: "Assess walking endurance and functional distance. Relate to functional activities: unlimited=community ambulation, 50m=small shops, 15m=household only. Identify limiting factors: pain, fatigue, breathlessness, balance.",
      },
      {
        id: "mobility_amb_2",
        question: "Walking aids - What mobility aid does the client use?",
        type: "multiple_choice",
        options: ["No aid required", "Single point cane", "Quad cane (4-point)", "Walking frame (pickup)", "Wheeled walker (rollator)", "Crutches", "Cannot walk"],
        requiresMedia: true,
        aiPrompt: "Evaluate mobility aid appropriateness. Assess: correct height, proper gait pattern, adequate support, condition of aid. Consider progression/regression of aid level based on function and goals. Provide fitting recommendations.",
      },
      {
        id: "mobility_amb_3",
        question: "Stairs - Can the client manage stairs?",
        type: "multiple_choice",
        options: ["Independent (up and down)", "Independent with rail/aid", "Requires assistance", "Unable - stair lift needed", "Unable - avoid stairs"],
        requiresMedia: true,
        aiPrompt: "Assess stair climbing ability. Evaluate: reciprocal vs step-to pattern, rail use, speed, safety, endurance. Stairs often limit home access and community participation. Recommend: training, stair lift, ramp, or home modification.",
      },
      {
        id: "mobility_amb_4",
        question: "Outdoor surfaces - Can the client manage uneven ground, slopes, curbs?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate outdoor ambulation on varied terrain. Community participation requires managing: footpaths, grass, gravel, slopes, curb cuts, crossings. Assess confidence and safety. May indicate need for scooter or power wheelchair.",
      },
      {
        id: "mobility_amb_5",
        question: "Walking speed - 6 Meter Walk Test",
        description: "Time to walk 6 meters at comfortable pace. >6 seconds = mobility limitation",
        type: "text",
        requiresMedia: true,
        aiPrompt: "Analyze 6-meter walk test. Normal: <4.5s, Mild impairment: 4.5-6s, Moderate: 6-8s, Severe: >8s. Slow walking speed (<0.8 m/s) predicts hospitalization and mortality. Link to functional impact and interventions.",
      },
      {
        id: "mobility_amb_6",
        question: "Describe gait pattern and any abnormalities",
        type: "text",
        requiresMedia: true,
        aiPrompt: "Analyze gait biomechanics in this video. Assess: step length, cadence, symmetry, foot clearance, heel strike, push-off, trunk stability, arm swing, postural alignment. Identify impairments and link to specific pathologies and interventions.",
      },
    ],
  },
  {
    id: "wheelchair",
    title: "Wheelchair Mobility",
    description: "For clients using wheelchairs",
    icon: "accessibility",
    questions: [
      {
        id: "mobility_wc_1",
        question: "Type of wheelchair used",
        type: "multiple_choice",
        options: ["Manual - self-propelled", "Manual - attendant-propelled", "Power wheelchair", "Power scooter", "Not applicable"],
        requiresMedia: true,
        aiPrompt: "Assess wheelchair type and suitability. Evaluate: independence level, upper limb function, distance needs, environmental access. Consider transition between wheelchair types based on changing needs and goals.",
      },
      {
        id: "mobility_wc_2",
        question: "Can the client self-propel wheelchair for functional distances?",
        description: "At least 50 meters",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate wheelchair propulsion ability. Assess: technique, endurance, speed, ability to manage slopes/thresholds. Inability to self-propel 50m indicates need for power mobility. Measure propulsion efficiency and fatigue.",
      },
      {
        id: "mobility_wc_3",
        question: "Wheelchair fit and postural support",
        description: "Seat width, depth, height, back support, foot support",
        type: "text",
        requiresMedia: true,
        aiPrompt: "Assess wheelchair prescription and fit. Check: seat dimensions, cushion, back support, footrests, armrests, headrest. Poor fit causes pressure injuries, pain, and reduced function. Recommend seating clinic referral if needed.",
      },
      {
        id: "mobility_wc_4",
        question: "Can the client manage wheelchair brakes independently?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate brake operation ability. Essential for safety during transfers. Assess: hand function, reach, strength. If unable, recommend: brake extensions, power wheelchair with automatic brakes, or attendant propulsion.",
      },
      {
        id: "mobility_wc_5",
        question: "Home and community accessibility for wheelchair",
        type: "text",
        requiresMedia: true,
        aiPrompt: "Assess environmental access barriers. Identify: narrow doorways, steps, thresholds, turning space, surface types, gradients. Essential for NDIS funding. Document specific measurements and recommend ramps, doorway widening, lifts.",
      },
    ],
  },
  {
    id: "adl_mobility",
    title: "ADL Mobility Components",
    description: "Mobility for daily activities",
    icon: "user-check",
    questions: [
      {
        id: "mobility_adl_1",
        question: "Dressing lower body - Can the client don/doff pants, underwear, shoes independently?",
        type: "multiple_choice",
        options: ["Independent", "Independent with aids", "Requires minimal assistance", "Requires moderate/maximum assistance", "Dependent"],
        requiresMedia: false,
        aiPrompt: "Assess lower body dressing requiring: balance (standing), hip/knee flexion, reaching feet. Inability indicates need for: perching stool, long-handled aids, sock aid, elastic laces, Velcro shoes. Link to specific interventions.",
      },
      {
        id: "mobility_adl_2",
        question: "Bathing - Can the client bathe/shower independently?",
        type: "multiple_choice",
        options: ["Independent", "Independent with aids", "Requires minimal assistance", "Requires moderate/maximum assistance", "Dependent - full assistance"],
        requiresMedia: false,
        aiPrompt: "Evaluate bathing independence. Requires: transfers, standing balance, reaching all body parts, managing taps/soap. Essential for dignity. Recommend: shower chair, long-handled sponge, grab rails, tap turners, or personal care support.",
      },
      {
        id: "mobility_adl_3",
        question: "Domestic tasks - Can the client perform light housework?",
        description: "Dishes, light cleaning, laundry",
        type: "multiple_choice",
        options: ["Independent", "Independent with aids/adaptations", "Requires assistance with some tasks", "Requires assistance with most tasks", "Unable to perform"],
        requiresMedia: false,
        aiPrompt: "Assess capacity for light housework requiring standing tolerance, reaching, bending, carrying. Link to NDIS capacity building or home care package. Recommend: adaptive equipment, task modification, domestic assistance services.",
      },
      {
        id: "mobility_adl_4",
        question: "Meal preparation - Can the client prepare hot meals safely?",
        type: "multiple_choice",
        options: ["Independent", "Independent with aids/adaptations", "Requires assistance/supervision", "Unable - requires meal service"],
        requiresMedia: false,
        aiPrompt: "Evaluate meal preparation requiring: standing tolerance, reaching, carrying hot items, stove use. Safety critical. Recommend: perching stool, kettle tipper, microwave use, meal delivery services, or carer support.",
      },
    ],
  },
  {
    id: "mobility_goals",
    title: "Mobility Goals & Plan",
    description: "Client goals and intervention planning",
    icon: "target",
    questions: [
      {
        id: "mobility_goal_1",
        question: "What are the client's primary mobility goals?",
        description: "Link to NDIS outcomes or aged care goals",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Document client-centered mobility goals using SMART framework. Examples: walk to letterbox, transfer toilet independently, attend church weekly, visit grandchildren. Link to NDIS plan goals or aged care comprehensive assessment.",
      },
      {
        id: "mobility_goal_2",
        question: "Rehabilitation potential",
        description: "Can function be improved with therapy?",
        type: "multiple_choice",
        options: ["Good - likely to improve", "Moderate - may improve with intensive therapy", "Limited - maintenance focus", "Poor - focus on equipment and support"],
        requiresMedia: false,
        aiPrompt: "Assess rehabilitation potential based on: diagnosis, cognition, motivation, medical stability, support. Good potential: refer physiotherapy for strengthening/retraining. Limited potential: focus on aids and home modifications.",
      },
      {
        id: "mobility_goal_3",
        question: "Equipment and aids recommended",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Specify mobility equipment prescription. Walking aids, wheelchair, transfer equipment, bathroom aids, bed adjustments. Justify each item with functional need. Consider NDIS funding categories: assistive technology, home modifications, consumables.",
      },
      {
        id: "mobility_goal_4",
        question: "Allied health referrals required",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Identify therapy needs. Physiotherapy: gait training, strength, balance, pain. Occupational Therapy: ADL retraining, home mods, equipment prescription. Exercise Physiology: conditioning, falls prevention programs. Specify priority and rationale.",
      },
      {
        id: "mobility_goal_5",
        question: "Functional outcome measure scores",
        description: "Barthel Index, FIM, or other standardized tool",
        type: "text",
        requiresMedia: false,
        aiPrompt: "Document baseline functional scores using standardized measures. Barthel Index (0-100), FIM (18-126), or Modified Rankin (0-6). Baseline scores essential for: monitoring progress, demonstrating intervention effectiveness, justifying funding.",
      },
    ],
  },
];

// Helper functions
export const getFallsRiskQuestionCount = (): number => {
  return FALLS_RISK_ASSESSMENT.reduce((sum, section) => sum + section.questions.length, 0);
};

export const getMovementMobilityQuestionCount = (): number => {
  return MOVEMENT_MOBILITY_ASSESSMENT.reduce((sum, section) => sum + section.questions.length, 0);
};
