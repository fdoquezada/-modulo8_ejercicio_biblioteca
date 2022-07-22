//cargar librerias
const express=require('express');
const {conexion}=require("./bd");
const fs=require("fs");
const upload=require("express-fileupload");
const path=require("path")
const morgan= require("morgan")


//incializacion
const app=new express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views",__dirname+"/views");
app.use(morgan("dev"))
//rutas
//raiz
app.get('/', (req, res) => {
  res.render('index');
})
//galeria
app.get('/galeria', async (req, res) => {
  let consulta= 'select l."Id", l."Nombre" AS "Libro",a."Nombre" as "Autor",l."Edicion" from "Libros" l'
  consulta += ' JOIN "Autores" a ON l."IdAutor"=a."Id" '
  let resultado;
  console.log(consulta);
  try{
    resultado = await conexion.query(consulta);
  }catch(err){
    console.log("Error em consulta:" + err.message);
    res.status(500);
    res.json({mensaje:"Error al buscar datos"})
  }  
  //revisar si existe una foto asociada a cada libro, si no lo hay asociados la foto noimg
  let libros=resultado.rows;
  //obtener la lista de archivos en la carpeta de fotos
  const listaArchivos=fs.readdirSync("public/img");  
  //revisar si cada libro tiene una foto en la carpeta de imagenes
  //con el mismo id, si no, se carga la foto por defecto
   libros.forEach(async l => {    
      let archivo=listaArchivos.filter(a=>
        a.split(".")[0]==l.Id //divido el nombre del archivo en dos, 
        //y comparo la parte izquierda (sin extension) con el id del libro
      )
      if(archivo.length==0){ //si no se encontró foto para el libro
        l.ruta="img/noimg.jpg"; //cargo la imagen por defectp
      }else{
        l.ruta="img/"+archivo[0]; //cargo la imagen que corresponde al id
      }
   });
   //envió la web al cliente
  res.render('galeria',{libros:libros});
})
//contacto
app.get('/contacto', (req, res) => {
  res.render('contacto');
})
app.get("/ingresolibros",async function(req,res){
  const consultaAutores='SELECT "Id","Nombre" FROM "Autores"';
  const consultaGeneros='SELECT "Id","Nombre" FROM "Genero"'
  const consultaEditoriales='SELECT "Id","Nombre" FROM "Editorial"'
  const consultaIdiomas='SELECT "Id","Nombre" FROM "Idioma"'
  let respuestaAutores;
  let respuestaGeneros;
  let respuestaEditoriales;
  let respuestaIdiomas;
  try {
     respuestaAutores=await conexion.query(consultaAutores);  
     respuestaGeneros=await conexion.query(consultaGeneros);  
     respuestaEditoriales=await conexion.query(consultaEditoriales);  
     respuestaIdiomas=await conexion.query(consultaIdiomas);  
  } catch (error) {
    console.log("error consulta:"+error.message)
  }
  const autores=respuestaAutores.rows;
  const generos=respuestaGeneros.rows;
  const editoriales=respuestaEditoriales.rows;
  const idiomas=respuestaIdiomas.rows;
  
  console.log(autores);
  res.render("ingresoLibros",{autores,generos,editoriales,idiomas})
  
  });
  
  
  app.post("/agregarLibro",async function(req,res){
    //buscar el id para el nuevo libro
    consultaId='SELECT COALESCE(MAX("Id"),0)+1 AS "Id" FROM "Libros"';
    let respuesta;
    try {
      respuesta=await conexion.query(consultaId);
    } catch (error) {
      console.log("error consulta:"+error.message)
      return res.status(500).send("Error al insertar datos");
    }
    console.log(respuesta);
    const id=respuesta.rows[0].Id;
  
    //agregar los datos a la BD
    consultaInsert='INSERT INTO "Libros" VALUES($1,$2,$3,$4,$5,$6,$7,$8)'
    const parametros=[id,req.body.nombre,req.body.paginas,req.body.edicion,req.body.autor,req.body.editorial,req.body.genero,req.body.idioma];
    try {
      await conexion.query(consultaInsert,parametros);
    } catch (error) {
      console.log("error consulta:"+error.message)
      return res.status(500).send("Error al insertar datos");
    }
    //guardar foto
    const ruta=__dirname+"/public/img/"+id+"."+path.extname(req.files.imagen.name);
    req.files.imagen.mv(ruta,function(err){
      if(err){
        console.log("error al guardar archivo:"+error.message)
        return res.status(500).send("Error al guardar archivo");
      }
    })
  
    res.send("OK");
  });

  
  app.get ('/ingresoautores', (req, res) => res.render("ingresoautor"));
  
  //app.use(bodyParser.unlecoded({ extends: false}));
  
  //ingresamos autores
  /* app.post("/agregarautor", async function(req,res){
    const consultaId='SELECT COALESCE(MAX("Id),0)+1 AS "Id From "Autores"';
    let respuestaId;
    try {
      respuestaId = await conexion.query(consultaId);
    } catch (error) {
      console.log("error consulta:"+error.message);
      return res.status(500).send("Error al insertar datos:")
    }
    const consultaInsert ='Insert into  "Autores" Values'
  }
   */
  

module.exports={app}