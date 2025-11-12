Tecnológico Nacional de México
Instituto Tecnológico de Ensenada

Asignatura: Frontend 1
Docente: Xenia Padilla
Actividad: LABORATORIO APIS - EVALUACIÓN
Nombre del estudiante: Ricardo Haro Calvo
Matrícula: C17760295
Grupo: 8SE
Fecha de entrega: 12/11/2025

Instrucciones de instalación.

Para este proyecto se requiere NODE y ExpressJS.

con node corremos el comando.

npm i

para correr el servidor utilizamos uno de los siguientes comandos

(para modo desarrollo, con errores más especificos)
npm run dev

(para modo producción)
npm run start


Documentación de la API

POST /pacientes

Body:
{
	"nombre": "Andy Anderson",
	"edad": 25,
	"telefono": "555-0122",
	"email": "test@me.com"
}

Respuesta Exitosa (201):
{
    "success": true,
    "message": "Paciente creado exitosamente",
    "data": {
        "id": "P003",
        "nombre": "Andy Anderson",
        "edad": 25,
        "telefono": "555-0122",
        "email": "test@me.com"
        "fechaRegistro": "2024-01-20"
    }
}

Errores 400:
    No se enviaron los campos requeridos
    Email duplicado
    Teléfono inválido (formato)
    Edad invalida (edad < 1 o edad > 120)
    Formato de email inválido

GET /pacientes

Respuesta Exitosa (200):
{
    "success": true,
    "data": [
    {
        "id": "P001",
      	"nombre": "Andy Anderson",
        "edad": 25,
        "telefono": "555-0122",
        "email": "test@me.com"
        "fechaRegistro": "2025-01-15"
    }
  ]
}

Obtener Paciente por ID

GET /pacientes/:id

Respuesta Exitosa (200):
json

{
    "success": true,
    "data": {
        "id": "P001",
      	"nombre": "Andy Anderson",
        "edad": 25,
        "telefono": "555-0122",
        "email": "test@me.com"
        "fechaRegistro": "2025-01-15"
    }
}

Error (404):
json

{
    "success": false,
    "message": "Paciente no encontrado"
}

Actualizar Paciente

PUT /pacientes/:id

Body: (misma estructura que crear paciente)

Respuesta Exitosa (200):
json

{
    "success": true,
    "message": "Paciente actualizado correctamente",
    "data": {
        "id": "P001",
      	"nombre": "Andy Anderson Actual",
        "edad": 25,
        "telefono": "555-0122",
        "email": "test@put.com"
        "fechaRegistro": "2025-01-15"
    }
}

Historial de Citas del Paciente

GET /pacientes/:id/historial

Respuesta Exitosa (200):
json

{
    "success": true,
    "message": "Historial de citas de María González",
    "data": {
        "paciente": {
        "id": "P001",
      	"nombre": "Andy Anderson Actual",
        "email": "test@put.com"
        },
        "historial": [
        {
            "id": "C001",
            "pacienteId": "P001",
            "doctorId": "D001",
            "fecha": "2025-11-10",
            "hora": "10:00",
            "motivo": "Revisión general",
            "estado": "programada",
            "doctorNombre": "Dr. Carlos Méndez",
            "doctorEspecialidad": "Cardiología"
        }
        ],
        "totalCitas": 1
    }
}

DOCTORES

Crear Doctor

POST /doctores

Body:
json

{
    "nombre": "Dra. Ana López",
    "especialidad": "Pediatría",
    "horarioInicio": "08:00",
    "horarioFin": "16:00",
    "diasDisponibles": ["Lunes", "Miércoles", "Viernes"]
}

Respuesta Exitosa (201):
json

{
    "success": true,
    "message": "Doctor creado exitosamente",
    "data": {
        "id": "D002",
        "nombre": "Dra. Ana López",
        "especialidad": "Pediatría",
        "horarioInicio": "08:00",
        "horarioFin": "16:00",
        "diasDisponibles": ["Lunes", "Miércoles", "Viernes"]
    }
}

Errores (400):
    Doctor duplicado (mismo nombre y especialidad)
    Horarios inválidos
    Días disponibles vacíos o inválidos

Obtener Todos los Doctores

GET /doctores

Respuesta Exitosa (200):
json

{
    "success": true,
    "data": [
        {
        "id": "D001",
        "nombre": "Dr. Carlos Méndez",
        "especialidad": "Cardiología",
        "horarioInicio": "09:00",
        "horarioFin": "17:00",
        "diasDisponibles": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
        }
    ]
}

Obtener Doctor por ID

GET /doctores/:id

Respuesta Exitosa (200):
json

{
    "success": true,
    "data": {
        "id": "D001",
        "nombre": "Dr. Carlos Méndez",
        "especialidad": "Cardiología",
        "horarioInicio": "09:00",
        "horarioFin": "17:00",
        "diasDisponibles": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    }
}

Buscar Doctores por Especialidad

GET /doctores/especialidad/:especialidad

Respuesta Exitosa (200):
json

{
    "success": true,
    "message": "Doctores encontrados en Cardiología",
    "data": {
        "especialidadBuscada": "Cardiología",
        "doctores": [
        {
            "id": "D001",
            "nombre": "Dr. Carlos Méndez",
            "especialidad": "Cardiología",
            "horarioInicio": "09:00",
            "horarioFin": "17:00",
            "diasDisponibles": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
        }
        ],
        "totalDoctores": 1,
        "especialidadesUnicas": ["Cardiología"]
    }
}

CITAS

Crear Cita

POST /citas

Body:
json

{
    "pacienteId": "P001",
    "doctorId": "D001",
    "fecha": "2025-11-15",
    "hora": "14:00",
    "motivo": "Control rutinario"
}

Respuesta Exitosa (201):
json

{
    "success": true,
    "message": "Cita creada exitosamente",
    "data": {
        "id": "C002",
        "pacienteId": "P001",
        "doctorId": "D001",
        "fecha": "2025-11-15",
        "hora": "14:00",
        "motivo": "Control rutinario",
        "estado": "programada"
    }
}

Errores (400):
    Paciente no existe
    Doctor no existe
    Fecha pasada
    Doctor no disponible ese día
    Hora fuera del horario del doctor
    Cita duplicada para mismo doctor/fecha/hora

Obtener Todas las Citas

GET /citas

Respuesta Exitosa (200):
json

{
    "success": true,
    "data": [
        {
        "id": "C001",
        "pacienteId": "P001",
        "doctorId": "D001",
        "fecha": "2025-11-10",
        "hora": "10:00",
        "motivo": "Revisión general",
        "estado": "programada"
        }
    ]
}

Obtener Cita por ID

GET /citas/:id

Respuesta Exitosa (200):
json

{
    "success": true,
    "data": {
        "id": "C001",
        "pacienteId": "P001",
        "doctorId": "D001",
        "fecha": "2025-11-10",
        "hora": "10:00",
        "motivo": "Revisión general",
        "estado": "programada"
    }
}

Cancelar Cita

PUT /citas/:id/cancelar

Respuesta Exitosa (200):
json

{
    "success": true,
    "message": "Cita cancelada exitosamente",
    "data": {
        "id": "C001",
        "pacienteId": "P001",
        "doctorId": "D001",
        "fecha": "2025-11-10",
        "hora": "10:00",
        "motivo": "Revisión general",
        "estado": "cancelada",
        "fechaCancelacion": "2024-01-20"
    }
}

Errores (400):
    Cita ya cancelada
    Cita ya completada

Agenda del Doctor

GET /citas/doctor/:doctorId

Respuesta Exitosa (200):
json

{
    "success": true,
    "message": "Agenda del Dr. Carlos Méndez",
    "data": {
        "doctor": {
        "id": "D001",
        "nombre": "Dr. Carlos Méndez",
        "especialidad": "Cardiología",
        "horario": "09:00 - 17:00",
        "diasDisponibles": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
        },
        "citas": [
        {
            "id": "C001",
            "pacienteId": "P001",
            "doctorId": "D001",
            "fecha": "2025-11-10",
            "hora": "10:00",
            "motivo": "Revisión general",
            "estado": "programada",
            "pacienteNombre": "María González",
            "pacienteEdad": 35,
            "pacienteTelefono": "555-0101",
            "pacienteEmail": "maria.g@email.com"
        }
        ],
        "estadisticas": {
        "programadas": 1,
        "completadas": 0,
        "canceladas": 0,
        "total": 1
        }
    }
}

GLOSARIO

Referencia de respuestas HTTP

    200: OK - Operación exitosa
    201: Created - Recurso creado exitosamente
    400: Bad Request - Error en los datos enviados
    404: Not Found - Recurso no encontrado
    500: Internal Server Error - Error del servidor

Formatos de Datos

    Fecha: YYYY-MM-DD (ej: 2025-11-15)
    Hora: HH:MM formato 24h (ej: 14:30)
    ID's: Formato específico (P001, D001, C001)
    Estados de cita: programada, completada, cancelada
