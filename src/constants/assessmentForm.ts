/**
 * Comprehensive OT Environmental Assessment Form
 * Based on AOTA and CAOT standards for home safety assessments
 */

export type AssessmentQuestion = {
  id: string;
  question: string;
  description?: string;
  type: "yes_no" | "text" | "rating" | "multiple_choice" | "checkbox";
  options?: string[];
  requiresMedia?: boolean;
  required?: boolean; // Mark question as mandatory
  aiPrompt: string; // Specific prompt for AI analysis
  prefillFrom?: string[]; // Array of question IDs to prefill from (e.g., ["scooter_env_1", "entrance_1"])
};

export type AssessmentSection = {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: AssessmentQuestion[];
};

export const ASSESSMENT_FORM: AssessmentSection[] = [
  {
    id: "entrance_exit",
    title: "Entrance & Exit",
    description: "Assess accessibility and safety of home entry points",
    icon: "home",
    questions: [
      {
        id: "entrance_1",
        question: "Is the house number clearly visible from the street?",
        description: "Important for emergency services",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Analyze this image of the house entrance. Is the house number clearly visible? Can emergency services easily identify this address? Provide specific recommendations for improvement if needed.",
      },
      {
        id: "entrance_2",
        question: "Is there a working doorbell or knocker?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Review the doorbell/knocker in this image. Is it functional and easily accessible? Suggest improvements for visibility or accessibility.",
      },
      {
        id: "entrance_3",
        question: "Are there steps or stairs at the entrance?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Examine the entrance steps in this image. Count the number of steps, assess their condition, measure approximate height and depth. Are they safe? Do they need railings, contrast marking, or a ramp? Provide detailed recommendations.",
      },
      {
        id: "entrance_4",
        question: "Are handrails present on both sides of stairs?",
        description: "Required for safe navigation",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Analyze the stair handrails shown. Are they on both sides? Are they securely mounted? What is their height? Do they extend beyond the top and bottom steps? Recommend improvements.",
      },
      {
        id: "entrance_5",
        question: "Is the entrance door width adequate (minimum 32 inches)?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess the door width in this image. Does it appear to be at least 32 inches wide for wheelchair access? Is there adequate clearance? Suggest modifications if needed.",
      },
      {
        id: "entrance_6",
        question: "Is there adequate lighting at the entrance?",
        description: "Both day and night visibility",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate the lighting conditions at this entrance. Is there sufficient illumination for safe entry? Are there motion sensors? Recommend lighting improvements for safety.",
      },
      {
        id: "entrance_7",
        question: "Are walkways and pathways level and in good repair?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Examine the walkway surface. Look for cracks, uneven surfaces, trip hazards, or deterioration. Assess drainage and recommend repairs or modifications.",
      },
    ],
  },
  {
    id: "bathroom",
    title: "Bathroom",
    description: "Evaluate bathroom safety and accessibility features",
    icon: "bath",
    questions: [
      {
        id: "bathroom_1",
        question: "Are there grab bars near the toilet?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Analyze grab bar placement near the toilet. Are they properly positioned for transfers? Are they securely mounted? What is their height and orientation? Recommend optimal placement and installation.",
      },
      {
        id: "bathroom_2",
        question: "Are there grab bars in the shower/tub area?",
        description: "Essential for safe bathing",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Examine the shower/tub grab bars in this image. Assess their placement, security, and adequacy. Are they positioned for entry, exit, and standing support? Recommend additional bars or repositioning.",
      },
      {
        id: "bathroom_3",
        question: "Is there a non-slip mat or surface in the shower/tub?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate the slip resistance of the shower/tub surface. Are there non-slip mats, strips, or textured surfaces? Assess their condition and coverage. Recommend improvements.",
      },
      {
        id: "bathroom_4",
        question: "Is the toilet height appropriate (17-19 inches)?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess the toilet height in this image. Does it appear to be standard height (17-19 inches) or comfort height? Would a raised toilet seat be beneficial? Provide recommendations.",
      },
      {
        id: "bathroom_5",
        question: "Is there adequate space for transfers and mobility devices?",
        description: "Wheelchair or walker clearance",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Analyze the bathroom layout and clearance space. Is there at least 5 feet turning radius for wheelchairs? Can mobility devices be maneuvered safely? Suggest modifications for improved accessibility.",
      },
      {
        id: "bathroom_6",
        question: "Are faucets easy to operate (lever-style preferred)?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Examine the faucet types shown. Are they lever-style, knobs, or touchless? Assess ease of operation for individuals with limited hand function. Recommend modifications.",
      },
      {
        id: "bathroom_7",
        question: "Is the bathroom lighting adequate?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate bathroom lighting. Is there sufficient overhead lighting? Are there task lights near the mirror? Is there a night light? Recommend lighting improvements for safety.",
      },
      {
        id: "bathroom_8",
        question: "Are hot water pipes covered or insulated?",
        description: "Prevents burns, especially for wheelchair users",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Check if hot water pipes under sinks are exposed. Could they cause burns? Are they insulated? Recommend protective covers or insulation.",
      },
    ],
  },
  {
    id: "kitchen",
    title: "Kitchen",
    description: "Assess kitchen safety and functional accessibility",
    icon: "chef-hat",
    questions: [
      {
        id: "kitchen_1",
        question: "Are frequently used items within easy reach?",
        description: "No overhead reaching required",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Analyze kitchen storage accessibility. Are everyday items (dishes, glasses, food) within reach without step stools or overhead reaching? Recommend reorganization strategies.",
      },
      {
        id: "kitchen_2",
        question: "Is there adequate task lighting over work surfaces?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess kitchen task lighting over counters, stove, and sink. Is illumination sufficient for food preparation? Recommend under-cabinet lighting or additional fixtures.",
      },
      {
        id: "kitchen_3",
        question: "Are there anti-fatigue mats in standing work areas?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Check for anti-fatigue mats in areas where prolonged standing occurs. Assess their placement and condition. Recommend additions for comfort and safety.",
      },
      {
        id: "kitchen_4",
        question: "Is there knee clearance under the sink or counter?",
        description: "Important for seated work",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Examine counter and sink areas for knee clearance. Can someone in a wheelchair sit comfortably? Are there obstructions? Recommend modifications for seated access.",
      },
      {
        id: "kitchen_5",
        question: "Are stove controls front-mounted and clearly marked?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Analyze stove control placement and visibility. Are they at the front to avoid reaching over burners? Are they clearly labeled? Assess safety and recommend improvements.",
      },
      {
        id: "kitchen_6",
        question: "Is there a fire extinguisher accessible in the kitchen?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Locate the fire extinguisher in this image. Is it easily accessible, properly mounted, and not expired? Is it the correct type for kitchen fires? Provide recommendations.",
      },
      {
        id: "kitchen_7",
        question: "Are electrical outlets sufficient and properly positioned?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate electrical outlet placement and quantity. Are there enough outlets to avoid extension cords? Are they GFCI protected near water? Recommend additions or modifications.",
      },
      {
        id: "kitchen_8",
        question: "Is the refrigerator door easy to open and items accessible?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess refrigerator accessibility. Can the door be opened easily? Are shelves organized for easy reach? Recommend organizational strategies and potential modifications.",
      },
    ],
  },
  {
    id: "bedroom",
    title: "Bedroom",
    description: "Evaluate bedroom safety and comfort accessibility",
    icon: "bed",
    questions: [
      {
        id: "bedroom_1",
        question: "Is the bed height appropriate for safe transfers?",
        description: "Generally 20-23 inches from floor",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess bed height in relation to the user's mobility. Is it too high or too low for safe transfers? Can feet touch the floor when seated? Recommend adjustments or bed risers/lowering.",
      },
      {
        id: "bedroom_2",
        question: "Is there clear space on at least one side of the bed?",
        description: "Minimum 36 inches for safe access",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate clearance around the bed. Is there at least 36 inches on one or both sides? Can mobility devices be positioned? Recommend furniture rearrangement.",
      },
      {
        id: "bedroom_3",
        question: "Is there a light switch or lamp within easy reach of the bed?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Check for accessible lighting controls from the bed. Can lights be turned on/off without getting up? Recommend bedside lamps, touch controls, or smart switches.",
      },
      {
        id: "bedroom_4",
        question: "Are pathways to the bathroom clear at night?",
        description: "Night-time safety is critical",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Analyze the pathway from bed to bathroom. Are there trip hazards? Is there night lighting or a clear path? Recommend night lights and furniture repositioning.",
      },
      {
        id: "bedroom_5",
        question: "Is closet storage accessible without reaching overhead?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate closet organization and accessibility. Are clothes and items within reach? Are there adjustable rods or shelving? Recommend organizational modifications.",
      },
      {
        id: "bedroom_6",
        question: "Are windows easy to open for emergency egress?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess window operability for emergency exits. Can they be opened easily? Are they obstructed? Meet egress requirements? Recommend improvements.",
      },
    ],
  },
  {
    id: "living_areas",
    title: "Living Areas",
    description: "Assess common living spaces for safety and accessibility",
    icon: "sofa",
    questions: [
      {
        id: "living_1",
        question: "Are all rugs secured or removed to prevent tripping?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Examine rugs and floor coverings for trip hazards. Are they secured with non-slip backing or tape? Do they create obstacles? Recommend removal or securing methods.",
      },
      {
        id: "living_2",
        question: "Are walkways clear with at least 36 inches of width?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Measure apparent walkway widths between furniture. Are pathways at least 36 inches wide for mobility devices? Identify narrow areas and recommend furniture repositioning.",
      },
      {
        id: "living_3",
        question: "Is furniture stable and at appropriate height for transfers?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess furniture stability and height. Are chairs and sofas at appropriate height (17-19 inches) with sturdy arms? Do they provide good support? Recommend modifications or replacements.",
      },
      {
        id: "living_4",
        question: "Are electrical cords secured and not crossing walkways?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Identify electrical cords and their routing. Do they cross walkways? Are they trip hazards? Recommend cord management solutions or outlet additions.",
      },
      {
        id: "living_5",
        question: "Is there adequate general and task lighting?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate lighting throughout living areas. Is there sufficient ambient and task lighting? Are there dark corners? Recommend additional fixtures or brighter bulbs.",
      },
      {
        id: "living_6",
        question: "Are frequently used items (phone, remote) easily accessible?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess organization of frequently used items. Are they within reach from seated positions? Recommend storage solutions and reorganization strategies.",
      },
    ],
  },
  {
    id: "stairs_hallways",
    title: "Stairs & Hallways",
    description: "Evaluate mobility pathways and vertical access",
    icon: "move-vertical",
    questions: [
      {
        id: "stairs_1",
        question: "Do stairs have handrails on both sides?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Examine stair handrails. Are they on both sides? Do they extend beyond top and bottom steps? Are they securely mounted at proper height (34-38 inches)? Recommend improvements.",
      },
      {
        id: "stairs_2",
        question: "Are stair edges clearly marked with contrasting tape?",
        description: "Helps with depth perception",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Check for contrast marking on stair edges. Is there color contrast to define each step? Recommend high-contrast tape or paint for visual clarity.",
      },
      {
        id: "stairs_3",
        question: "Is stair lighting adequate from top to bottom?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess stairway lighting. Is the entire staircase well-lit? Are there switches at both top and bottom? Recommend additional lighting or 3-way switches.",
      },
      {
        id: "stairs_4",
        question: "Are hallways at least 36 inches wide?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Measure apparent hallway width. Is it at least 36 inches for mobility device passage? Identify narrow points and recommend solutions.",
      },
      {
        id: "stairs_5",
        question: "Are there light switches at both ends of hallways?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Check for convenient hallway light controls. Can lights be controlled from both ends? Recommend switch additions or smart lighting.",
      },
    ],
  },
  {
    id: "safety_emergency",
    title: "Safety & Emergency",
    description: "Assess emergency preparedness and safety systems",
    icon: "shield-alert",
    questions: [
      {
        id: "safety_1",
        question: "Are working smoke detectors present on each level?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Identify smoke detectors in this area. Are they present and operational? When were batteries last changed? Recommend additions and testing schedule.",
      },
      {
        id: "safety_2",
        question: "Are there carbon monoxide detectors near sleeping areas?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Check for carbon monoxide detectors. Are they properly placed near bedrooms? Are they functioning? Recommend placement and testing.",
      },
      {
        id: "safety_3",
        question: "Is there a clear and accessible emergency exit plan?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate emergency exit accessibility. Are exits clearly marked and accessible? Can they be reached safely? Recommend improvements to exit routes.",
      },
      {
        id: "safety_4",
        question: "Are emergency phone numbers posted in visible locations?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Look for emergency contact information. Is it posted where it can be easily found? Recommend creating and posting emergency contact lists.",
      },
      {
        id: "safety_5",
        question: "Is the hot water temperature set below 120°F?",
        description: "Prevents scalding injuries",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "If water heater is visible, check temperature setting. Is it at or below 120°F to prevent burns? Recommend adjustment if needed.",
      },
    ],
  },
  {
    id: "outdoor_spaces",
    title: "Outdoor Spaces",
    description: "Evaluate exterior safety and accessibility",
    icon: "tree-pine",
    questions: [
      {
        id: "outdoor_1",
        question: "Are outdoor pathways level and well-maintained?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Examine outdoor walking surfaces. Are they level, crack-free, and safe? Is drainage adequate? Recommend repairs or modifications.",
      },
      {
        id: "outdoor_2",
        question: "Is outdoor lighting adequate for nighttime safety?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Assess outdoor lighting coverage. Are pathways, steps, and entrances well-lit? Are there motion sensors? Recommend additional lighting for safety.",
      },
      {
        id: "outdoor_3",
        question: "Are outdoor steps clearly marked and with handrails?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Evaluate outdoor steps. Do they have railings? Are edges marked? Are they in good repair? Recommend safety improvements.",
      },
      {
        id: "outdoor_4",
        question: "Is the mailbox accessible without barriers?",
        type: "yes_no",
        requiresMedia: true,
        aiPrompt: "Check mailbox accessibility. Can it be reached easily? Is the path safe? Recommend modifications for easier access.",
      },
    ],
  },
];

// Helper function to get all questions across sections
export const getAllQuestions = (): AssessmentQuestion[] => {
  return ASSESSMENT_FORM.flatMap((section) => section.questions);
};

// Helper function to get question by ID
export const getQuestionById = (questionId: string): AssessmentQuestion | undefined => {
  return getAllQuestions().find((q) => q.id === questionId);
};

// Helper function to get section by ID
export const getSectionById = (sectionId: string): AssessmentSection | undefined => {
  return ASSESSMENT_FORM.find((s) => s.id === sectionId);
};
