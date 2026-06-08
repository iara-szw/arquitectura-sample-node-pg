import CalificacionesRepository from '../repositories/calificaciones-repository.js';
import AlumnosService from './alumnos-service.js';
import MateriasService from './materias-service.js';

export default class CalificacionesService {
constructor() {
    this.CalificacionesRepository = new CalificacionesRepository();
    this.AlumnosService = new AlumnosService();
    this.MateriasService =  new MateriasService();
}
validarNota = async (nota) => {

    if (
        !Number.isInteger(nota) ||
        nota < 0 ||
        nota > 10
    ) {
        throw new Error(
            'La nota debe ser un número entero entre 0 y 10.'
        );
    }
}

validarAlumnoExiste = async (idAlumno) => {

    const alumno =
        await this.AlumnosService.getByIdAsync(idAlumno);

    if (alumno == null) {
        throw new Error(
            `El alumno con id ${idAlumno} no existe.`
        );
    }
}

validarMateriaExiste = async (idMateria) => {

    const materia =
        await this.MateriasService
            .getByIdAsync(idMateria);

    if (materia == null) {
        throw new Error(
            `La materia con id ${idMateria} no existe.`
        );
    }
}

validarNoDuplicada = async (
    idAlumno,
    idMateria
) => {

    const existente =
        await this.CalificacionesRepository
            .getByAlumnoMateriaAsync(
                idAlumno,
                idMateria
            );

    if (existente != null) {
        throw new Error(
            `Ya existe una calificación para el alumno ${idAlumno} en la materia ${idMateria}.`
        );
    }
}
getAllAsync = async () => {
    return await this.CalificacionesRepository.getAllAsync();
}

getByIdAsync = async (id) => {
    return await this.CalificacionesRepository.getByIdAsync(id);
}

getByAlumnoAsync = async (idAlumno) => {

   if(await this.validarAlumnoExiste(idAlumno)) {
    throw new Error(`El alumno con id ${idAlumno} no existe.`); 
   }
    const alumno = await this.AlumnosService.getByIdAsync(idAlumno);
    return await this.CalificacionesRepository.getByAlumnoAsync(idAlumno);
}

createAsync = async (entity) => {

    await this.validarNota(entity.nota);

    await this.validarAlumnoExiste(
        entity.id_alumno
    );

    await this.validarMateriaExiste(
        entity.id_materia
    );

    await this.validarNoDuplicada(
        entity.id_alumno,
        entity.id_materia
    );

    return await this.CalificacionesRepository
        .createAsync(entity);
}

updateAsync = async (entity) => {

    const actual =
        await this.getByIdAsync(entity.id);

    if (actual == null) {
        throw new Error(
            `No se encontró la calificación (id: ${entity.id}).`
        );
    }

    if (entity.nota !== undefined) {
        await this.validarNota(entity.nota);
    }

    return await this.CalificacionesRepository
        .updateAsync(entity);
}

deleteByIdAsync = async (id) => {
    return await this.CalificacionesRepository
        .deleteByIdAsync(id);
}



}
