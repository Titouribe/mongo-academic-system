use("academic_system");
// ============================================
// CHANGE STREAM: Auditoría de cambios en estudiantes
// Descripción: Registra todos los cambios en la colección de estudiantes
// ============================================
// Configuración: db.student.watch() abre el Change Stream
const changeStreamEstudiantes = db.student.watch();

changeStreamEstudiantes.on("change", function(change) {
    // Definición del documento de auditoría
    const auditoria = {
        fecha: new Date(),
        operacion: change.operationType, // 'insert', 'update', 'delete', etc.
        coleccion: "student",
        documento_id: change.documentKey._id,
        // Almacena los campos modificados, si es una operación de 'update'
        cambios: change.updateDescription || {},
        usuario: "sistema" 
    };

    // Inserta el registro de auditoría
    db.auditoria.insertOne(auditoria);
    print("Auditoría registrada: " + change.operationType);
});

// ============================================
// CHANGE STREAM: Notificación de riesgo académico
// Descripción: Alerta cuando el promedio acumulado baja de 3.0
// ============================================
const umbralRiesgo = 3.0;

// Filtramos solo las operaciones de actualización en la colección 'student'
const changeStreamRiesgo = db.student.watch([
    { $match: { "operationType": "update" } }
]);

changeStreamRiesgo.on("change", function(change) {
    const updatedFields = change.updateDescription.updatedFields;

    // Verificamos si el campo 'promedio_acumulado' fue actualizado
    if (updatedFields && updatedFields.promedio_acumulado) {
        const nuevoPromedio = updatedFields.promedio_acumulado;
        
        if (nuevoPromedio < umbralRiesgo) {
            // Se asume una función o servicio de notificación (e.g., log, email service)
            print(`--- ⚠️ ALERTA DE RIESGO ACADÉMICO ---`);
            print(`Estudiante ID: ${change.documentKey._id}`);
            print(`Nuevo Promedio: ${nuevoPromedio}`);
            print("Acción requerida: Notificar al consejero académico.");
            // Lógica de negocio adicional: Enviar email, insertar en tabla de seguimiento, etc.
        }
    }
});

// ============================================
// CHANGE STREAM: Actualización de créditos
// Descripción: Suma créditos al estudiante si se registra una nota aprobatoria
// ============================================
const notaAprobatoria = 3.0;

// Monitorea cambios en el array 'academic_record' dentro de 'student'
const changeStreamCreditos = db.student.watch([
    { $match: { 
        "operationType": { $in: ["update", "replace"] },
        "updateDescription.updatedFields.academic_record": { $exists: true }
    } }
]);

changeStreamCreditos.on("change", async function(change) {
    // Para implementar correctamente esta lógica, se requeriría más contexto 
    // sobre cómo se modificó exactamente el array embebido. 
    // Una implementación más robusta usaría una función de backend (Lambda/Cloud Function) 
    // que revisara el documento completo después del cambio.

    // *Ejemplo Simplificado (asume que la calificación más reciente fue la causa del cambio):*
    
    // 1. Obtener el ID del estudiante
    const studentId = change.documentKey._id;

    // 2. Leer el documento actualizado para verificar la última nota (fuera del Change Stream)
    // NOTE: Se requiere el uso de db.getMongo().getDB('academic_system') para consultas dentro del listener
    const updatedStudent = await db.student.findOne({ _id: studentId });

    if (updatedStudent && updatedStudent.academic_record.length > 0) {
        const ultimaNota = updatedStudent.academic_record.slice(-1); // Último elemento
        
        if (ultimaNota.grade >= notaAprobatoria) {
            
            // 3. Buscar los créditos de la materia aprobada (Requiere Lookup con subject)
            const materia = await db.subject.findOne({ _id: ultimaNota.subject_id }); 
            const creditosAprobados = materia ? materia.credits : 0;

            if (creditosAprobados > 0) {
                // 4. Actualizar el total de créditos cursados del estudiante
                const result = await db.student.updateOne(
                    { _id: studentId },
                    { $inc: { creditos_cursados: creditosAprobados } } // Asumimos este campo existe
                );
                print(`Créditos actualizados para ${studentId}. Se sumaron ${creditosAprobados} créditos.`);
            }
        }
    }
});

// ============================================
// CHANGE STREAM: Validación de cupos
// Descripción: Controla el máximo de inscripciones por materia
// ============================================
const cupoMaximo = 40;

const changeStreamCupos = db.enrollment.watch([
    { $match: { "operationType": "insert" } }
]);

changeStreamCupos.on("change", async function(change) {
    const nuevaInscripcion = change.fullDocument;
    const subjectId = nuevaInscripcion.subject_id;
    const periodo = nuevaInscripcion.period; 

    // 1. Contar cuántas inscripciones existen para esta materia y período
    const conteo = await db.enrollment.countDocuments({ 
        subject_id: subjectId,
        period: periodo
    });

    if (conteo > cupoMaximo) {
        // En una aplicación real, se debería usar una Transacción antes de la inserción.
        // Aquí, simplemente se alerta sobre la violación del cupo.
        
        // Opcional: Eliminar la última inscripción si se excede el límite
        // db.enrollment.deleteOne({ _id: nuevaInscripcion._id }); 
        
        const materiaInfo = await db.subject.findOne({ _id: subjectId });
        const nombreMateria = materiaInfo ? materiaInfo.name : subjectId;
        
        print(`--- 🚨 ADVERTENCIA DE CUPO ---`);
        print(`Materia: ${nombreMateria}`);
        print(`Período: ${periodo}`);
        print(`Cupo excedido: Hay ${conteo} inscritos. Límite: ${cupoMaximo}`);
    }
});

// ============================================
// CHANGE STREAM: Historial académico de calificaciones
// Descripción: Registra todos los cambios en el array academic_record
// ============================================
const changeStreamHistorial = db.student.watch([
    { $match: { 
        "operationType": "update",
        "updateDescription.updatedFields.academic_record": { $exists: true }
    } }
]);

changeStreamHistorial.on("change", function(change) {
    const studentId = change.documentKey._id;
    const cambios = change.updateDescription;

    const registroHistorial = {
        fecha_cambio: new Date(),
        student_id: studentId,
        operacion: "Modificación de Notas",
        // Muestra qué campos fueron modificados dentro de la actualización
        detalle_actualizacion: cambios.updatedFields, 
        removed_fields: cambios.removedFields || [],
    };

    // Inserta el registro en una colección dedicada al historial de notas
    db.historial_calificaciones.insertOne(registroHistorial);
    print(`Historial de calificaciones registrado para el estudiante: ${studentId}`);
});