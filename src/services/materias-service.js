import MateriasRepository from '../repositories/materias-repository.js';

export default class MateriasService {
    constructor() {
        console.log('Estoy en: MateriaService.constructor()');
        this.MateriasRepository = new MateriasRepository();
    }

    getAllAsync = async () => {
        console.log(`MateriasService.getAllAsync()`);
        const returnArray = await this.MateriasRepository.getAllAsync();
        return returnArray;
    }

    getByIdAsync = async (id) => {
        console.log(`MateriasService.getByIdAsync(${id})`);
        const returnEntity = await this.MateriasRepository.getByIdAsync(id);
        return returnEntity;
    }

    createAsync = async (entity) => {
        console.log(`MateriasService.createAsync(${JSON.stringify(entity)})`);
        // Validación: nombre obligatorio (va ANTES de llamar al repository)
        if (!entity.nombre?.trim()) {
            throw new Error('El nombre de la materia es obligatorio.');
        }
        return await this.MateriasRepository.createAsync(entity);
    }

    updateAsync = async (entity) => {
        console.log(`MateriasService.updateAsync(${JSON.stringify(entity)})`);
        const rowsAffected = await this.MateriasRepository.updateAsync(entity);
           
        return rowsAffected;
    }
    
    deleteByIdAsync = async (id) => {
        console.log(`MateriasService.deleteByIdAsync(${id})`);
        const rowsAffected = await this.MateriasRepository.deleteByIdAsync(id);
        return rowsAffected;
    }

    /*
    getByIdAsync_PPT = async (id) => {
        console.log('Estoy en: CursosService.getByIdAsync_PPT()');
        const returnEntity = await this.CursosRepository.getByIdAsync_PPT(id);
        return returnEntity;
    }
    */
}

