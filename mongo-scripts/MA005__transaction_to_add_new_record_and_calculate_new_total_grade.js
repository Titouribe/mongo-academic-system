use("academic_system");

function recordGradeAndUpdateStudentAccumulatedAverage(studentId, subjectId, newGrade, period) {
    const session = db.getMongo().startSession();

    try {
        session.startTransaction({
            readConcern: { level: 'snapshot' },
            writeConcern: { w: 'majority' }
        });
        
        const gradeEntry = {
            subject_id: subjectId,
            period: period,
            grade: newGrade
        };

        const updateRecordResult = db.students.updateOne(
            { _id: studentId },
            { $push: { academic_record: gradeEntry } },
            { session }
        );

        if (updateRecordResult.modifiedCount !== 1) {
            throw new Error("The student's academic record could not be updated.");
        }

        const student = db.students.findOne({ _id: studentId }, { academic_record: 1 }, { session });

        if (!student || !student.academic_record || student.academic_record.length === 0) {
            throw new Error("Error retrieving history to calculate the new average");
        }
        
        const totalGrades = student.academic_record.reduce((sum, entry) => sum + entry.grade, 0);
        const newAverage = parseFloat((totalGrades / student.academic_record.length).toFixed(2));
        
        db.students.updateOne(
            { _id: studentId },
            { $set: { gpa: newAverage } },
            { session }
        );

        session.commitTransaction();

    } catch (error) {
        session.abortTransaction();
        print(`❌ TRANSACTION ABORTED: ${error.message}`);
    } finally {
        session.endSession();
    }
}