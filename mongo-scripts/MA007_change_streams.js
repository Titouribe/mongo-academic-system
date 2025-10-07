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