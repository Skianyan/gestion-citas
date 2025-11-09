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
    obtenerDoctores,
    obtenerDoctorPorId,
    crearDoctor,
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
    const {pacienteId, doctorId, fecha, hora, motivo} = req.body;
    const nueva = crearCita(pacienteId, doctorId, fecha, hora, motivo);
    res.status(201).json({ 
        success: true, 
        message: "cita creada exitosamente" , 
        data: nueva 
    });
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


// METODOS DOCTORES

app.post('/api/doctores', (req, res) => {
    const {nombre, especialidad, horarioInicio, horarioFin, diasDisponibles} = req.body;
    const nuevo = crearDoctor(nombre, especialidad, horarioInicio, horarioFin, diasDisponibles);
    res.status(201).json({ success: true, data: nuevo });
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