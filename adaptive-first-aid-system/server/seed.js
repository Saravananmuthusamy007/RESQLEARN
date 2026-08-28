const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Level = require('./models/Level');
const Question = require('./models/Question');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/first-aid-system';

const levels = [
  {
    order: 1,
    title: "Cardiopulmonary Resuscitation (CPR) & AED Basics",
    description: "Learn high-quality chest compressions, rescue breathing techniques, and Automated External Defibrillator (AED) safety protocols.",
    videoUrl: "https://www.youtube.com/embed/BvW4-tKx-H4",
    instructions: [
      "Assess scene safety and verify patient responsiveness by tapping shoulders and shouting.",
      "Call emergency service immediately and retrieve an AED if available.",
      "Check patient breathing for 5-10 seconds.",
      "Perform high-quality chest compressions: hand placement on lower half of sternum, depth 2 inches (5-6 cm), rate 100-120 bpm.",
      "Deliver 2 rescue breaths after every 30 compressions if trained.",
      "Turn on AED, apply pads as instructed on pads, clear patient during rhythm analysis, and deliver shock if advised."
    ],
    practicalThreshold: 80,
    mcqThreshold: 70
  },
  {
    order: 2,
    title: "Severe Bleeding & Shock Control",
    description: "Understand direct pressure, pressure dressings, tourniquet application, and hypovolemic shock position management.",
    videoUrl: "https://www.youtube.com/embed/NxO5Lyl43-4",
    instructions: [
      "Put on protective gloves before approaching the victim.",
      "Apply direct, firm pressure over the bleeding wound using sterile gauze or clean cloth.",
      "Maintain continuous pressure for at least 5-10 minutes.",
      "If bleeding continues through bandage, apply pressure dressing over initial bandage without removing it.",
      "For severe arterial extremity bleeding, apply a commercial tourniquet 2-3 inches above the wound (not over a joint) and tighten until bleeding stops.",
      "Position patient lying flat with legs elevated 6-12 inches (if no spinal injury) to manage shock and keep patient warm."
    ],
    practicalThreshold: 80,
    mcqThreshold: 70
  },
  {
    order: 3,
    title: "Burns & Thermal Injuries",
    description: "Identify 1st, 2nd, and 3rd degree burns, chemical exposures, and proper cooling and dressing procedures.",
    videoUrl: "https://www.youtube.com/embed/EaJmzB8YgS0",
    instructions: [
      "Remove source of heat safely or flush chemical burns with copious running water for at least 20 minutes.",
      "Cool thermal burns immediately under cool (not ice-cold) running water for 10-20 minutes.",
      "Do NOT apply ice, butter, oils, or adhesive bandages to burn injuries.",
      "Cover area loosely with clean, non-stick sterile gauze dressing.",
      "Seek emergency medical assistance immediately for third-degree burns, large area burns (>10% body surface), or facial/airway burns."
    ],
    practicalThreshold: 80,
    mcqThreshold: 70
  },
  {
    order: 4,
    title: "Fractures, Dislocations & Emergency Transport",
    description: "Learn anatomical splinting, joint immobilization, spinal precaution basics, and safe rescue movement.",
    videoUrl: "https://www.youtube.com/embed/2v8vlXgGXwE",
    instructions: [
      "Support suspected fracture or dislocation in position found; do NOT attempt to realign broken bones.",
      "Immobilize joint above and joint below suspected fracture site using rigid splint material.",
      "Pad splint to cushion skin and prevent pressure points.",
      "Check circulation, sensation, and movement (CSM) before and after splint application.",
      "Keep patient calm and still while awaiting emergency medical personnel."
    ],
    practicalThreshold: 80,
    mcqThreshold: 70
  },
  {
    order: 5,
    title: "Choking & Airway Obstruction Management",
    description: "Master abdominal thrusts (Heimlich maneuver), back blows, and infant choking protocols for conscious and unconscious victims.",
    videoUrl: "https://www.youtube.com/embed/z52XN_1xN40",
    instructions: [
      "Identify signs of severe airway obstruction (unable to speak, cough effectively, or breathe).",
      "Stand behind conscious adult/child, wrap arms around waist, and locate navel.",
      "Make a fist, place thumb side above navel, perform inward & upward abdominal thrusts until object is expelled.",
      "For infants, alternate between 5 sharp back slaps and 5 chest thrusts.",
      "If victim becomes unconscious, lower to ground carefully and initiate CPR starting with chest compressions."
    ],
    practicalThreshold: 80,
    mcqThreshold: 70
  }
];

// Questions definition mapped by level order
const questionsData = {
  1: [
    {
      questionText: "What is the very first step when encountering a collapsed individual?",
      options: ["Start chest compressions", "Assess scene safety for yourself and victim", "Apply AED pads", "Give 2 rescue breaths"],
      correctOptionIndex: 1,
      difficulty: "easy",
      tags: ["sequence", "safety"],
      explanation: "Always ensure the scene is safe before approaching an emergency victim."
    },
    {
      questionText: "What is the recommended chest compression rate for adult CPR?",
      options: ["60-80 compressions/min", "80-100 compressions/min", "100-120 compressions/min", "120-140 compressions/min"],
      correctOptionIndex: 2,
      difficulty: "easy",
      tags: ["technique", "timing"],
      explanation: "High-quality chest compressions must be delivered at a rate of 100-120 beats per minute."
    },
    {
      questionText: "Where should chest compressions be positioned on an adult victim?",
      options: ["Upper third of sternum", "Lower half of the sternum (center of chest)", "Left side over the heart", "Abdomen below the ribcage"],
      correctOptionIndex: 1,
      difficulty: "medium",
      tags: ["target-area", "technique"],
      explanation: "Hands should be placed on the lower half of the sternum in the center of the chest."
    },
    {
      questionText: "What is the correct compression-to-ventilation ratio for single-rescuer adult CPR?",
      options: ["15 compressions to 2 breaths", "30 compressions to 2 breaths", "50 compressions to 2 breaths", "Continuous compressions without breaths"],
      correctOptionIndex: 1,
      difficulty: "medium",
      tags: ["sequence", "technique"],
      explanation: "The standard single-rescuer ratio for adults is 30 compressions followed by 2 rescue breaths."
    },
    {
      questionText: "When the AED prompts 'Analyzing Heart Rhythm, Do Not Touch Patient', what immediate action must be taken?",
      options: ["Continue compressions until shock advised", "Loudly announce 'Clear!' and ensure nobody touches the victim", "Turn off AED", "Check pulse for 10 seconds"],
      correctOptionIndex: 1,
      difficulty: "hard",
      tags: ["safety", "sequence", "timing"],
      explanation: "Movement or contact during rhythm analysis interferes with AED detection. Rescuers must stand clear."
    },
    {
      questionText: "What compression depth is required for effective adult CPR?",
      options: ["At least 1 inch (2.5 cm)", "At least 2 inches (5-6 cm)", "At least 3.5 inches (9 cm)", "Depth does not matter as long as rate is fast"],
      correctOptionIndex: 1,
      difficulty: "hard",
      tags: ["technique", "depth"],
      explanation: "Adult chest compressions require a depth of at least 2 inches (5-6 cm) to promote blood flow."
    }
  ],
  2: [
    {
      questionText: "How do you identify severe airway obstruction in a conscious adult choking victim?",
      options: ["Victim is coughing forcefully", "Victim cannot speak, breathe, or cough effectively", "Victim asks for water", "Victim sneezes repeatedly"],
      correctOptionIndex: 1,
      difficulty: "easy",
      tags: ["technique", "safety"],
      explanation: "Inability to speak or produce effective cough indicates complete airway blockage."
    },
    {
      questionText: "Where should abdominal thrusts (Heimlich maneuver) be positioned on a conscious adult?",
      options: ["On the xiphoid process", "Slightly above the navel and well below the breastbone", "On the lower ribcage", "Directly on the navel"],
      correctOptionIndex: 1,
      difficulty: "medium",
      tags: ["target-area", "technique"],
      explanation: "Place your fist thumb-side in slightly above the navel, well below the chest breastbone."
    },
    {
      questionText: "What action should be taken if a conscious choking victim becomes unresponsive?",
      options: ["Perform 5 back slaps", "Lower victim carefully to the ground and initiate CPR compressions", "Give water", "Continue abdominal thrusts on ground"],
      correctOptionIndex: 1,
      difficulty: "hard",
      tags: ["sequence", "safety"],
      explanation: "If unresponsiveness occurs, lower the victim and start CPR chest compressions immediately."
    }
  ],
  3: [
    {
      questionText: "What is the primary first-aid technique to stop severe external bleeding?",
      options: ["Apply ice pack", "Apply direct, continuous pressure over the wound", "Elevate head", "Pour alcohol over wound"],
      correctOptionIndex: 1,
      difficulty: "easy",
      tags: ["technique"],
      explanation: "Direct, firm pressure is the single most effective method to stop acute bleeding."
    },
    {
      questionText: "Where should a commercial tourniquet be applied on an extremity with uncontrolled arterial bleeding?",
      options: ["Directly over the bleeding joint", "2 to 3 inches above the wound (proximal to heart)", "2 inches below the wound", "On the neck"],
      correctOptionIndex: 1,
      difficulty: "medium",
      tags: ["target-area", "safety"],
      explanation: "Tourniquets must be placed 2-3 inches above the bleeding site and never over joints."
    },
    {
      questionText: "What position helps manage hypovolemic shock in a victim with severe blood loss (no spinal injury)?",
      options: ["Sitting upright", "Lying flat with legs elevated 6-12 inches", "Standing up", "Prone position on stomach"],
      correctOptionIndex: 1,
      difficulty: "hard",
      tags: ["sequence", "technique"],
      explanation: "Elevating legs 6-12 inches promotes venous return to critical internal organs during shock."
    }
  ],
  4: [
    {
      questionText: "What is the recommended initial cooling treatment for thermal burn injuries?",
      options: ["Apply ice or ice water", "Cool under cool running water for 10-20 minutes", "Apply butter or oils", "Pop blisters immediately"],
      correctOptionIndex: 1,
      difficulty: "easy",
      tags: ["technique", "safety"],
      explanation: "Cool running tap water reduces thermal tissue damage safely without inducing hypothermia."
    },
    {
      questionText: "How should chemical burns on the skin be managed?",
      options: ["Cover immediately with plastic wrap", "Flush continuously with water for at least 20 minutes", "Neutralize with acid/alkali solution", "Wipe with towel"],
      correctOptionIndex: 1,
      difficulty: "medium",
      tags: ["technique", "timing"],
      explanation: "Copious water flushing for 20 minutes dilutes and removes hazardous corrosive chemicals."
    }
  ],
  5: [
    {
      questionText: "What rule must be followed when immobilizing a suspected limb fracture with a splint?",
      options: ["Realign broken bones before splinting", "Immobilize the joint above and joint below the fracture site", "Apply splint tightly until pale", "Only wrap bandage without splint"],
      correctOptionIndex: 1,
      difficulty: "medium",
      tags: ["target-area", "technique"],
      explanation: "A proper splint stabilizes both the joint above and joint below the fracture."
    },
    {
      questionText: "What check must be performed before and after applying a rigid splint?",
      options: ["Blood pressure check", "Circulation, Sensation, and Movement (CSM) check distal to injury", "Pupil response check", "Blood sugar test"],
      correctOptionIndex: 1,
      difficulty: "hard",
      tags: ["sequence", "safety"],
      explanation: "Checking CSM ensures splinting does not compromise blood circulation or nerve function."
    }
  ]
};

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing levels & questions
    await Level.deleteMany({});
    await Question.deleteMany({});
    console.log('Cleared existing levels and questions.');

    // Seed levels
    const createdLevels = await Level.insertMany(levels);
    console.log(`Seeded ${createdLevels.length} levels successfully.`);

    // Seed MCQ Questions for each level
    let totalQuestionsSeeded = 0;
    for (const lvl of createdLevels) {
      const qList = questionsData[lvl.order];
      if (qList && qList.length > 0) {
        const questionsToInsert = qList.map(q => ({
          ...q,
          level: lvl._id
        }));
        const inserted = await Question.insertMany(questionsToInsert);
        totalQuestionsSeeded += inserted.length;
      }
    }
    console.log(`Seeded ${totalQuestionsSeeded} MCQ questions across 5 levels.`);

    // Seed default admin account if not exists
    const adminEmail = 'admin@firstaid.com';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('AdminPass123', salt);
      admin = new User({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Created default admin user: admin@firstaid.com / AdminPass123');
    } else {
      console.log('Admin user already exists.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
