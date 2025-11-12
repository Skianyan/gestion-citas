const express = require('express');
const {
    obtenerPacientes,
    obtenerPacientePorId,
    crearPaciente,
    actualizarPaciente,
    obtenerHistorialdePaciente,
    obtenerCitas,
    obtenerCitaPorId,
    crearCita,
    cancelarCita,
    obtenerCitasPorDoctor,
    obtenerDoctores,
    obtenerDoctorPorId,
    crearDoctor,
    obtenerDoctoresPorEspecialidad,
} = require('./dbHelper');

const app = express();

// Definir el puerto
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para parsear datos de formul
app.use(express.urlencoded({ extended: true }))


// Ruta principal
app.get('/', (req,res) => {
    res.send('Servidor Express funcionando correctamente!');
});

// METODOS PACIENTES

app.post('/api/pacientes', (req, res) => {
    const {nombre, edad, telefono, email} = req.body;

    if (!nombre || !edad || !telefono || !email){
        return res.status(400).json({
            success: false,
            message: 'Es necesario llenar todos los campos.'
        })
    }
    
    // validaciones
    if (isNaN(edad)) {
        return res.status(400).json({
            success: false,
            message: 'La edad debe ser un numero.'
        })
    }

    // verificar si telefono es incluido
    if (!telefono || telefono.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El teléfono es obligatorio.'
        });
    }

    //verificar si el telefono es 8 caracteres o mayor
    if (telefono.trim().length < 8) {
        return res.status(400).json({
            success: false,
            message: 'El teléfono debe tener al menos 8 caracteres.'
        });
    }
    // edad mayor a 0
    if (parseInt(edad) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'La edad debe ser mayor a 0.'
        });
    }
    // edad menor a 120 (valor arbitrario)
    if (parseInt(edad) > 120) {
        return res.status(400).json({
            success: false,
            message: 'La edad no puede ser mayor a 120 años.'
        });
    }

    // regex de formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'El formato del email no es válido.'
        });
    }

    const nuevo = crearPaciente(nombre, edad, telefono, email);

    res.status(201).json({
        success: true,
        message: "usuario creado exitosamente",
        data: nuevo
    });
})

app.get('/api/pacientes', (req, res) => {
    const pacientes = obtenerPacientes();
    res.json({
        success: true,
        data: pacientes
    })
})

app.get('/api/pacientes/:id', (req, res) => {
    const paciente = obtenerPacientePorId(req.params.id);
    if (!paciente) return res.status(404).json(); // 
    res.json({ success: true, data: paciente });
});

app.put('/api/pacientes/:id', (req, res) => {
    const id = req.params.id;    
    const {nombre, edad, telefono, email} = req.body;
    
    const actualizado = actualizarPaciente(
        id, nombre, edad, telefono, email
    );

    if (!actualizado){
        return res.status(404).json({
            success: false,
            message: 'Paciente no encontrado'
        })
    }
    res.status(200).json({
        success: true,
        message: 'Paciente actualizado correctamente',
        data: actualizado
    });
})

app.get('/api/pacientes/:id/historial', (req, res) => {
      try {
        const pacienteId = req.params.id;
        
        // verificar paciente
        const paciente = obtenerPacientePorId(pacienteId);
        if (!paciente) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }

        // obtener historial
        const historial = obtenerHistorialdePaciente(pacienteId);
        
        res.json({
            success: true,
            message: `Historial de citas de ${paciente.nombre}`,
            data: {
                paciente: {
                    id: paciente.id,
                    nombre: paciente.nombre,
                    email: paciente.email
                },
                historial: historial,
                totalCitas: historial.length
            }
        });
    } catch (error) {
        console.error('Error en endpoint /historial:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de citas',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
})

// METODOS CITAS

app.post('/api/citas', (req, res) => {
    try {
        const {pacienteId, doctorId, fecha, hora, motivo} = req.body;

        // Validaciones básicas de campos obligatorios
        if (!pacienteId || !doctorId || !fecha || !hora || !motivo){
            return res.status(400).json({
                success: false,
                message: 'Es necesario llenar todos los campos: pacienteId, doctorId, fecha, hora y motivo.'
            });
        }

        // Validar formato de fecha (YYYY-MM-DD)
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fecha)) {
            return res.status(400).json({
                success: false,
                message: 'El formato de fecha debe ser YYYY-MM-DD'
            });
        }

        // Validar formato de hora (HH:MM)
        const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!horaRegex.test(hora)) {
            return res.status(400).json({
                success: false,
                message: 'El formato de hora debe ser HH:MM (24 horas)'
            });
        }

        // Validar que la fecha sea futura
        const fechaCita = new Date(fecha);
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0);

        if (fechaCita < fechaActual) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de la cita debe ser futura'
            });
        }

        const nueva = crearCita(pacienteId, doctorId, fecha, hora, motivo);

        res.status(201).json({
            success: true,
            message: "Cita creada exitosamente",
            data: nueva
        });
    } catch (error) {
        console.error('Error al crear cita:', error);
        
        // Manejar errores específicos de validación
        if (error.message.includes('paciente no existe') ||
            error.message.includes('doctor no existe') ||
            error.message.includes('fecha debe ser futura') ||
            error.message.includes('no trabaja los') ||
            error.message.includes('hora debe estar dentro') ||
            error.message.includes('ya existe una cita')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear cita',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

app.get('/api/citas', (req, res) => {
    const citas = obtenerCitas();
    res.json({ success: true, data: citas });
});

app.get('/api/citas/:id', (req, res) => {
    const cita = obtenerCitaPorId(req.params.id);
    if (!cita) return res.status(404).json(); // 
    res.json({ success: true, data: cita });
});

app.put('/api/citas/:id/cancelar', (req, res) => {
    try {
        const citaId = req.params.id;

        if (!citaId) {
            return res.status(400).json({
                success: false,
                message: 'se requiere el ID de la cita a cancelar'
            });
        }

        const citaCancelada = cancelarCita(citaId);

        if (!citaCancelada) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Cita cancelada con exito',
            data: citaCancelada
        });
    } catch (error) {
        console.error('Error en endpoint /citas/:id/cancelar:', error)

        res.status(500).json({
            success: false,
            message: 'Error al cancelar la cita',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

app.get('/api/citas/doctor/:doctorId', (req, res) => {
    try {
        const doctorId = req.params.doctorId;

        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'ID de doctor no proporcionado'
            });
        }

        const agendaDoctor = obtenerCitasPorDoctor(doctorId);
        
        res.json({
            success: true,
            message: `Agenda de ${agendaDoctor.doctor.nombre}`,
            data: agendaDoctor
        });
    } catch (error) {
        console.error('Error en endpoint /citas/doctor/:doctorId:', error);
        
        // Manejar error específico de doctor no encontrado
        if (error.message.includes('Doctor no encontrado')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al obtener la agenda del doctor',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});


// METODOS DOCTORES

app.post('/api/doctores', (req, res) => {
    try {
        const {nombre, especialidad, horarioInicio, horarioFin, diasDisponibles} = req.body;
            // Validaciones generales
        // Campos obligatorios
        if (!nombre || !especialidad || !horarioInicio || !horarioFin || !diasDisponibles){
            return res.status(400).json({
                success: false,
                message: 'Es necesario llenar todos los campos: nombre, especialidad, horarioInicio, horarioFin y diasDisponibles.'
            });
        }
        
            // Validaciones de Dias
        // Validar que diasDisponibles sea un array
        if (!Array.isArray(diasDisponibles)) {
            return res.status(400).json({
                success: false,
                message: 'Los días disponibles deben ser un array.'
            });
        }

        // Validar que el array de días no esté vacío
        if (diasDisponibles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Los días disponibles no pueden estar vacíos.'
            });
        }

        const diasValidos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diasInvalidos = diasDisponibles.filter(dia => !diasValidos.includes(dia));
        
        if (diasInvalidos.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Días no válidos: ${diasInvalidos.join(', ')}. Los días válidos son: ${diasValidos.join(', ')}.`
            });
        }

            // Validaciones de horario
        // Validar formato de horarios
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(horarioInicio) || !timeRegex.test(horarioFin)) {
            return res.status(400).json({
                success: false,
                message: 'Los horarios deben tener formato HH:MM (24 horas).'
            });
        }

        // Validar que horarioInicio sea menor que horarioFin
        const [inicioHoras, inicioMinutos] = horarioInicio.split(':').map(Number);
        const [finHoras, finMinutos] = horarioFin.split(':').map(Number);
        const inicioTotalMinutos = inicioHoras * 60 + inicioMinutos;
        const finTotalMinutos = finHoras * 60 + finMinutos;

        if (inicioTotalMinutos >= finTotalMinutos) {
            return res.status(400).json({
                success: false,
                message: 'El horario de inicio debe ser anterior al horario de fin.'
            });
        }

        const nuevo = crearDoctor(nombre, especialidad, horarioInicio, horarioFin, diasDisponibles);

        res.status(201).json({
            success: true,
            message: "Doctor creado exitosamente",
            data: nuevo
        });
    } catch (error) {
        console.error('Error al crear doctor:', error);
        
        // Manejar errores específicos de validación
        if (error.message.includes('Ya existe un doctor') ||
            error.message.includes('horarios no son válidos') ||
            error.message.includes('días disponibles no pueden estar vacíos')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear doctor',
            error: process.env.NODE_ENV === 'development' ? error.message : {} // solo mostrar en dev
        });
    }
});

app.get('/api/doctores', (req, res) => {
    const doctores = obtenerDoctores();
    res.json({ success: true, data: doctores });
});

app.get('/api/doctores/:id', (req, res) => {
    const doctor = obtenerDoctorPorId(req.params.id);
    if (!doctor) return res.status(404).json(); // 
    res.json({ success: true, data: doctor });
});

app.get('/api/doctores/:id', (req, res) => {
    const doctor = obtenerDoctorPorId(req.params.id);
    if (!doctor) return res.status(404).json(); // 
    res.json({ success: true, data: doctor });
});

app.get('/api/doctores/especialidad/:especialidad', (req, res) => {
    try {
        const especialidad = req.params.especialidad;
        
        if (!especialidad || especialidad.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Se requiere especificar la especialidad'
            });
        }

        const doctores = obtenerDoctoresPorEspecialidad(especialidad);
        
        res.json({
            success: true,
            message: `Doctores encontrados en ${especialidad}`,
            data: {
                especialidadBuscada: especialidad,
                doctores: doctores,
                totalDoctores: doctores.length
            }
        });
    } catch (error) {
        console.error('Error en endpoint /doctores/especialidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar doctores por especialidad',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});


// METODOS FINALES

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV == 'development' ? err.message : {}
    });
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
})