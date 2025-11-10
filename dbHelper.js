const fs = require('fs');
const path = require('path');

// PATHS DE BASES DE DATOS
const DB_PATHS = {
    citas: path.join(__dirname, 'database/citas.json'),
    doctores: path.join(__dirname, 'database/doctores.json'),
    pacientes: path.join(__dirname, 'database/pacientes.json')
};

// FUNCIONES DE VALIDACION

const validarEmailUnico = (email) => {
try {
    const db = leerDB('pacientes');
    const pacienteExistente = db.find(paciente => 
        paciente.email.toLowerCase() === email.toLowerCase()
    );
    return !pacienteExistente; // Retorna true si el email es único
} catch (error) {
    console.error('Error al validar email único:', error);
    throw new Error('Error al validar el email');
}
};

const validarEdad = (edad) => {
    return edad > 0 && edad <= 120; // Edad entre 1 y 120 años
};

const validarFormatoEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validarTelefono = (telefono) => {
    // Validar que el teléfono tenga al menos 8 caracteres
    return telefono && telefono.trim().length >= 8;
};


// METODOS GENERICOS LECTURA Y ESCRITURA
const leerDB = (tipo) => {
    try {
        const filePath = DB_PATHS[tipo];
        if (!filePath) {
            throw new Error(`Tipo de base de datos no válido: ${tipo}`);
        }
        
        const data = fs.readFileSync(filePath, 'utf-8');    
        return JSON.parse(data);
    } catch (error) {
        console.log(`Error al leer la base de datos ${tipo}:`, error);
        // Retornar array vacío por default
        return [];
    }
};

const escribirDB = (tipo, data) => {
    try {
        const filePath = DB_PATHS[tipo];
        if (!filePath) {
            throw new Error(`Tipo de base de datos no válido: ${tipo}`);
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error(`Error al escribir en la base de datos ${tipo}:`, error);
        return false;
    }
};


// METODOS DE PACIENTES

const obtenerPacientes = () => {
    const db = leerDB("pacientes");
    return db;
}

const obtenerPacientePorId = (id) => {
    const db = leerDB("pacientes");
    return db.find(u => u.id === id);
}

const crearPaciente = (nombre, edad, telefono, email) => {
    // Validaciones antes de crear el paciente
    if (!validarTelefono(telefono)) {
        throw new Error('El teléfono es obligatorio y de al menos 8 caracteres');
    }

    if (!validarEdad(edad)) {
        throw new Error('La edad debe ser mayor a 0 y menor o igual a 120 años');
    }

    if (!validarFormatoEmail(email)) {
        throw new Error('El formato del email no es válido');
    }

    if (!validarEmailUnico(email)) {
        throw new Error('El email ya está registrado en el sistema');
    }

    const db = leerDB('pacientes');

    let nuevoId;
    if (db.length === 0) {
        nuevoId = "P001";
    } else {
        const lastId = db[db.length - 1].id;
        const lastNumber = parseInt(lastId.substring(1));
        nuevoId = "P" + String(lastNumber + 1).padStart(3, '0');
    }

    const nuevoPaciente = { 
        id: nuevoId, 
        nombre, 
        edad: parseInt(edad), // Asegurar que sea número
        telefono: telefono.trim(), // Limpiar espacios
        email: email.toLowerCase().trim(), // Normalizar email
        fechaRegistro: new Date().toISOString().split('T')[0]
    };
    
    db.push(nuevoPaciente);
    
    if (!escribirDB('pacientes', db)) {
        throw new Error('Error al guardar el paciente en la base de datos');
    }
    
    return nuevoPaciente;
};


const actualizarPaciente = (id, nombre, edad, telefono, email) => {
    const db = leerDB("pacientes");
    const index = db.findIndex(u => u.id === id);
    
    if (index === -1) {
        return null;
    }
    
    db[index] = {
        ...db[index],
        nombre,
        edad,
        telefono,
        email
    };
    
    if (!escribirDB("pacientes",db)) {
        throw new Error('Error al actualizar el paciente');
    }
    
    return db[index];
};

const obtenerHistorialdePaciente = (pacienteId) => {
    try{
        const citas = leerDB("citas");
        const doctores = leerDB("doctores");

        const historial = citas
        .filter(cita => cita.pacienteId === pacienteId)
        .map(cita => {
            const doctor = doctores.find(d => d.id === cita.doctorId);
            return {
                ...cita,
                doctorNombre: doctor ? doctor.nombre : 'Doc no encontrado',
                doctorEspecialidad: doctor ? doctor.especialidad : 'Especialidad no encontrada',
            }
        })
        return historial;
    } catch {
        console.error('error al obtener el historial de citas:', error);
        throw new error('Error al obtener el historial de citas del paciente')
    }
}

// Métodos específicos para DOCTORES
const obtenerDoctores = () => {
    return leerDB('doctores');
}

const obtenerDoctorPorId = (id) => {
    const db = leerDB('doctores');
    return db.find(u => u.id === id);
}

const crearDoctor = (nombre, especialidad, horarioInicio, horarioFin, diasDisponibles) => {
    const db = leerDB('doctores');

    let nuevoId;
    if (db.length === 0) {
        nuevoId = "D001";
    } else {
        const lastId = db[db.length - 1].id;
        const lastNumber = parseInt(lastId.substring(1));
        nuevoId = "D" + String(lastNumber + 1).padStart(3, '0');
    }

    const nuevoDoctor = { 
        id: nuevoId, 
        nombre, 
        especialidad, 
        horarioInicio, 
        horarioFin, 
        diasDisponibles 
    };
    
    db.push(nuevoDoctor);
    escribirDB('doctores', db);
    return nuevoDoctor;
};

const obtenerDoctoresPorEspecialidad = (especialidad) => {
    try {
        const doctores = leerDB('doctores');
        
        const doctoresFiltrados = doctores.filter(doctor => 
            doctor.especialidad.toLowerCase().includes(especialidad.toLowerCase())
        );
        
        return doctoresFiltrados;
    } catch (error) {
        console.error('Error al obtener doctores por especialidad:', error);
        throw new Error('Error al obtener doctores por especialidad');
    }
};

// Métodos específicos para CITAS
const obtenerCitas = () => {
    return leerDB('citas');
}

const obtenerCitaPorId = (id) => {
    const db = leerDB('citas');
    return db.find(u => u.id === id);
}

const crearCita = (pacienteId, doctorId, fecha, hora, motivo, estado = 'programada') => {
    const db = leerDB('citas');

    let nuevoId;
    if (db.length === 0) {
        nuevoId = "C001";
    } else {
        const lastId = db[db.length - 1].id;
        const lastNumber = parseInt(lastId.substring(1));
        nuevoId = "C" + String(lastNumber + 1).padStart(3, '0');
    }

    const nuevaCita = { 
        id: nuevoId, 
        pacienteId, 
        doctorId, 
        fecha, 
        hora, 
        motivo, 
        estado 
    };
    
    db.push(nuevaCita);
    escribirDB('citas', db);
    return nuevaCita;
};

const cancelarCita = (id) => {
    try {
        const db = leerDB('citas');
        const index = db.findIndex(cita => cita.id === id);
        
        if (index === -1) {
            return null;
        }

        if (db[index].estado === 'cancelada') {
            throw new Error('La cita ya está cancelada');
        }

        // actualizar estado a "cancelada"
        db[index] = {
            ...db[index],
            estado: 'cancelada',
            fechaCancelacion: new Date().toISOString().split('T')[0] // fecha de cancelación
        };
        
        if (!escribirDB('citas', db)) {
            throw new Error('Error al guardar los cambios de la cita');
        }
        
        return db[index];
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        throw new Error(error.message || 'Error al cancelar la cita');
    }
};

const obtenerCitasPorDoctor = (doctorId) => {
    try {
        const citas = leerDB('citas');
        const pacientes = leerDB('pacientes');
        const doctores = leerDB('doctores');
        
        // Verificar que el doctor existe
        const doctor = doctores.find(d => d.id === doctorId);
        if (!doctor) {
            throw new Error('Doctor no encontrado');
        }

        // Filtrar citas del doctor, adjuntar info de paciente
        const citasDoctor = citas
            .filter(cita => cita.doctorId === doctorId)
            .map(cita => {
                const paciente = pacientes.find(p => p.id === cita.pacienteId);
                return {
                    ...cita,
                    pacienteNombre: paciente ? paciente.nombre : 'Paciente no encontrado',
                    pacienteEdad: paciente ? paciente.edad : 'No disponible',
                    pacienteTelefono: paciente ? paciente.telefono : 'No disponible',
                    pacienteEmail: paciente ? paciente.email : 'No disponible'
                };
            })

        return {
            doctor: {
                id: doctor.id,
                nombre: doctor.nombre,
                especialidad: doctor.especialidad,
                horario: `${doctor.horarioInicio} - ${doctor.horarioFin}`,
                diasDisponibles: doctor.diasDisponibles
            },
            citas: citasDoctor,
        };
    } catch (error) {
        console.error('Error al obtener citas por doctor:', error);
        throw new Error(error.message || 'Error al obtener las citas del doctor');
    }
};

// EXPORTACION DE METODOS

module.exports = {
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
};
