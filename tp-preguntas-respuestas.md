### V1 — server-noob.js

**1.** En `server-noob.js`, cada endpoint crea un `new Client(config)`, hace `await client.connect()`, ejecuta la query, y en el `finally` hace `await client.end()`. Explicá con tus palabras qué problema de performance tiene este enfoque cuando la API recibe muchos requests simultáneos.

Crear una conexión a la base de datos requiere recursos y tiempo, y en una aplicación que tiene muchos requests simultaneos no solo se carga mucho la API sino que se puede llegar a alcanzar el limite y caerse la API.

**2.** ¿Qué pasa si PostgreSQL está apagado y un request llega a `server-noob.js`? El `client.connect()` falla, y después se ejecuta el `finally` con `await client.end()`. ¿Qué error puede ocurrir y por qué?

Como el cliente nunca llegó a conectarse correctamente con la base de datos, puede surgir un error como "Called end on a client that was never connected". Esto porque se intenta apagar una conexión que en realidad nunca fue creada correctamente.

**3.** En `server-noob.js`, si un compañero te dice "el endpoint de crear alumno tiene un bug", tenés que buscarlo en un archivo de ~215 líneas. ¿Por qué esto se vuelve un problema más grave a medida que la aplicación crece? Mencioná también qué pasa con Git cuando dos personas trabajan en el mismo archivo.

Cuando se tiene un mismo archivo con todos los endpoints, y la aplicación tiene cada vez mas de estos, se vuelve complejo encontrarlo y modificarlo por la gran cantidad de lineas, y no se sabe con certeza donde se encuentra cada parte o un endpoint especifico. 

Ademas cuando dos personas editan el mismo archivo y no hay una diferencia clara de que parte corresponde a que parte (alumnos,cursos,etc.) se pueden encontrar con merge conflicts que retrasan el desarollo.


**4.** Las queries en `server-noob.js` usan parámetros posicionales (`$1`, `$2`, etc.) en vez de concatenar strings. ¿Qué vulnerabilidad se previene con esto y por qué es importante?

Usando parámetros posicionales se previene la inyección por SQL, una vulnerabildiad donde se puede modificar la query con el texto concatenado.Si el usuario pone un texto especifico como "OR 1=1" que se coloca al final de la query, devuelve todos los registros enves de uno especifico, para poner un ejemplo. Esto resulta una vulnerabilidad a la seguridad y privacidad del proyecto, y se evita tratando a los datos como datos y no concatenandolos a la query.

---

### V2 — server-noob-mejorada.js

**5.** En la versión mejorada se reemplazó `Client` por `Pool`. Explicá la diferencia entre ambos: ¿cómo maneja las conexiones cada uno? ¿Cuándo conviene usar `Client` y cuándo `Pool`?

Pool crea un grupo de conexiones y las reutiliza cuando resulta necesario sin necesidad de tener que crear una nueva con cada endpoint. Cuando se necesita acceder a la base de datos la función agarra una conexión y cuando termina la devuelve a la pool, permitiendo manejar mas conexiones de forma más eficiente.

**6.** ¿Qué es un `Router` de Express y qué problema resuelve en esta versión? ¿Por qué las rutas dentro del router no incluyen `/api/alumnos` y solo definen `''` o `'/:id'`?

El router te permite separar los endpoints relacionados en archivos dedicados a ellos, liberando el archivo principal, la logica de cada endpoint se encuentra en el router de cada uno y simplemente se llama desde el principal. Las rutas una vez dentro del router no incluyen el `/api/alumnos` porque este ya se define en el servidor principal cuando se llama al router, el resto de la ruta la maneja el mismo para hacer los endpoints.

**7.** En `server-noob-mejorada.js`, el archivo principal tiene solo ~26 líneas. ¿Qué responsabilidad tiene ese archivo ahora? ¿Dónde está la lógica de los endpoints?

El archivo principal simplemente configura Express, registra los middlewares, conecta los routers e inicia el servidor. La lógica de cada uno de los endpoints esta en los routers especificos, por lo que el archivo principal queda mucho mas fácil de entender y mas limpio.

**8.** En la versión mejorada desaparece el bloque `finally`. ¿Por qué ya no es necesario cerrar la conexión manualmente al usar `Pool`?

Por como funciona Pool. Al tener el pool con la conexiones reutilizables no resulta necesario cerrarlas ya que simplmente otra función la va a usar para un request distinto y esta misma la va a devolver. Asi no se tiene que hacer el esfuerzo de abrir y cerrar las conexiones.
---

### V3 — server.js (arquitectura en capas)

**9.** Nombrá las tres capas de la arquitectura y explicá con tus palabras qué responsabilidad tiene cada una. ¿Cuál conoce los `req` y `res` de Express? ¿Cuál conoce el SQL? ¿Cuál tiene las reglas de negocio?

Las tres capas son: controller, service y repository. El controller recibe las solicitudes HTTP, lee los request y devuelve la respuesta, es el unico que conoce los req y las res ya que es el unico que los maneja. El service tiene las reglas de negocio, las validaciones y los cálculos necesarios para la aplicación y es quien prepara las respuesta. Por último, el repository se encarga de comunicarse con la base de datos y ejecutar las consultas SQL necesarias. 

**10.** En `alumnos-service.js`, la edad del alumno se calcula en el service con una función JavaScript, en vez de calcularla en la query SQL. ¿Por qué se eligió calcularla en el service y no en la base de datos?

La edad se calcula en el service porque forma parte de las reglas de negocio de la aplicación. De esta manera si en el futuro cambia la forma de calcular la edad, solo se tiene que modificar el service sin tocar las consultas SQL.

**11.** Cuando se crea un alumno con un `id_curso` que no existe, `AlumnosService` llama a `CursosService` para verificarlo. ¿Por qué llama al service de cursos y no directamente al repository de cursos?

AlumnosService llama a CursosService porque asi se respeta la separación de responsabilidades de la arquitectura. Si accediera directamente al repository de cursos podría ignorar validaciones o reglas de negocio del service de cursos. Al utilizar el service correspondiente, toda la lógica relacionada con los cursos queda ordenada.

**12.** ¿Para qué sirve el archivo `.env` y la librería `dotenv`? ¿Qué problema de las versiones anteriores resuelve? ¿Por qué el archivo `.env` no se sube al repositorio de Git?

El archivo .env se usa para guardar configuraciones y datos sensibles, como las credenciales de la base de datos, llaves API, o el puerto del servidor. La librería dotenv carga esas variables en .env cuando la aplicación se inicia. Esto resuelve el problema de tener información sensible escrita directamente en el código fuente, y peor que esta se suba a plataformas como Github, para eso el archivo .env se incluye en el .gitignore.

**13.** ¿Qué hace `LogHelper` y por qué es mejor que usar `console.log(error)` suelto en cada lugar del código?

LogHelper centraliza el registro de errores. Esto es mejor que usar console.log(error) repetido en distintas partes del proyecto porque permite mantener una misma forma de presentarlos sin repetir codigo innecesario, y facilita cambios futuros y formas expecificas, como guardar los errores en archivos de log.

---

### V4 — DbPg y DbMssql

**14.** Mirá `alumnos-repository.js` (versión original) y `alumnos-repository-new.js` (versión refactorizada). ¿Qué código repetido (boilerplate) se eliminó al extraer la clase `DbPg`? Mencioná al menos 3 cosas que ya no aparecen en el repository nuevo.

Al sacar la clase DbPg se elimina código repetido que aparecia en todos los repositories distintos. Por ejemplo, ya no es necesario importar pg, crear y administrar el Pool, ni tener el metodo getDBPool() en cada uno. Tampoco aparecen los bloques try/catch repetidos en cada metodo ni las llamadas a LogHelper.logError(error). Además, desaparece el código encargado de extraer manualmente los resultados de PostgreSQL mediante .rows, .rows[0], .rows[0].id o .rowCount. Ahora el repository solo contiene el SQL y la llamada al metodo correspondiente de Db.

**15.** La clase `DbPg` tiene 4 métodos: `queryAll`, `queryOne`, `queryReturnId` y `queryRowCount`. ¿Qué devuelve cada uno y en qué tipo de operación SQL se usa cada uno?

El método queryAll devuelve todas las filas obtenidas en una consulta y se usa principalmente en consultas SELECT que busca extraer muchos registros. queryOne devuelve únicamente el primer registro encontrado y se usa en consultas SELECT que deberían devolver un único elemento, como una búsqueda por ID. queryReturnId devuelve el ID luego de un INSERT, usando RETURNING id, permitiendo conocer el ID del registro recién creado. queryRowCount devuelve la cantidad de filas afectadas por una operación, como en UPDATE o DELETE para verificar si realmente se modificó o eliminó algún registro.

**16.** En los repositories nuevos, la clase se importa como `import Db from './db-pg.js'` (con el nombre `Db`, no `DbPg`). ¿Por qué se usa ese nombre genérico? ¿Qué pasa si mañana querés cambiar de PostgreSQL a SQL Server — cuántas líneas del repository tenés que modificar?

Se usa el Db porque el repository no necesita saber que motor de base de datos está usando internamente. Solo necesita un objeto con los metodos necesarios. Entonces, si se quiere dejar de usar PostgreSQL y usar otro motor de base de datos, solo se tiene que cambiar la línea del import para que llame a db-(motorbd).js en lugar de db-pg.js.

---

### "¿Dónde lo pondrías?" — Situaciones prácticas

En cada situación, indicá en qué capa lo pondrías (controller, service o repository) y explicá por qué.

**17.** Necesitás agregar un nuevo endpoint `GET /api/alumnos/curso/:idCurso` que devuelva todos los alumnos de un curso. La query sería `SELECT * FROM alumnos WHERE id_curso = $1`. ¿Dónde pondrías esa query? ¿Dónde pondrías la ruta del endpoint? ¿Agregarías algo en el service?

Para obtener los alumnos de un curso se deberia agregar el endpoint en en el repository, ya que es la capa de acceso a datos. La nueva ruta GET /api/alumnos/curso/:idCurso debería definirse en el controller, que es quien maneja los endpoints y agregaría un método en el service para intermediar entre ambas capas y aplicar cualquier regla de negocio, en caso de que sea necesario, antes de devolver la información.

**18.** El cliente pide que al crear un alumno, si no se manda `fecha_nacimiento`, el sistema ponga la fecha de hoy por defecto. ¿En qué capa pondrías esa lógica y por qué? ¿Es una regla de negocio o es algo de la base de datos?

Al ser una regla de negocio de la aplicación se deberia aplicar en el service, ya que no esta relacionado a los datos en si, si no a decisiones del  proyecto. En service se modifica el dato fecha_nacimiento y este se manda como si fura uno normal al repository.

**19.** Necesitás que al eliminar un curso, se verifique primero que no tenga alumnos asociados, y si tiene, devolver un error `400` con el mensaje "No se puede eliminar el curso porque tiene alumnos asociados". ¿Dónde pondrías la verificación (la consulta de si tiene alumnos)? ¿Dónde pondrías el `throw new Error(...)`? ¿Y dónde se atraparía ese error para devolver el `400`?

Se debería hacer en el repository, ya que implica acceder a la base de datos. Luego, el service tiene que analizar el resultado y enviar un error si hay alumnos vinculados al curso. Y el controller tendria que capturar el error y devolver una respuesta HTTP 400 con el mensaje correspondiente.

**20.** Te piden agregar un endpoint que devuelva un resumen por curso: nombre del curso, cantidad de alumnos, y el promedio de edad de esos alumnos. ¿Qué parte resolvés con SQL (en el repository) y qué parte resolvés con lógica (en el service)? ¿O se puede resolver todo en una sola capa?

El repository debería encargarse de obtener la información desde la base de datos, usando querys SQL que permitan conocer la cantidad de alumnos por curso y el resto de datos. Y despues, el service se encarga de hacer las cuentas necesarias como el promedio de edad. De esta manera se mantiene la separación de responsabilidades entre acceso a datos y reglas de negocio.
