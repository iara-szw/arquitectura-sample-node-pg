export default class Calificacion {
    id;
    id_alumno;
    id_materia;
    nota;
    fecha;

    constructor(id, id_alumno, id_materia, nota, fecha) {
        this.id = id;
        this.id_alumno = id_alumno;
        this.id_materia = id_materia;
        this.nota = nota;
        this.fecha = fecha;
    }
}