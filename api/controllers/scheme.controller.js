import Scheme from "../models/scheme.model.js";
import createError from "../utils/createError.js";

const initialSchemes = [
  // --- National Exams (Engineering) ---
  { id: 101, title: "JEE Main", type: "Exam", category: "Engineering", focus: "B.Tech/B.Arch", reward: "Admission to NITs/IIITs", eligibility: "Class 12 Science", deadline: "Session 1: Jan, Session 2: Apr", eligibleYears: "Class 12 / Drop", link: "https://jeemain.nta.ac.in/", tags: ["Undergrad", "National"], matchCriteria: { state: "All" } },
  { id: 102, title: "JEE Advanced", type: "Exam", category: "Engineering", focus: "IIT Admissions", reward: "Admission to IITs", eligibility: "JEE Main Top 2.5L", deadline: "May-June", eligibleYears: "Class 12 / Drop", link: "https://jeeadv.ac.in/", tags: ["IIT", "National"], matchCriteria: { state: "All" } },
  { id: 103, title: "BITSAT", type: "Exam", category: "Engineering", focus: "BITS Campuses", reward: "Admission to BITS Pilani/Goa/Hyd", eligibility: "75% aggregate in PCM", deadline: "March-April", eligibleYears: "Class 12 / Drop", link: "https://www.bitsadmission.com/", tags: ["Private", "National"], matchCriteria: { state: "All" } },
  
  // --- National Exams (Medical) ---
  { id: 104, title: "NEET UG", type: "Exam", category: "Medical", focus: "MBBS/BDS/AYUSH", reward: "Medical Selection", eligibility: "Class 12 with Biology", deadline: "Feb-March", eligibleYears: "Class 12 / Drop", link: "https://neet.nta.nic.in/", tags: ["Doctor", "National"], matchCriteria: { state: "All" } },
  
  // --- Civil Services & Defence (AVAILABLE DURING BACHELORS) ---
  { id: 110, title: "UPSC Civil Services (IAS/IPS)", type: "Exam", category: "Central", focus: "Administrative Services", reward: "IAS, IPS, IFS officer post", eligibility: "Any Degree", deadline: "Feb-March", eligibleYears: "Final Year / Graduate", link: "https://upsc.gov.in/", tags: ["UPSC", "Prestigious", "Bachelors Eligible"], matchCriteria: { state: "All" } },
  { id: 111, title: "CDS (Combined Defence Services)", type: "Exam", category: "Central", focus: "Army/Navy/AirForce Officer", reward: "Officer in Indian Armed Forces", eligibility: "Degree in any stream / Engg", deadline: "UPSC CDS I (Dec), CDS II (May)", eligibleYears: "Final Year / Graduate", link: "https://upsc.gov.in/", tags: ["Defence", "UPSC", "Bachelors Eligible"], matchCriteria: { state: "All" } },
  { id: 112, title: "AFCAT (Air Force CET)", type: "Exam", category: "Central", focus: "Air Force Officer", reward: "Flying/Ground Duty Officer", eligibility: "B.Tech / 60%+ in Physics/Math", deadline: "Jan and June", eligibleYears: "Final Year / Graduate", link: "https://afcat.cdac.in/", tags: ["Air Force", "Bachelors Eligible"], matchCriteria: { state: "All" } },
  { id: 113, title: "SSC CGL", type: "Exam", category: "Central", focus: "Group B & C Govt Posts", reward: "Inspector, Auditor, Assistant", eligibility: "Any Graduation", deadline: "June-July", eligibleYears: "Graduate (Final year can apply)", link: "https://ssc.nic.in/", tags: ["Govt Jobs", "Admin"], matchCriteria: { state: "All" } },

  // --- State Civil Services (Bachelors Eligible) ---
  { id: 601, title: "UPPSC (Uttar Pradesh PCS)", type: "Exam", category: "Regional", focus: "UP Civil Services", reward: "SDM, DSP, Tehsildar in UP", eligibility: "Any Graduation", deadline: "Jan-Feb", eligibleYears: "Final Year / Graduate", link: "https://uppsc.up.nic.in/", tags: ["UP", "PCS", "Bachelors Eligible"], matchCriteria: { state: "Uttar Pradesh" } },
  { id: 602, title: "BPSC (Bihar Public Service)", type: "Exam", category: "Regional", focus: "Bihar Civil Services", reward: "SDM, DSP in Bihar", eligibility: "Any Graduation", deadline: "Aug-Sept", eligibleYears: "Final Year / Graduate", link: "https://bpsc.bih.nic.in/", tags: ["Bihar", "PCS", "Bachelors Eligible"], matchCriteria: { state: "Bihar" } },
  { id: 603, title: "MPSC (Maharashtra State PCS)", type: "Exam", category: "Regional", focus: "Maharashtra Civil Services", reward: "Deputy Collector, DSP in MH", eligibility: "Any Graduation", deadline: "Dec-Jan", eligibleYears: "Final Year / Graduate", link: "https://mpsc.gov.in/", tags: ["Maharashtra", "PCS", "Bachelors Eligible"], matchCriteria: { state: "Maharashtra" } },
  { id: 604, title: "GPSC (Gujarat Civil Services)", type: "Exam", category: "Regional", focus: "Gujarat Class 1/2 posts", reward: "GAS, GPS officer in Gujarat", eligibility: "Any Graduation", deadline: "Oct-Nov", eligibleYears: "Final Year / Graduate", link: "https://gpsc.gujarat.gov.in/", tags: ["Gujarat", "PCS", "Bachelors Eligible"], matchCriteria: { state: "Gujarat" } },
  { id: 605, title: "WBPSC (West Bengal Civil Service)", type: "Exam", category: "Regional", focus: "WB Executive/Others", reward: "WBCS Executive Officer", eligibility: "Any Graduation + Bengali speaking", deadline: "Feb-March", eligibleYears: "Final Year / Graduate", link: "https://wbpsc.gov.in/", tags: ["West Bengal", "PCS", "Bachelors Eligible"], matchCriteria: { state: "West Bengal" } },
  { id: 606, title: "TNPSC (Tamil Nadu PCS)", type: "Exam", category: "Regional", focus: "TN Civil Services", reward: "Group 1/2 Officer in TN", eligibility: "Any Graduation", deadline: "Feb-May", eligibleYears: "Final Year / Graduate", link: "https://tnpsc.gov.in/", tags: ["Tamil Nadu", "PCS", "Bachelors Eligible"], matchCriteria: { state: "Tamil Nadu" } },
  { id: 607, title: "APPSC (Andhra Pradesh PCS)", type: "Exam", category: "Regional", focus: "AP Civil Services", reward: "Group 1/2 Officer in AP", eligibility: "Any Graduation", deadline: "Varies", eligibleYears: "Final Year / Graduate", link: "https://psc.ap.gov.in/", tags: ["Andhra Pradesh", "PCS", "Bachelors Eligible"], matchCriteria: { state: "Andhra Pradesh" } },
  { id: 608, title: "Kerala PSC (KAS)", type: "Exam", category: "Regional", focus: "Kerala Civil Services", reward: "KAS Officer Post", eligibility: "Any Graduation", deadline: "Varies", eligibleYears: "Final Year / Graduate", link: "https://keralapsc.gov.in/", tags: ["Kerala", "PCS", "Bachelors Eligible"], matchCriteria: { state: "Kerala" } },
  { id: 609, title: "OPSC (Odisha Civil Service)", type: "Exam", category: "Regional", focus: "Odisha Civil Services", reward: "OAS/OPS Officer Post", eligibility: "Any Graduation", deadline: "Varies", eligibleYears: "Final Year / Graduate", link: "https://opsc.gov.in/", tags: ["Odisha", "PCS", "Bachelors Eligible"], matchCriteria: { state: "Odisha" } },

  // --- Masters/Postgrad Exams ---
  { id: 106, title: "GATE", type: "Exam", category: "Technical", focus: "M.Tech/PhD/PSU", reward: "Masters Admission + Stipend", eligibility: "Engg/Science degree", deadline: "Aug-Sept", eligibleYears: "3rd/4th Year Bachelors", link: "https://gate2024.iisc.ac.in/", tags: ["Masters", "Engineering"], matchCriteria: { state: "All" } },
  { id: 107, title: "CAT", type: "Exam", category: "Management", focus: "MBA/PGDM Admissions", reward: "Entry to IIMs", eligibility: "50% in Graduation", deadline: "Aug-Sept", eligibleYears: "Final Year / Graduate", link: "https://iimcat.ac.in/", tags: ["MBA", "Masters"], matchCriteria: { state: "All" } },
  { id: 108, title: "IIT JAM", type: "Exam", category: "Science", focus: "M.Sc / Ph.D", reward: "M.Sc entry at IITs", eligibility: "B.Sc degree", deadline: "Sept-Oct", eligibleYears: "Final Year / Graduate", link: "https://jam.iitm.ac.in/", tags: ["Science", "Masters"], matchCriteria: { state: "All" } },
  
  // --- Central Scholarships ---
  { id: 1, title: "National Scholarship Portal (NSP)", type: "Scheme", category: "Central", focus: "Merit Students", reward: "Up to ₹20,000/yr", eligibility: "Class 12 Top 20th pct", deadline: "July - Dec (Varies)", eligibleYears: "1st/2nd/3rd year", link: "https://scholarships.gov.in/", tags: ["NSP", "Financial Aid"], matchCriteria: { state: "All" } },
  { id: 3, title: "AICTE Pragati", type: "Scheme", category: "Technical", focus: "Girls in Tech", reward: "₹50,000 per annum", eligibility: "1st yr Degree Girl Child", deadline: "Oct-Dec", eligibleYears: "1st Year Bachelors", link: "https://aicte-india.org/", tags: ["Women", "Tech"], matchCriteria: { gender: "female" } },
  { id: 6, title: "INSPIRE Scholarship (SHE)", type: "Scheme", category: "Central", focus: "Science Students", reward: "₹80,000/yr", eligibility: "Top 1% in Class 12 Science", deadline: "Oct-Dec", eligibleYears: "1st Year B.Sc/MS", link: "https://online-inspire.gov.in/", tags: ["Science", "Merit"], matchCriteria: { state: "All" } },
  { id: 9, title: "PMRF (Prime Minister Research)", type: "Scheme", category: "Technical", focus: "Elite PhD Research", reward: "₹80,000/mo + ₹2L grant", eligibility: "Direct PhD from IIT (8.0 CGPA)", deadline: "May (Lateral) / Sept (Direct)", eligibleYears: "Final Year (B.Tech) / Masters", link: "https://pmrf.in/", tags: ["PhD", "Fellowship"], matchCriteria: { state: "All" } },

  // --- Regional Mid-Bachelors Schemes ---
  { id: 301, title: "MYSY (Gujarat)", type: "Scheme", category: "Regional", focus: "Gujarat Merit", reward: "Tuition Fee Subsidy", eligibility: "80+ pct, Gujarat board", deadline: "Aug-Oct", eligibleYears: "Any Year Bachelors", link: "https://mysy.guj.nic.in/", tags: ["Gujarat", "Merit"], matchCriteria: { state: "Gujarat" } },
  { id: 302, title: "SVMCM (West Bengal)", type: "Scheme", category: "Regional", focus: "WB High Performers", reward: "Up to ₹60k/yr", eligibility: "60%+ marks, WB native", deadline: "Oct-Nov", eligibleYears: "Any Year Bachelors", link: "https://svmcm.wbhed.gov.in/", tags: ["WB", "Social welfare"], matchCriteria: { state: "West Bengal" } },
  { id: 305, title: "Bihar Student Credit Card", type: "Scheme", category: "Regional", focus: "Education Support", reward: "₹4L loan @ 1% interest", eligibility: "Bihar Domicile", deadline: "Year-round", eligibleYears: "Any Year Bachelors", link: "https://7nishchay-yuvaupmission.bihar.gov.in/", tags: ["Bihar", "Loan"], matchCriteria: { state: "Bihar" } },
  { id: 309, title: "Jagananna Vidya Deevena (AP)", type: "Scheme", category: "Regional", focus: "AP Full Reimbursement", reward: "Full Course Fee coverage", eligibility: "AP Domicile, Income < ₹2.5L", deadline: "Quarterly", eligibleYears: "Any Year Bachelors", link: "https://jnanabhumi.ap.gov.in/", tags: ["Andhra Pradesh", "High Value"], matchCriteria: { state: "Andhra Pradesh" } },
  { id: 310, title: "DCE Kerala Scholarship", type: "Scheme", category: "Regional", focus: "Kerala High Ed", reward: "₹1,250 - ₹1,500 monthly", eligibility: "Kerala native, 50%+ marks", deadline: "Nov-Jan", eligibleYears: "Any Year Bachelors", link: "https://dcescholarship.kerala.gov.in/", tags: ["Kerala", "Merit"], matchCriteria: { state: "Kerala" } },
  { id: 311, title: "Odisha PRERANA Scholarship", type: "Scheme", category: "Regional", focus: "Odisha Post-Matric", reward: "Maintenance + Tuition Fee", eligibility: "Odisha Native, SC/ST/OBC/EBC", deadline: "Nov-Dec", eligibleYears: "Any Year Bachelors", link: "https://scholarship.odisha.gov.in/", tags: ["Odisha", "Reservation"], matchCriteria: { state: "Odisha" } },
  { id: 312, title: "TN First Graduate Scholarship", type: "Scheme", category: "Regional", focus: "Tamil Nadu FG", reward: "Tuition Fee Concession", eligibility: "TN Native, First grad in family", deadline: "Admission time", eligibleYears: "1st Year Bachelors", link: "https://tneaonline.org/", tags: ["Tamil Nadu", "First Graduate"], matchCriteria: { state: "Tamil Nadu" } },

  // --- Private & Foundation Scholarships ---
  { id: 401, title: "Reliance Foundation", type: "Scheme", category: "Private", focus: "Excellence in Ed", reward: "Up to ₹2L (UG)", eligibility: "Merit (Entrance basis)", deadline: "Jan-Feb", eligibleYears: "1st Year Bachelors", link: "https://reliancefoundation.org/", tags: ["Private", "High Value"], matchCriteria: { state: "All" } },
  { id: 403, title: "HDFC Badhte Kadam", type: "Scheme", category: "Private", focus: "Social Need", reward: "₹15k - ₹1L", eligibility: "Income < ₹6L, 60% marks", deadline: "March-July", eligibleYears: "Any Year Bachelors", link: "https://buddy4study.com/", tags: ["HDFC", "Need-based"], matchCriteria: { state: "All" } }
];

export const getSchemes = async (req, res, next) => {
  try {
    const operations = initialSchemes.map(s => ({
      updateOne: {
        filter: { id: s.id },
        update: { $set: s },
        upsert: true
      }
    }));
    
    await Scheme.bulkWrite(operations);
    
    const allSchemes = await Scheme.find().sort({ type: 1, id: 1 });
    res.status(200).send(allSchemes);
  } catch (err) {
    next(err);
  }
};

export const syncSchemes = async (req, res, next) => {
  try {
    if (req.role !== "admin" && req.role !== "root") {
      return next(createError(403, "Only admins can sync data!"));
    }
    const newList = req.body.schemes || initialSchemes;
    const operations = newList.map(s => ({
      updateOne: {
        filter: { id: s.id },
        update: { $set: s },
        upsert: true
      }
    }));
    await Scheme.bulkWrite(operations);
    res.status(200).send({ message: "Schemes synced successfully!", count: newList.length });
  } catch (err) {
    next(err);
  }
};
