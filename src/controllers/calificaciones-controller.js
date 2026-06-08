import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import CalificacionesService from './../services/calificaciones-service.js';

const router = Router();
const currentService = new CalificacionesService();

router.get('', async (req, res) => {
try {
    const returnArray = await currentService.getAllAsync();

    res.status(StatusCodes.OK)
       .json(returnArray);

} catch (error) {

    console.log(error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
       .send(`Error: ${error.message}`);
}

});

router.get('/alumno/:idAlumno', async (req, res) => {

try {

    const returnArray =  await currentService.getByAlumnoAsync(req.params.idAlumno);
    res.status(StatusCodes.OK).json(returnArray);
} catch (error) {
    console.log(error);
    res.status(StatusCodes.NOT_FOUND).send(`Error: ${error.message}`);
}
});

router.get('/:id', async (req, res) => {
try {
    const entity = await currentService.getByIdAsync(req.params.id);
    if (entity != null) {
        res.status(StatusCodes.OK).json(entity);
    } else {
        res.status(StatusCodes.NOT_FOUND).send(`No se encontró la calificación (id:${req.params.id}).`);
    }

} catch (error) {

    console.log(error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
}

});

router.post('', async (req, res) => {

try {

    const nueva =  await currentService.createAsync(req.body);

    res.status(StatusCodes.CREATED).json(nueva);

} catch (error) {

    console.log(error);

    if (
        error.message.startsWith(
            'Ya existe una calificación'
        )
    ) {

        return res.status(StatusCodes.CONFLICT).json({error: error.message});
    }

    res.status(StatusCodes.BAD_REQUEST).json({error: error.message});
}

});

router.put('/:id', async (req, res) => {

try {

    let entity = req.body;
    entity.id = parseInt(req.params.id);

    const rowsAffected =  await currentService.updateAsync(entity);

    res.status(StatusCodes.OK).json(rowsAffected);

} catch (error) {

    console.log(error);

    if (
        error.message.startsWith(
            'No se encontró la calificación'
        )
    ) {

        return res.status(StatusCodes.NOT_FOUND ).send(error.message);
    }

    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
}

});

router.delete('/:id', async (req, res) => {

try {

    const rowCount =  await currentService.deleteByIdAsync(req.params.id);

    if (rowCount != 0) {

        res.status(StatusCodes.OK)
           .json(null);

    } else {

        res.status(StatusCodes.NOT_FOUND)
           .send(
               `No se encontró la calificación (id:${req.params.id}).`
           );
    }

} catch (error) {

    console.log(error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
       .send(`Error: ${error.message}`);
}

});

export default router;
