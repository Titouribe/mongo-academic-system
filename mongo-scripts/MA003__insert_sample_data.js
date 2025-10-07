use("academic_system");

const FACULTIES = ["Engineering", "Arts and Humanities", "Sciences", "Business", "Health"];
const PROGRAM_PREFIXES = ["Bachelor of", "Master of", "Doctorate in"];
const AREAS = [
    { name: "Software", code: "SOFT", duration: 8 },
    { name: "Civil", code: "CIVIL", duration: 10 },
    { name: "Literature", code: "LIT", duration: 8 },
    { name: "Physics", code: "PHYS", duration: 6 },
    { name: "Administration", code: "BUS", duration: 8 },
    { name: "Nursing", code: "NURS", duration: 8 },
];
const REQUIREMENT_TYPES = ["Thesis", "Internship", "Final Project", "Comprehensive Exam"];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const programsData = [];
const programGeneratedCodes = new Set();

for (let i = 1; i <= 20; i++) {
    const randomFaculty = getRandomElement(FACULTIES);
    const randomArea = getRandomElement(AREAS);
    const randomPrefix = getRandomElement(PROGRAM_PREFIXES);
    const randomReqType = getRandomElement(REQUIREMENT_TYPES);
    
    let programCode;
    let codeBase = randomPrefix.substring(0, 2).toUpperCase() + "-" + randomArea.code;
    
    let counter = 1;
    do {
        programCode = `${codeBase}${counter.toString().padStart(2, '0')}`;
        counter++;
    } while (programGeneratedCodes.has(programCode));
    
    programGeneratedCodes.add(programCode);

    programsData.push({
        name: `${randomPrefix} ${randomArea.name} Engineering`,
        code: programCode,
        faculty: randomFaculty,
        semester_duration: randomArea.duration, 
        requirements: [
            { 
                type: randomReqType, 
                description: `Must complete a ${randomReqType} to graduate.` 
            },
        ]
    });
}

const programsResult = db.program.insertMany(programsData);
const programIds = Object.values(programsResult.insertedIds);

const SUBJECT_AREAS = [
    { prefix: "Math", name: "Mathematics", levels: [100, 200, 300], credits: [3, 4] },
    { prefix: "CS", name: "Computer Science", levels: [100, 200, 300, 400], credits: [3, 4, 5] },
    { prefix: "LANG", name: "Languages", levels: [101, 201, 301], credits: [2, 3] },
    { prefix: "DESIGN", name: "Design & Arts", levels: [150, 250], credits: [3, 5] },
];

const SUBJECT_TYPES = [
    "Introduction to",
    "Advanced Topics in",
    "Applied",
    "Theoretical Foundations of",
    "Fundamentals of"
];

const subjectsData = [];
const subjectGeneratedCodes = new Set();

for (let i = 1; i <= 20; i++) {
    const randomArea = getRandomElement(SUBJECT_AREAS);
    const randomLevel = getRandomElement(randomArea.levels);
    const randomType = getRandomElement(SUBJECT_TYPES);
    const randomCredits = getRandomElement(randomArea.credits);

    let subjectCode = `${randomArea.prefix}${randomLevel}`;
    let counter = 1;
    
    let originalCode = subjectCode;
    while (subjectGeneratedCodes.has(subjectCode)) {
        subjectCode = `${originalCode}-${counter}`;
        counter++;
    }
    
    subjectGeneratedCodes.add(subjectCode);

    subjectsData.push({
        name: `${randomType} ${randomArea.name}`,
        code: subjectCode,
        credits: randomCredits,
        description: `This course covers ${randomType.toLowerCase()} ${randomArea.name.toLowerCase()}.`,
        pre_requirements: []
    });
}
const subjectsResult = db.subject.insertMany(subjectsData);
const subjectIds = Object.values(subjectsResult.insertedIds);

const PROFESSOR_TITLES = ["Dr.", "Prof.", "Ing.", "MSc."];
const PROFESSOR_NAMES = [
    "Juan Pérez", "María López", "Carlos García", "Ana Martínez", "Pedro Sánchez",
    "Laura Gómez", "David Ruiz", "Elena Fernández", "Alejandro Torres", "Sofía Díaz"
];

const SPECIALTIES = [
    "Artificial Intelligence", "Calculus and Algebra", "Modern Literature", 
    "Financial Accounting", "Organic Chemistry", "Cybersecurity", "Applied Linguistics"
];


const instructorsData = [];

for (let i = 1; i <= 20; i++) {
    const randomTitle = getRandomElement(PROFESSOR_TITLES);
    const randomName = getRandomElement(PROFESSOR_NAMES) + (i > 10 ? ` y ${i - 10}` : ''); // Pequeña variación
    const randomSpecialty = getRandomElement(SPECIALTIES);
    
    let identificationCode = `I-${getRandomInt(1000, 9999)}`;

    const numSubjectsToAssign = getRandomInt(3, 7);
    
    const startIndex = getRandomInt(0, subjectIds.length - numSubjectsToAssign);
    const assignedSubjects = subjectIds.slice(startIndex, startIndex + numSubjectsToAssign);

    instructorsData.push({
        name: `${randomTitle} ${randomName}`,
        identification: identificationCode,
        specialty: randomSpecialty,
        assigned_subjects: assignedSubjects
    });
}

const instructorsResult = db.instructor.insertMany(instructorsData);
const instructorIds = Object.values(instructorsResult.insertedIds);

const STUDENT_FIRST_NAMES = ["Andrés", "Valentina", "Ricardo", "Camila", "Javier", "Isabella", "Felipe", "Daniela", "Mauricio", "Paula"];
const STUDENT_LAST_NAMES = ["Rodríguez", "Gómez", "López", "Díaz", "Pérez", "Castro", "Vargas", "Mendoza"];

const studentsData = [];

for (let i = 1; i <= 20; i++) {
    const randomFirstName = getRandomElement(STUDENT_FIRST_NAMES);
    const randomLastName = getRandomElement(STUDENT_LAST_NAMES);
    const randomProgramId = getRandomElement(programIds);
    
    let identificationCode = `I-${getRandomInt(1000, 9999)}`;
    
    const currentYear = new Date().getFullYear();
    const birthYear = getRandomInt(currentYear - 25, currentYear - 18);
    const birthDate = new Date(`${birthYear}-${getRandomInt(1, 12).toString().padStart(2, '0')}-${getRandomInt(1, 28).toString().padStart(2, '0')}`);

    studentsData.push({
        name: `${randomFirstName} ${randomLastName}`,
        identification: identificationCode,
        program_id: randomProgramId,
        born_date: birthDate
    });
}

const studentsResult = db.student.insertMany(studentsData); 
const studentIds = Object.values(studentsResult.insertedIds);

const PERIODS = ["2024-1", "2024-2", "2025-1"];

const enrollmentsData = [];
const uniqueEnrollments = new Set();

const TARGET_ENROLLMENTS = 40;
let attempts = 0;

while (enrollmentsData.length < TARGET_ENROLLMENTS && attempts < 200) {
    
    const randomStudentId = getRandomElement(studentIds);
    const randomSubjectId = getRandomElement(subjectIds);
    const randomInstructorId = getRandomElement(instructorIds);
    const randomPeriod = getRandomElement(PERIODS);
    
    const enrollmentKey = `${randomStudentId}-${randomSubjectId}-${randomPeriod}`;
    
    if (!uniqueEnrollments.has(enrollmentKey)) {
        
        uniqueEnrollments.add(enrollmentKey);
        const enrollmentDate = new Date();
        enrollmentDate.setDate(enrollmentDate.getDate() - getRandomInt(10, 365));

        enrollmentsData.push({
            student_id: randomStudentId,
            subject_id: randomSubjectId,
            instructor_id: randomInstructorId,
            period: randomPeriod,
            enrollment_day: enrollmentDate,
        });
    }
    attempts++;
}

const enrollmentsResult = db.enrollment.insertMany(enrollmentsData);
