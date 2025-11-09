const fs = require('fs');
const path = require('path');

// PATHS DE BASES DE DATOS
const DB_PATHS = {
    citas: path.join(__dirname, 'database/citas.json'),
    doctores: path.join(__dirname, 'database/doctores.json'),
    pacientes: path.join(__dirname, 'database/pacientes.json')
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
        // Retornar array vacío por defecto para todos los tipos
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
    const db = leerDB("pacientes");

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
        edad, 
        telefono, 
        email,
        fechaRegistro: new Date().toISOString().split('T')[0]
    };
    db.push(nuevoPaciente);

    escribirDB("pacientes", db);
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
    obtenerDoctores,
    obtenerDoctorPorId,
    crearDoctor,
};
