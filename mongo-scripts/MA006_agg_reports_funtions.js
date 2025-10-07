use("academic_system");
// ============================================
// AGREGACIÓN: Estudiantes en riesgo académico
// Descripción: Identifica estudiantes con promedio menor a 3.0
// ============================================
function estudiantesEnRiesgo() {
    // Nota: Se asume la existencia del campo 'promedio_acumulado' y 'estado' en la colección student/estudiantes.
    return db.student.aggregate([
        {
            $match: {
                // Filtra estudiantes activos cuyo promedio acumulado sea menor a 3.0
                promedio_acumulado: { $lt: 3.0 },
                estado: "Activo"
            }
        },
        {
            $project: {
                codigo: 1, // Asumiendo que 'codigo' es la 'identification'
                nombre: "$name", // El nombre es 'name'
                email: 1,
                promedio_acumulado: 1,
                semestre_actual: 1,
                // Clasificación condicional del riesgo
                nivel_riesgo: {
                    $cond: {
                        if: { $lt: ["$promedio_acumulado", 2.5] },
                        then: "Alto",
                        else: "Medio"
                    }
                }
            }
        },
        {
            $sort: { promedio_acumulado: 1 } // Ordena del promedio más bajo al más alto
        }
    ]).toArray();
}

// ============================================
// AGREGACIÓN: Promedio de calificaciones por materia
// ============================================
function promedioNotasPorMateria() {
    return db.student.aggregate([
        // Paso 1: Desanidar el historial académico
        { $unwind: "$academic_record" },
        
        // Paso 2: Calcular el promedio agrupando por ID de materia
        {
            $group: {
                _id: "$academic_record.subject_id",
                promedio_general: { $avg: "$academic_record.grade" },
                total_registros: { $sum: 1 }
            }
        },
        
        // Paso 3: Unir con la colección 'subject' para obtener el nombre
        {
            $lookup: {
                from: "subject",
                localField: "_id",
                foreignField: "_id",
                as: "materia_info"
            }
        },
        
        // Paso 4: Desanidar la info de la materia (para fácil acceso)
        { $unwind: "$materia_info" },
        
        // Paso 5: Proyectar el resultado final
        {
            $project: {
                _id: 0,
                codigo_materia: "$materia_info.code",
                nombre_materia: "$materia_info.name",
                promedio_general: { $round: ["$promedio_general", 2] }, // Redondeo a 2 decimales
                total_estudiantes: "$total_registros"
            }
        },
        
        // Paso 6: Ordenar por promedio
        { $sort: { promedio_general: -1 } }
    ]).toArray();
}

// ============================================
// AGREGACIÓN: Reporte de materias más reprobadas
// ============================================
function reporteMateriasReprobadas(notaMinimaAprobacion = 3.0) {
    return db.student.aggregate([
        // Paso 1: Desanidar el historial académico
        { $unwind: "$academic_record" },
        
        // Paso 2: Filtrar solo las notas reprobatorias ($lt: menor que)
        {
            $match: {
                "academic_record.grade": { $lt: notaMinimaAprobacion }
            }
        },
        
        // Paso 3: Contar las reprobaciones por materia
        {
            $group: {
                _id: "$academic_record.subject_id",
                total_reprobados: { $sum: 1 }
            }
        },
        
        // Paso 4: Unir con la colección 'subject' para obtener el nombre
        {
            $lookup: {
                from: "subject",
                localField: "_id",
                foreignField: "_id",
                as: "materia_info"
            }
        },
        
        // Paso 5: Proyectar y ordenar
        {
            $project: {
                _id: 0,
                nombre_materia: { $arrayElemAt: ["$materia_info.name", 0] },
                total_reprobados: 1
            }
        },
        
        // Paso 6: Ordenar de la materia más reprobada a la menos reprobada
        { $sort: { total_reprobados: -1 } },
        
        // Paso 7: Limitar a las 10 materias más reprobadas
        { $limit: 10 }
    ]).toArray();
}

// ============================================
// AGREGACIÓN: Carga académica de profesores
// Descripción: Calcula el número de materias y estudiantes asignados a un instructor
// ============================================
function cargaAcademicaProfesores(periodoAcademico) {
    return db.enrollment.aggregate([
        // Paso 1: Filtrar por el período requerido
        { $match: { period: periodoAcademico } },
        
        // Paso 2: Agrupar por instructor y contar el número de inscripciones (estudiantes)
        {
            $group: {
                _id: "$instructor_id",
                total_estudiantes_inscritos: { $sum: 1 },
                // Contar cuántas materias distintas tiene asignadas
                materias_distintas: { $addToSet: "$subject_id" }
            }
        },
        
        // Paso 3: Calcular el tamaño del array de materias distintas
        {
            $addFields: {
                total_materias_asignadas: { $size: "$materias_distintas" }
            }
        },
        
        // Paso 4: Unir con la colección 'instructor' para obtener el nombre
        {
            $lookup: {
                from: "instructor",
                localField: "_id",
                foreignField: "_id",
                as: "instructor_info"
            }
        },
        
        // Paso 5: Proyectar los resultados
        {
            $project: {
                _id: 0,
                nombre_instructor: { $arrayElemAt: ["$instructor_info.name", 0] },
                identificacion: { $arrayElemAt: ["$instructor_info.identification", 0] },
                periodo: periodoAcademico,
                total_materias_asignadas: 1,
                total_estudiantes_a_cargo: "$total_estudiantes_inscritos"
            }
        },
        
        // Paso 6: Ordenar por el número de materias asignadas
        { $sort: { total_materias_asignadas: -1 } }
    ]).toArray();
}

// ============================================
// AGREGACIÓN: Ranking de mejores estudiantes por programa
// Descripción: Lista los 5 estudiantes con mejor promedio por cada programa
// ============================================
function rankingEstudiantesPorPrograma(limitePorPrograma = 5) {
    return db.student.aggregate([
        // Paso 1: Unir con la colección 'program' para obtener el nombre del programa
        {
            $lookup: {
                from: "program",
                localField: "program_id",
                foreignField: "_id",
                as: "programa_info"
            }
        },
        {
            $unwind: "$programa_info"
        },
        
        // Paso 2: Ordenar primero por programa y luego por promedio acumulado (descendente)
        {
            $sort: {
                "programa_info.name": 1,
                promedio_acumulado: -1
            }
        },
        
        // Paso 3: Aplicar el operador $group para usar $push y obtener el ranking
        {
            $group: {
                _id: "$program_id",
                nombre_programa: { $first: "$programa_info.name" },
                // Empujar todos los estudiantes del grupo en un array, manteniendo el orden
                estudiantes_ranking: {
                    $push: {
                        nombre: "$name",
                        promedio: "$promedio_acumulado",
                        identificacion: "$identification"
                    }
                }
            }
        },
        
        // Paso 4: Proyectar solo los N primeros estudiantes de la lista
        {
            $project: {
                _id: 0,
                nombre_programa: 1,
                top_estudiantes: { $slice: ["$estudiantes_ranking", limitePorPrograma] }
            }
        }
    ]).toArray();
}