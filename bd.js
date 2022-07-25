const {Pool}=require("pg");
require("dotenv").config();

const configuracion={
   connectionString: process.env.DATABASE_URL,
   ssl: {
    rejectUnauthorized: false
   }
}

const conexion=new Pool(configuracion);

module.exports={conexion}