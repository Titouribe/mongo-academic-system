🏛 Sistema Académico Universitario (MongoDB)
Este proyecto implementa un sistema de gestión académica para una universidad utilizando una base de datos NoSQL con MongoDB, enfocado en la flexibilidad, escalabilidad y funcionalidades avanzadas.

📋 Tabla de Contenidos
Información General y Contexto

Diseño del Esquema

Funcionalidades Avanzadas

Funciones de Agregación

Change Streams

Entregables

ℹ Información General y Contexto
🎯 Objetivo Principal: Modernizar el sistema de gestión académica implementando una base de datos NoSQL que permita mayor flexibilidad y escalabilidad para manejar los datos universitarios.

🛠 Herramientas Requeridas: MongoDB Atlas (Capa Gratuita), MongoDB Compass, Editor de Código.

🗂 Base de Datos: academic_system.

¿Por qué MongoDB?
La elección de MongoDB se justifica por su capacidad para manejar la naturaleza variable de los datos académicos (diferentes tipos de evaluaciones, planes de estudio flexibles) y la necesidad de ejecutar consultas rápidas sobre documentos complejos y anidados.

🏛 Diseño del Esquema (Colecciones)
El sistema utiliza cinco colecciones principales, implementadas con Validación de Esquemas ($jsonSchema) para garantizar la integridad y consistencia de los datos.

Colección	Propósito	Campos Requeridos	Notas de Diseño
program	Carreras y planes de estudio.	name, code, faculty	Incluye duración (semester_duration) y requisitos (requirements) embebidos.
subject	Información de cursos y créditos.	name, code, credits	El campo credits debe ser como mínimo 1. Permite definir prerrequisitos.
instructor	Datos de los profesores.	name, identification, specialty	El campo identification es único. Permite listar materias asignadas.
student	Información personal y académica.	name, identification, program_id	El historial (academic_record) es un array embebido.
enrollment	Registro de inscripciones por período.	student_id, subject_id, instructor_id	Registra referencias a las otras colecciones y el período académico.

Exportar a Hojas de cálculo
✨ Ejemplos de Validaciones Implementadas
Rango Válido: Las notas (grade) en academic_record deben tener un minimum de 0.

Campos Obligatorios: Se asegura que campos esenciales como name, code, identification y las referencias (_id) siempre existan.

Unicidad: Se crean índices únicos en campos clave como code (en program y subject) e identification (en instructor y student).

Acción de Validación: Se utiliza validationAction: "error" para rechazar de forma estricta cualquier documento que no cumpla con el esquema definido.

⚙ Funcionalidades Avanzadas
📊 Funciones de Agregación y Reportes
Se desarrollaron funciones de agregación complejas, equivalentes a procedimientos almacenados, para generar reportes clave para el negocio.

Listar Estudiantes en Riesgo Académico:

Utiliza $match para filtrar estudiantes con promedio_acumulado < 3.0 y estado "Activo".

Emplea $project y lógica condicional ($cond) para clasificar el nivel_riesgo en "Alto" o "Medio".

Calcular Promedio por Materia:

Agrupa las calificaciones de la colección de inscripciones para obtener el promedio general de cada curso.

Reporte de Materias más Reprobadas:

Genera un ranking de las materias con mayor número de estudiantes con calificación reprobatoria.

Carga Académica de Profesores:

Calcula el número de materias y estudiantes que tiene a cargo cada profesor en un período determinado.

Ranking de Mejores Estudiantes:

Obtiene un listado de los estudiantes con el mejor promedio académico por cada programa.

⚡ Change Streams (Equivalente a Triggers)
Se implementaron Change Streams para reaccionar a cambios en los datos en tiempo real, permitiendo operaciones asíncronas y automatizadas.

Auditoría de Cambios en Estudiantes:

Escucha eventos en db.estudiantes.watch() y registra la operación (operationType), el documento afectado y los campos modificados (updateDescription) en una colección de auditoría.

Notificación de Riesgo Académico:

Dispara una alerta automática cuando el promedio de un estudiante cae por debajo de 3.0.

Actualización de Créditos Cursados:

Actualiza automáticamente el total de créditos aprobados por un estudiante cuando se registra una nueva materia con calificación aprobatoria.

Validación de Cupos en Tiempo Real:

Controla el número máximo de inscripciones permitidas por materia, previniendo la sobreinscripción.

Historial de Calificaciones:

Mantiene un log detallado de cualquier modificación realizada en el historial académico (academic_record) de un estudiante.

📦 Entregables
Archivo de Scripts MongoDB (.js o .txt)

Creación de colecciones con validaciones de esquema.

Scripts de inserción de datos (mínimo 20 documentos por colección).

Funciones CRUD documentadas (Crear, Leer, Actualizar, Borrar).

Implementación de Transacciones ACID.

Código de las Funciones de Agregación.

Implementación de los Change Streams.

Documento de Diseño (PDF o Word)

Diagrama o modelo de las colecciones y sus relaciones.

Justificación de las decisiones de diseño (ej. por qué usar datos embebidos vs. referenciados).

Explicación detallada de las validaciones de esquema.

Documentación del funcionamiento y propósito de las agregaciones y Change Streams.
