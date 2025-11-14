const fs = require('fs');
const path = require('path');

// PATHS DE BASES DE DATOS
const DB_PATHS = {
    citas: path.join(__dirname, 'database/citas.json'),
    doctores: path.join(__dirname, 'database/doctores.json'),
    pacientes: path.join(__dirname, 'database/pacientes.json')
};

// FUNCIONES DE VALIDACION (paciente)

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

// FUNCIONES DE VALIDACION (doctores)

const validarDoctorUnico = (nombre, especialidad) => {
    try {
        const db = leerDB('doctores');
        const doctorExistente = db.find(doctor => 
            doctor.nombre.toLowerCase() === nombre.toLowerCase() &&
            doctor.especialidad.toLowerCase() === especialidad.toLowerCase()
        );
        return !doctorExistente; // Retorna true si el doctor es único
    } catch (error) {
        console.error('Error al validar doctor único:', error);
        throw new Error('Error al validar el doctor');
    }
};

const validarHorarios = (horarioInicio, horarioFin) => {
    // Validar formato HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(horarioInicio) || !timeRegex.test(horarioFin)) {
        return false;
    }
    
    // Convertir a minutos para comparar
    const [inicioHoras, inicioMinutos] = horarioInicio.split(':').map(Number);
    const [finHoras, finMinutos] = horarioFin.split(':').map(Number);
    
    const inicioTotalMinutos = inicioHoras * 60 + inicioMinutos;
    const finTotalMinutos = finHoras * 60 + finMinutos;
    
    return inicioTotalMinutos < finTotalMinutos;
};

const validarDiasDisponibles = (diasDisponibles) => {
    if (!Array.isArray(diasDisponibles) || diasDisponibles.length === 0) {
        return false;
    }
    
    // Validar que todos los días sean válidos
    const diasValidos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return diasDisponibles.every(dia => diasValidos.includes(dia));
};

// VALIDACION CITAS

const validarPacienteExiste = (pacienteId) => {
    try {
        const db = leerDB('pacientes');
        const paciente = db.find(p => p.id === pacienteId);
        return !!paciente;
    } catch (error) {
        console.error('Error al validar paciente:', error);
        throw new Error('Error al validar el paciente');
    }
};

const validarDoctorExiste = (doctorId) => {
    try {
        const db = leerDB('doctores');
        const doctor = db.find(d => d.id === doctorId);
        return !!doctor;
    } catch (error) {
        console.error('Error al validar doctor:', error);
        throw new Error('Error al validar el doctor');
    }
};

const validarFechaFutura = (fecha) => {
    const fechaCita = new Date(fecha);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fecha
    
    return fechaCita >= fechaActual;
};

const validarDiaDisponibleDoctor = (doctorId, fecha) => {
    try {
        const db = leerDB('doctores');
        const doctor = db.find(d => d.id === doctorId);
        
        if (!doctor) {
            return false;
        }
        
        // Obtener día de la semana en español
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const fechaObj = new Date(fecha);
        const diaSemana = diasSemana[fechaObj.getDay()];
        
        return doctor.diasDisponibles.includes(diaSemana);
    } catch (error) {
        console.error('Error al validar día disponible:', error);
        throw new Error('Error al validar disponibilidad del doctor');
    }
};

const validarHorarioDoctor = (doctorId, hora) => {
    try {
        const db = leerDB('doctores');
        const doctor = db.find(d => d.id === doctorId);
        
        if (!doctor) {
            return false;
        }
        
        // Convertir horarios a minutos para comparar
        const [horaCitaHoras, horaCitaMinutos] = hora.split(':').map(Number);
        const [inicioHoras, inicioMinutos] = doctor.horarioInicio.split(':').map(Number);
        const [finHoras, finMinutos] = doctor.horarioFin.split(':').map(Number);
        
        const horaCitaMinutosTotal = horaCitaHoras * 60 + horaCitaMinutos;
        const inicioMinutosTotal = inicioHoras * 60 + inicioMinutos;
        const finMinutosTotal = finHoras * 60 + finMinutos;
        
        return horaCitaMinutosTotal >= inicioMinutosTotal && horaCitaMinutosTotal <= finMinutosTotal;
    } catch (error) {
        console.error('Error al validar horario doctor:', error);
        throw new Error('Error al validar horario del doctor');
    }
};

const validarCitaUnica = (doctorId, fecha, hora, citaIdExcluir = null) => {
    try {
        const db = leerDB('citas');
        
        // Buscar citas existentes para el mismo doctor, misma fecha y hora
        const citaExistente = db.find(cita => 
            cita.doctorId === doctorId &&
            cita.fecha === fecha &&
            cita.hora === hora &&
            cita.estado !== 'cancelada' && // No considerar citas canceladas
            cita.id !== citaIdExcluir // Excluir la cita actual en actualizaciones
        );
        
        return !citaExistente;
    } catch (error) {
        console.error('Error al validar cita única:', error);
        throw new Error('Error al validar disponibilidad de la cita');
    }
};

// para comparar con 
const obtenerDiaSemana = (fecha) => {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fechaObj = new Date(fecha);
    return diasSemana[fechaObj.getDay()];
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
    // Validaciones antes de crear el doctor
    if (!validarDoctorUnico(nombre, especialidad)) {
        throw new Error('Ya existe un doctor con el mismo nombre y especialidad');
    }

    if (!validarHorarios(horarioInicio, horarioFin)) {
        throw new Error('Los horarios no son válidos. El horario de inicio debe iniciar antes que el horario de fin y deben tener formato HH:MM');
    }

    if (!validarDiasDisponibles(diasDisponibles)) {
        throw new Error('Los días disponibles no pueden estar vacíos y deben ser días válidos');
    }

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
        nombre: nombre.trim(),
        especialidad: especialidad.trim(),
        horarioInicio: horarioInicio.trim(),
        horarioFin: horarioFin.trim(),
        diasDisponibles: diasDisponibles.map(dia => dia.trim())
    };
    
    db.push(nuevoDoctor);
    
    if (!escribirDB('doctores', db)) {
        throw new Error('Error al guardar el doctor en la base de datos');
    }
    
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
    // Validaciones antes de crear la cita
    if (!validarPacienteExiste(pacienteId)) {
        throw new Error('El paciente no existe en el sistema');
    }

    if (!validarDoctorExiste(doctorId)) {
        throw new Error('El doctor no existe en el sistema');
    }

    if (!validarFechaFutura(fecha)) {
        throw new Error('La fecha de la cita debe ser futura');
    }

    if (!validarDiaDisponibleDoctor(doctorId, fecha)) {
        const diaSemana = obtenerDiaSemana(fecha);
        throw new Error(`El doctor no trabaja los ${diaSemana}`);
    }

    if (!validarHorarioDoctor(doctorId, hora)) {
        const doctor = obtenerDoctorPorId(doctorId);
        throw new Error(`La hora debe estar dentro del horario del doctor (${doctor.horarioInicio} - ${doctor.horarioFin})`);
    }

    if (!validarCitaUnica(doctorId, fecha, hora)) {
        throw new Error('Ya existe una cita programada para este doctor en la misma fecha y hora');
    }

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
    
    if (!escribirDB('citas', db)) {
        throw new Error('Error al guardar la cita en la base de datos');
    }
    
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

        if (db[index].estado === 'completada') {
            throw new Error('No se puede cancelar una cita ya completada');
        }

        db[index] = {
            ...db[index],
            estado: 'cancelada',
            fechaCancelacion: new Date().toISOString().split('T')[0]
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

// METODOS STATS

const obtenerDocConMasCitas = () => {
    try{
        const citas = leerDB('citas');

        const numCitas = citas.reduce((accumulator, currentObject) => {
            const keyValue = currentObject.doctorId; // Specify the key to count by

            if (accumulator[keyValue]) {
                accumulator[keyValue]++;
            } else {
                accumulator[keyValue] = 1;
            }
            return accumulator;
        }, {});
        var bestDoc = Math.max.apply(null,Object.keys(numCitas).map(function(x){ return numCitas[x] }));
        return {
            docID: bestDoc
        }
    }catch{
        console.error('Error al obtener doc con mas citas:', error);
        throw new Error(error.message || 'Error al obtener las citas del doctor');
    }

}

const obtenerEspecialidadPopular = () => {
    try{
        const citas = leerDB('citas');

        const numCitas = citas.reduce((accumulator, currentObject) => {
            const keyValue = currentObject.doctorId; // Specify the key to count by

            if (accumulator[keyValue]) {
                accumulator[keyValue]++;
            } else {
                accumulator[keyValue] = 1;
            }
            return accumulator;
        }, {});
        var bestDoc = Math.max.apply(null,Object.keys(numCitas).map(function(x){ return numCitas[x] }));
        return {
            docID: bestDoc
        }
    }catch{
        console.error('Error al obtener doc con mas citas:', error);
        throw new Error(error.message || 'Error al obtener las citas del doctor');
    }

}

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
    obtenerDocConMasCitas,
    obtenerEspecialidadPopular,
};
