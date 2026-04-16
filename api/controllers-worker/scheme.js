import db from '../utils/mongodb.js';
import createError from '../utils/createError.js';

const initialSchemes = [
  // ... (Same as original initialSchemes)
  { id: 101, title: "JEE Main", type: "Exam", category: "Engineering", focus: "B.Tech/B.Arch", reward: "Admission to NITs/IIITs", eligibility: "Class 12 Science", deadline: "Session 1: Jan, Session 2: Apr", eligibleYears: "Class 12 / Drop", link: "https://jeemain.nta.ac.in/", tags: ["Undergrad", "National"], matchCriteria: { state: "All" } },
  { id: 102, title: "JEE Advanced", type: "Exam", category: "Engineering", focus: "IIT Admissions", reward: "Admission to IITs", eligibility: "JEE Main Top 2.5L", deadline: "May-June", eligibleYears: "Class 12 / Drop", link: "https://jeeadv.ac.in/", tags: ["IIT", "National"], matchCriteria: { state: "All" } },
  { id: 103, title: "BITSAT", type: "Exam", category: "Engineering", focus: "BITS Campuses", reward: "Admission to BITS Pilani/Goa/Hyd", eligibility: "75% aggregate in PCM", deadline: "March-April", eligibleYears: "Class 12 / Drop", link: "https://www.bitsadmission.com/", tags: ["Private", "National"], matchCriteria: { state: "All" } },
  { id: 104, title: "NEET UG", type: "Exam", category: "Medical", focus: "MBBS/BDS/AYUSH", reward: "Medical Selection", eligibility: "Class 12 with Biology", deadline: "Feb-March", eligibleYears: "Class 12 / Drop", link: "https://neet.nta.nic.in/", tags: ["Doctor", "National"], matchCriteria: { state: "All" } },
  { id: 110, title: "UPSC Civil Services (IAS/IPS)", type: "Exam", category: "Central", focus: "Administrative Services", reward: "IAS, IPS, IFS officer post", eligibility: "Any Degree", deadline: "Feb-March", eligibleYears: "Final Year / Graduate", link: "https://upsc.gov.in/", tags: ["UPSC", "Prestigious", "Bachelors Eligible"], matchCriteria: { state: "All" } },
  { id: 111, title: "CDS (Combined Defence Services)", type: "Exam", category: "Central", focus: "Army/Navy/AirForce Officer", reward: "Officer in Indian Armed Forces", eligibility: "Degree in any stream / Engg", deadline: "UPSC CDS I (Dec), CDS II (May)", eligibleYears: "Final Year / Graduate", link: "https://upsc.gov.in/", tags: ["Defence", "UPSC", "Bachelors Eligible"], matchCriteria: { state: "All" } },
  { id: 112, title: "AFCAT (Air Force CET)", type: "Exam", category: "Central", focus: "Air Force Officer", reward: "Flying/Ground Duty Officer", eligibility: "B.Tech / 60%+ in Physics/Math", deadline: "Jan and June", eligibleYears: "Final Year / Graduate", link: "https://afcat.cdac.in/", tags: ["Air Force", "Bachelors Eligible"], matchCriteria: { state: "All" } },
  { id: 113, title: "SSC CGL", type: "Exam", category: "Central", focus: "Group B & C Govt Posts", reward: "Inspector, Auditor, Assistant", eligibility: "Any Graduation", deadline: "June-July", eligibleYears: "Graduate (Final year can apply)", link: "https://ssc.nic.in/", tags: ["Govt Jobs", "Admin"], matchCriteria: { state: "All" } },
  { id: 601, title: "UPPSC (Uttar Pradesh PCS)", type: "Exam", category: "Regional", focus: "UP Civil Services", reward: "SDM, DSP, Tehsildar in UP", eligibility: "Any Graduation", deadline: "Jan-Feb", eligibleYears: "Final Year / Graduate", link: "https://uppsc.up.nic.in/", tags: ["UP", "PCS", "Bachelors Eligible"], matchCriteria: { state: "Uttar Pradesh" } },
  { id: 602, title: "BPSC (Bihar Public Service)", type: "Exam", category: "Regional", focus: "Bihar Civil Services", reward: "SDM, DSP in Bihar", eligibility: "Any Graduation", deadline: "Aug-Sept", eligibleYears: "Final Year / Graduate", link: "https://bpsc.bih.nic.in/", tags: ["Bihar", "PCS", "Bachelors Eligible"], matchCriteria: { state: "Bihar" } },
  { id: 603, title: "MPSC (Maharashtra State PCS)", type: "Exam", category: "Regional", focus: "Maharashtra Civil Services", reward: "Deputy Collector, DSP in MH", eligibility: "Any Graduation", deadline: "Dec-Jan", eligibleYears: "Final Year / Graduate", link: "https://mpsc.gov.in/", tags: ["Maharashtra", "PCS", "Bachelors Eligible"], matchCriteria: { state: "Maharashtra" } },
  { id: 106, title: "GATE", type: "Exam", category: "Technical", focus: "M.Tech/PhD/PSU", reward: "Masters Admission + Stipend", eligibility: "Engg/Science degree", deadline: "Aug-Sept", eligibleYears: "3rd/4th Year Bachelors", link: "https://gate2024.iisc.ac.in/", tags: ["Masters", "Engineering"], matchCriteria: { state: "All" } },
  { id: 1, title: "National Scholarship Portal (NSP)", type: "Scheme", category: "Central", focus: "Merit Students", reward: "Up to ₹20,000/yr", eligibility: "Class 12 Top 20th pct", deadline: "July - Dec (Varies)", eligibleYears: "1st/2nd/3rd year", link: "https://scholarships.gov.in/", tags: ["NSP", "Financial Aid"], matchCriteria: { state: "All" } },
  { id: 3, title: "AICTE Pragati", type: "Scheme", category: "Technical", focus: "Girls in Tech", reward: "₹50,000 per annum", eligibility: "1st yr Degree Girl Child", deadline: "Oct-Dec", eligibleYears: "1st Year Bachelors", link: "https://aicte-india.org/", tags: ["Women", "Tech"], matchCriteria: { gender: "female" } }
];

export const getSchemes = async (c) => {
  const schemes = db('schemes', c.env);
  
  // Minimal sync implementation for Hono/Worker
  try {
    const list = await schemes.find({}, { sort: { type: 1, id: 1 } });
    if (list.length === 0) {
      // Seed if empty
      for (const s of initialSchemes) {
        await schemes.updateOne({ id: s.id }, { $set: s }, { upsert: true });
      }
      return c.json(initialSchemes, 200);
    }
    return c.json(list, 200);
  } catch (err) {
    throw createError(500, "Failed to fetch schemes");
  }
};

export const syncSchemes = async (c) => {
  const role = c.get('role');
  if (role !== "admin" && role !== "root") {
    throw createError(403, "Only admins can sync data!");
  }

  const env = c.env;
  const schemes = db('schemes', env);
  const body = await c.req.json();
  const newList = body.schemes || initialSchemes;

  for (const s of newList) {
    await schemes.updateOne({ id: s.id }, { $set: s }, { upsert: true });
  }

  return c.json({ message: "Schemes synced successfully!", count: newList.length }, 200);
};
