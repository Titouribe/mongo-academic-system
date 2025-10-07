use("academic_system");

db.createCollection("program", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "code", "faculty"],
            properties: {
                name: { 
                    bsonType: "string",
                    description: "Name of the program - REQUIERED"
                    },
                code: { 
                    bsonType: "string",
                    description: "Unique code of the program - REQUIRED" 
                    },
                faculty: {
                    bsonType: "string",
                    description: "Unique code of the program - REQUIRED"
                    },
                semester_duration: {
                    bsonType: "int",
                    minimum: 1,
                    description: "Duration of semesters in number"
                    },
                requirements: {
                    bsonType: "array",
                    description: "List of graduation requirements",
                    items: {
                        bsonType: "object",
                        required: ["type", "description"],
                        properties: {
                            type: { 
                                bsonType: "string" 
                            },
                            description: { 
                                bsonType: "string" 
                            }
                        }
                    }
                }
            }
        }
    },
    validationAction: "error"
});
db.program.createIndex({ code: 1 }, { unique: true });
print("✅ 'programs' collection created with validations.");

db.createCollection("subject", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "code", "credits"],
            properties: {
                name: { 
                    bsonType: "string",
                    description: "Name of the course - REQUIERED" 
                    },
                code: { 
                    bsonType: "string",
                    description: "Unique code of the course - REQUIRED" 
                    },
                credits: { 
                    bsonType: "int",
                    minimum: 1,
                    description: "Number of credits - REQUIRED" 
                    },
                description: { 
                    bsonType: "string" 
                },
                pre_requirements: {
                    bsonType: "array",
                    description: "List of subject codes that are requirements",
                    items: {
                        bsonType: "string"
                    }
                }
            }
        }
    },
    validationAction: "error"
});
db.subject.createIndex({ code: 1 }, { unique: true });
print("✅ 'subject' collection created with validations.");

db.createCollection("instructor", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "identification", "specialty"],
            properties: {
                name: { 
                    bsonType: "string",
                    description: "Name of the instructor - REQUIERED" 
                },
                identification: { 
                    bsonType: "string",
                    description: "Unique identification of the instructor - REQUIRED" 
                },
                specialty: { 
                    bsonType: "string",
                    description: "Speciality of the instructor - REQUIRED" 
                },
                materias_asignadas: {
                    bsonType: "array",
                    description: "List of subject ids (reference subject._id)",
                    items: {
                        bsonType: "objectId"
                    }
                }
            }
        }
    },
    validationAction: "error"
});
db.instructor.createIndex({ identification: 1 }, { unique: true });
print("✅ 'instructor' collection created with validations.");

db.createCollection("student", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "identification", "program_id"],
            properties: {
                name: { 
                    bsonType: "string",
                    description: "Name of the student - REQUIERED" 
                },
                identificacion: { 
                    bsonType: "string",
                    description: "Unique identification of the student - REQUIRED" 
                    },
                program_id: {
                    bsonType: "objectId",
                    description: "reference program._id." 
                },
                born_date: { 
                    bsonType: "date" 
                },
                academic_record: {
                    bsonType: "array",
                    description: "Grade record by subject",
                    items: {
                        bsonType: "object",
                        required: ["subject_id", "period", "grade"],
                        properties: {
                            subject_id: { 
                                bsonType: "objectId" 
                            },
                            period: { 
                                bsonType: "string" 
                            },
                            grade: { 
                                bsonType: ["double", "int"],
                                minimum: 0 
                                }
                        }
                    }
                }
            }
        }
    },
    validationAction: "error"
});
db.student.createIndex({ identificacion: 1 }, { unique: true });
print("✅ 'student' collection created with validations.");

db.createCollection("enrollment", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["student_id", "subject_id", "instructor_id", "period"],
            properties: {
                student_id: { 
                    bsonType: "objectId",
                    description: "Reference student._id." 
                    },
                subject_id: { 
                    bsonType: "objectId",
                    description: "Reference subject._id." 
                    },
                instructor_id: { 
                    bsonType: "objectId",
                    description: "Reference instructor._id." 
                    },
                period: { 
                    bsonType: "string",
                    description: "Ej: '2025-1'." 
                    },
                enrollment_day: { 
                    bsonType: "date" 
                }
            }
        }
    },
    validationAction: "error"
});

db.enrollment.createIndex({ student_id: 1, subject_id: 1, period: 1 }, { unique: true });
print("✅ 'enrollment' collection created with validations.");