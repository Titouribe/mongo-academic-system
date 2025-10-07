use("academic_system");

function createNewStudent(name, identification, programId) {
    const studentDocument = {
        name: name,
        identification: identification,
        program_id: programId,
        born_date: new Date(),
        academic_record: []
    };
    db.students.insertOne(studentDocument);
}

function readStudentsByProgram(programId) {
    db.students.find({ program_id: programId })
    .toArray()
    .forEach(s => print(`- ${s.name} (ID: ${s._id})`));
}

function addGradeToStudent(studentId, subjectId, period, grade) {
    const gradeEntry = {
        subject_id: subjectId,
        period: period,
        grade: grade
    };

    db.students.updateOne(
        { _id: studentId },
        { $push: { academic_record: gradeEntry } }
    );
}

function deleteStudentById(studentId) {
    db.students.deleteOne({ _id: studentId });
}

function createNewInstructor(name, identification, specialty) {
    const instructorDocument = {
        name: name,
        identification: identification,
        specialty: specialty,
        assigned_subjects: []
    };

    db.instructors.insertOne(instructorDocument);
}

function readInstructorsBySpecialty(specialty) {
    db.instructors.find({ specialty: specialty })
    .toArray()
    .forEach(i => print(`- ${i.name} (ID: ${i.identification})`));
}

function updateInstructorAssignSubject(instructorId, subjectId) {
    db.instructors.updateOne(
        { _id: instructorId },
        { $addToSet: { assigned_subjects: subjectId } }
    );
}

function deleteInstructorById(instructorId) {
    db.instructors.deleteOne({ _id: instructorId });
}
