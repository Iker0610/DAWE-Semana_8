const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Middleware para el parseo de req.body
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const multer = require('multer');

const storage = multer.diskStorage({

    // definir restricciones para que los ficheros subidos se guarden en la carpeta public/imgs/
    // tamaño máximo de los ficheros: 2MB
    // sólo se admiten ficheros jpg o png
    // el nombre del fichero que se guarda debe coincidir con el que se envían

    destination: function (req, file, cb) {
        cb(null, 'public/imgs')
    },
    filename: function (req, file, cb) {
        let splitted_mime = file.mimetype.split("/")
        let extension = '.' + splitted_mime[splitted_mime.length - 1];
        cb(null, path.parse(file.originalname).name + extension)
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 2 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype) {
            return cb(null, true);
        }
        return cb(new Error('Solo permitimos formatos .png, .jpg y .jpeg'));
    }
});

const pedido = upload.array('fileselect');

app.post('/pedido/add', (req, res) => {

    pedido(req, res, (err) => {
        // en caso de error, devolver un objeto JSON
        // { sucess:false, error: err  }

        // en caso de éxito, devolver un objeto JSON que contenga: success:true, la ruta a los ficheros
        // subidos y los valores recibidos en cada campo del formulario POST

        if (err) {
            let errorMessage = (err.code !== undefined) ? "Some uploaded file is too big." : "File extension not valid."
            res.send({success: false, error_message: errorMessage, error: err})
        } else {
            res.send(
                {
                    success: true,
                    nombre: req.body.nombre,
                    telefono: req.body.telefono,
                    mail: req.body.mail,
                    libro: req.body.libro,
                    num_libros: req.body.num_libros,
                    remote_files: req.files.map(element => element.path)
                }
            )
        }
    })
});


app.listen(8001, function () {
    console.log("Servidor lanzado en el puerto 8001");
});
