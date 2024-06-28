var fs = require('fs');
var recursive = require('recursive-readdir');
var https = require('https')
var async = require('async');
var moment = require('moment');
var _ = require('underscore');
var XLSX = require('xlsx');
var nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
var Utils = require('../make/js/utils').Utils;
var docSystem = require('../make/js/genDocumentSystem');
var codeSystem = require('../make/js/genCodeSystem');
var makeSql = require('../make/js/makeSql');
var makeCfg = require('../make/js/makeCfg');
//var MD5 = require('md5');
//var replaceExt = require('replace-ext');
var params = '';
var subProyects, proyectId, esIndex;

// "tenant": "demo-jha",

// const { decisionTable } = require('js-feel')();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// process.env.UV_THREADPOOL_SIZE = 512;

/*var decisionTable;
if (nodeVersion<7){
  decisionTable = require('js-feel').decisionTable;
} else {
  // a partir de la version 1.3.1 funciona asi, y esta version se instala cuando es un node mas reciente
  decisionTable = require('js-feel')().decisionTable;
}*/

// host
var makeToken = "58c41f52-6fcb-43c2-82a0-760b435d344a";
var wasabiHost = 'demo.enlanube.io'
var clave = 'CURP';
var lang = 'es';
var useDisplay2 = false;

// git clean -f
// git reset --hard 

// tree -ls
// du -a
// screen -rd

/*
cd
cd git/wasabi
nvm use 14
pm2 start dev.json
pm2 logs
*/

// forever start dev.json
// tail -f /Users/joseheffes/.forever/api.log -f /Users/joseheffes/.forever/worker.log
// forever stopall
// forever list

// tamano de un directorio
// du -sh
// du -hx -d2

// ps aux | grep node
// kill #id

// en linux cluster
// sudo nano /etc/mongod.conf 
// sudo service mongod restart
// cambiar el puerto a 31544, 31555
// replication:
//  replSetName: replocal
// comentar bindIp

// en la mac
// nano /usr/local/etc/mongod.conf

// sudo systemctl status mongod
// sudo systemctl stop mongod
// sudo systemctl start mongod
// sudo systemctl restart mongod
// sudo service mongod restart
// systemctl start redis

// borrar el log jurnal
// journalctl --vacuum-size=500M


// brew services list
// brew services stop mongodb-community
// brew services start mongodb-community 
// brew services start postgresql

// brew services start elasticsearch
// http://localhost:9200/


// nvm i v14.21.2 (a veces solito se mueve a esa version)
// nvm uninstall v12.8.0 (la version que esta corriendo)
// source ~/.bash_profile
// echo 'alias sudo="sudo env PATH=$PATH:$NVM_BIN"' >> ~/.bashrc
// npm i pm2 -g


// instalar elasticsearch en centos
// https://comoinstalar.me/como-instalar-elasticsearch-en-centos-7/
// curl localhost:9200

// para ejecutar monstache en la mac
// cd
// cd git/monstache
// ./start.sh

// esto funciona en linux y mac
// sudo nano ~/.git-credentials
// ver fortinet
// git clone https://github.com/bh-jha/prod-wasabi.git

// manual nuevo token de github
// https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token
// Para actualizar el token, funciono mejor hacer uno nuevo con todos los permisos y ahi es donde me dejo copiar el token

// para guardar el usuario en git (linux)
// git config --global credential.helper store
// git pull

// sudo nano /etc/hosts
// para editar las credencianles o cambiar en token

// mongo -port 31544 (entrar al command de mongo y correr esto)
// mongo -port 31555 (entrar al command de mongo y correr esto)
// rs.initiate()

// se necesita poner a mongo como replica set (para que funcione monstache)
// https://gist.github.com/davisford/bb37079900888c44d2bbcb2c52a5d6e8

// para poder acceder al servidor sin poner el password, primero hay que crear una llave que esta ligada a la computadora / usuario
// en este caso MacBook-jheffes, cuando se copia el ssh-copy-id se mueve el key al servidor
// de esta forma ya podemos entrar sin password desde esa misma computadora

// cd ~/.ssh
// ssh-keygen -t ed25519 -C "MacBook-jheffes"
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.33
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.34
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.35
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.51
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.52
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.53
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.37
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.38
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.44
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.41
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.39
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.40
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@10.10.17.45
// Root.2022

// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@172.18.30.70
// 
// Arboles2323..
// ssh root@mcb

// para ver el hardware de la computadora
// lshw
// lshw > hw.txt

// ssh root@hraei-prod-a
// ssh root@hraei-prod-b
// ssh root@hraei-redis
// ssh root@hraei-etl
// ssh root@hraei-mongo
// ssh root@hraei-replica2
// ssh root@hraei-replica3

// redis-cli -h 10.10.17.35 -p 6379 -a 8sjUsA7d

// para guardar pm2 (autoexec)
// sudo pm2 start package.json
// sudo pm2 save
// sudo pm2 unstartup
// sudo pm2 startup
// sudo pm2 logrotate -u ec2-user
// sudo pm2 logrotate -u root
// pm2 logrotate -u root

// a veces se satura el log del sistema con este comando se libera el espacio
// systemctl restart syslog

// pm2 logrotate -u root
// pm2 save
// pm2 startup
// cd /etc/logrotate.d/ 

// para guardar pm2 (autoexec on-premise)
// pm2 start package.json
// pm2 save
// pm2 startup
// pm2 logrotate -u root
// cd /etc/logrotate.d/ 

// para conectarse a un mongo con replica set, esto hace automatico el balance (al parecer) y el primario es el primero
// mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=myRS

// al indexar que no falle y que ignore llaves grandes
// mongod --setParameter failIndexKeyTooLong=false
// db.getSiblingDB('admin').runCommand( { setParameter: 1, failIndexKeyTooLong: false } )

// para instalar mongodb-tools
// instalar el repo primero
// https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-amazon/
// https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-red-hat/


// para ver como esta configurado la zona horaria en el servidor
// https://docs.oracle.com/en/learn/oracle-linux-localization/index.html
// timedatectl

// para cambiar la zona horaria en el servidor (timezone)
// sudo nano /etc/sysconfig/clock
// ZONE="Etc/GMT+6"
// ZONE="America/Mexico_City"
// ZONE="America/Santiago"
// UTC=true // otra opcion

// sudo ln -sf /usr/share/zoneinfo/Etc/GMT+6 /etc/localtime
// sudo ln -sf /usr/share/zoneinfo/America/Mexico_City /etc/localtime
// sudo ln -sf /usr/share/zoneinfo/America/Santiago /etc/localtime
// sudo reboot

// para resolver lo de la zona horaria nueva en mexico sin horario de verano, 
// tuvimos que copiar el archivo que funcionaba bien de minio ya que era el unico servidor
// que mostraba UTC-6 y como no sabiamos como cambiar eso copiamos ese archivo en Mexico_City2 
// lo que se hizo fue copiar este archivo a los demas servidores y cambiar la zona horaria

// ip a // con esto puedo saber la IP desde el servidor
// sudo scp Mexico_City2 root@10.10.17.53:/root
// pide el password Root.2022
// mv Mexico_City2 /usr/share/zoneinfo/America/
// sudo ln -sf /usr/share/zoneinfo/America/Mexico_City2 /etc/localtime
// es mejor forzar a Etc/GMT+6 y no ponemos cosas raras
// sudo reboot
// esto es lo que hay que cambiar
// CST6CDT,M4.1.0,M10.5.0
// CST6CDT

// otra forma de resolver este tipo de problemas, al parecer vCenter tiene algo para sincronizar todos los relojes de todos los servidores virtuales

// estatus servicio minio
// sudo systemctl status minio

// monstache
// cd/usr/local/bin
// para dejar como servicio
// https://rwynn.github.io/monstache-site/advanced/#systemd
// descargar monstache
// https://github.com/rwynn/monstache/releases
// copiar ejecutable de linux y configuracion a /usr/local/bin
// monstache y monstache.toml
// cambiar monstache.toml a que apunte a la base de datos correcta

// cd /lib/systemd/system
// sudo nano monstache.service
// sudo systemctl enable monstache.service
// sudo systemctl start monstache.service
// sudo systemctl status monstache.service

// monstache como servicio 
// https://rwynn.github.io/monstache-site/advanced/#systemd
// sudo systemctl start monstache.service
// sudo systemctl stop monstache.service
// sudo systemctl status monstache.service

// brew services start mysql

// paypal
// https://developer.paypal.com/docs/payflow/integration-guide/test-transactions/#processors-other-than-paypal 
// 378282246310005
// 971331167


// para ver cuantas veces se ha re-iniciado pm2
// sudo pm2 report
// sudo pm2 monit
// sudo pm2 imonit

// logs 
// tail /home/ec2-user/logs/static-error.log

// frontail -p 8090 -n 200 --ui-hide-topbar --theme dark ~/logs/*.log &

// para ver los logs
// cd /logs
// tail static-out.log -n 80000
// tail static-error.log -n 10000
// tail worker-error.log -n 10000

// para limpiar los logs
// sudo pm2 flush 

// https://www.maketecheasier.com/compress-archives-using-all-cpu-cores-tar/
// yum install pbzip2
// tar -I pbzip2 -cf test.tar.bz2 delta2/


// exportar mongo > csv > s3
// mongoexport --host="mongodb.saludness.com" --port=27017 --db <base de datos> --collection <colleccion> --type=csv --fields _id,campo1,campo2 --out /data/archivo.csv; tar cjf  /data/archivo.tar.bz2  /data/archivo.csv; aws s3 cp /data/archivo.tar.bz2 s3://<bucket>; rm -f /data/archivo.tar.bz2  /data/archivo.csv
// para subir algo pesado de EC2 a S3
// https://gist.github.com/sevastos/5804803

// hraei-prod mongo administrador zecVuf-sojbex-1majse
// borrar los adjuntos
/*
db.getCollection('paciente').update({},{$unset: {adjuntos:1}},{multi:true})
db.getCollection('persona').update({},{$unset: {adjuntos:1}},{multi:true})
db.getCollection('persona').update({},{$unset: {'resumen.adjuntos':1}},{multi:true})
db.getCollection('persona').update({},{$unset: {'detalle.adjuntos':1}},{multi:true})
*/

/*
db.getCollection("persona").updateMany({ "detalle.diagnostico.base._extra" : { $exists : true } },{$unset:{"detalle.diagnostico.$[].base._extra":1}})
*/

// exportar "medicamento","mezcla","solucion","material" de los pacientes para elias
/*
db.getCollection("solicitud").find(
  { "persona.id": "5dfb8bac50cae234b16a4d6d", "base.tipoSolicitud": { $in: ["medicamento", "mezcla", "solucion", "material"] } },
  { "_id": 1, "base.codigo": 1, "base.importe": 1, "base.cantidad": 1, "base.dosis": 1, "_date": 1, "_updated.moment": 1, "persona.id": 1, "persona._listaPrecios": 1, "persona.clave": 1, "base.tipoSolicitud": 1, "control": 1 }
)

db.getCollection("persona").find(
  { "persona.clave": "LIRA620427HMCNYR00" }
)
db.getCollection("mov").find(
  { "cuenta": "5d5f082b6a55845da60a7dfd", "codigo": "HRAEI-MD0279", "factor": NumberInt(1) }
)
.sort( { "nota.date": 1 } )
db.getCollection("solicitud").find(
  { "persona.id": "5d5f082b6a55845da60a7dfd", "base.codigo": "HRAEI-MD0279" }
)
.sort( { "_date": 1 } )
*/

// limpiar camas / borrar camas
// db.getCollection('cama').update({},{$set: {'base.estatus':'limpia','base._estatus':'Limpia',persona:null,ingreso:null,temporal:null}},{multi:true})

// poner hospitalizacion cama
// db.getCollection("persona").update({_id:ObjectId('5ee3c53271420a3a29ebd6d8')},{"$set":{"resumen.hospitalizacion":{"nombre":"Hospitalización","ultimoCambio":"2020-06-06T13:58:54-05:00","lista":[{"etiqueta":"Cama Hospitalización","nombre":"448"}]}}})

// db.getCollection("solicitud").find(
//   { "base.tipoSolicitud": "material", "control.faltante": { $gt: NumberInt(0) }, "control.utilizado": { $gt: NumberInt(0) } }
// )

/*
npm i pngjs
npm i zpl-image
npm i canvas
// HRAEI (documentDB)
npm i mongodb@3
// otros servidores
npm i mongodb@2

git stash
git pull
sudo pm2 restart all
*/

//inventario por lotes
//db.getCollection("mov").aggregate([{"$match":{"$and":[{"aux":"inv"},{"cuenta":"almacenCuracion"},{"codigo":"HRAEI-MA0530"},{"nota.date":{"$lt":"2022"}}]}},{"$group":{"_id":{"codigo":"$codigo","lote":"$lote"},"cantidad":{"$sum":"$cantidadFactor"},"importe":{"$sum":"$importeFactor"}}}])

// paris
// db.getCollection("notaResultadoEstudio").aggregate([{"$match":{"$and":[{"resultados.codigo":{"$in":["022-44","022-33","022-26","030-10","030-10","022-46"]}}]}},{"$group":{"_id":{"persona":"$persona.id"},"conteo":{"$sum":1}}}])

// negativos
// db.getCollection("mov").aggregate([{"$match":{"$and":[{"aux":{"$eq":"inv"}}]}},{"$group":{"_id":{"cuenta":"$cuenta","codigo":"$codigo","lote":"$lote","vencimiento":"$vencimiento"},"cantidad":{"$sum":"$cantidadFactor"}}},{"$match":{"$and":[{"cantidad":{"$lt":0}}]}}])
// db.getCollection("mov").aggregate([{"$match":{"$and":[{"aux":{"$eq":"inv"}},{"codigo":{"$eq":"HRAEI-MA4289"}}]}},{"$group":{"_id":{"cuenta":"$cuenta","codigo":"$codigo","lote":"$lote","vencimiento":"$vencimiento"},"cantidad":{"$sum":"$cantidadFactor"}}},{"$match":{"$and":[{"cantidad":{"$lt":0}}]}}])
// db.getCollection("mov").aggregate([{"$match":{"$and":[{"aux":{"$eq":"inv"}},{"codigo":{"$eq":"HRAEI-MZON30"}}]}},{"$group":{"_id":{"cuenta":"$cuenta","_cuenta":"$_cuenta","lote":"$lote","vencimiento":"$vencimiento"},"existencia":{"$sum":"$cantidadFactor"}}}])

// existencia casi cero
// db.getCollection("mov").aggregate([{"$match":{"$and":[{"aux":"inv"},{"cuenta":"almacenGeneral"},{"codigo":{"$in":["HRAEI-MZON-30","HRAEI-MZON-35"]}}]}},{"$group":{"_id":{"cuenta":"$cuenta","codigo":"$codigo","lote":"$lote","vencimiento":"$vencimiento"},"cantidad":{"$sum":"$cantidadFactor"}}},{"$match":{"$and":[{"cantidad":{"$ne":0}}]}}])

// agrupar por articulo
//db.getCollection("mov").aggregate([{"$match":{"$and":[{"aux":"inv","codigo":"HRAEI-MA0418"}]}},{"$group":{"_id":{"codigo":"$codigo","tipoUbicacion":"$tipoUbicacion","cuenta":"$cuenta","_cuenta":"$_cuenta","lote":"$lote","vencimiento":"$vencimiento"},"cantidad":{"$sum":"$cantidadFactor"},"conteo":{"$sum":1}}}])
//db.getCollection("mov").aggregate([{"$match":{"$and":[{"aux":{"$eq":"inv"}}]}},{"$group":{"_id":{"codigo":"$codigo"},"cantidad":{"$sum":"$cantidadFactor"},"conteo":{"$sum":1}}}])
//db.getCollection("mov").aggregate([{"$match":{"$and":[{"aux":{"$eq":"inv-fix"}}]}},{"$group":{"_id":{"codigo":"$codigo","cuenta":"$cuenta"},"conteo":{"$sum":1}}}])
//db.getCollection("mov").aggregate([{"$match":{"$and":[{"aux":{"$eq":"inv-fix"}}]}},{"$group":{"_id":{"codigo":"$codigo","cuenta":"$cuenta"},"conteo":{"$sum":1}}}])

//db.getCollection("notaFinalizaAtencion").db.getCollection("notaFinalizaAtencion2").aggregate([{"$group":{"_id":{"solicitud":"$base.solicitud._id"},"conteo":{"$sum":1}}},{"$match":{"$and":[{"conteo":{"$gt":1}}]}}])
//db.getCollection("notaFinalizaAtencion2").db.getCollection("notaFinalizaAtencion2").aggregate([{"$group":{"_id":{"solicitud":"$base.solicitud._id"},"conteo":{"$sum":1}}},{"$match":{"$and":[{"conteo":{"$gt":1}}]}}])

// para corregir el cambio de vencimiento en los lotes
//db.getCollection("mov").aggregate([{"$match":{"$and":[{"aux":{"$eq":"inv"},"cuenta":"farmacia","codigo":"HRAEI-MD0986","vencimiento": "2021-06-01"}]}},{"$group":{"_id":{"lote":"$lote","vencimiento":"$vencimiento"},"cantidad":{"$sum":"$cantidadFactor"}}}])
//db.getCollection("mov").updateMany({ "aux": "inv", "cuenta": "farmacia", "codigo": "HRAEI-MD0986", "lote": "19J131", "vencimiento": "2021-01-06" }, {$set:{"vencimiento": "2021-06-01"}})
//db.getCollection("mov").aggregate([{"$match":{"$and":[{"aux":{"$eq":"inv-fix"}}]}},{"$group":{"_id":{"type":"$nota.type"},"conteo":{"$sum":1}}}])

// solicitudes
// db.getCollection("solicitud").find({ "_date": { $lt: "2019-12" }, "_isAffected": true }, { "base.tipoSolicitud": 1, "base._tipoSolicitud": 1, "base.servicio": 1, "base.servicioOrigen": 1, "base._servicioOrigen": 1, "base.codigo": 1, "base.descripcion": 1, "base.categoria": 1, "base._categoria": 1, "base.estatus": 1, "base._estatus": 1, "base.prioridad": 1, "base._prioridad": 1, "base.esUrgente": 1, "base.central": 1, "base._central": 1, "base.cama": 1, "base._cama": 1, "base.esBien": 1, "base.solicitante": 1, "base._solicitante": 1, "base._especialidad": 1, "base._especialidad2": 1, "base.tipoCobertura": 1, "base.surtirDe": 1, "base.esMaterial": 1, "base.subCategoria": 1, "base.cantidad": 1, "base.precio": 1, "base.importe": 1, "base.esMultidosis": 1, "base.articulo": 1, "_created.date": 1, "_created.user": 1, "_created._user": 1, "_created._identification": 1, "_created.sid": 1, "_created.board": 1, "_created.service": 1, "_created._service": 1, "_created.request": 1, "_created._request": 1, "_created.folio": 1, "_date": 1, "_isAffected": 1, "_name": 1, "_parent": 1, "_source": 1, "_type": 1, "_updated": 1, "control": 1, "persona": 1})

// para saber que pacientes tienen movimientos
// db.getCollection("solicitud").aggregate([{"$match":{"$and":[{"base.tipoSolicitud":{"$in":["material","medicamento","solucion","mezcla"]},"_date":{"$lt":"2020-03-31"}}]}},{"$group":{"_id":{"persona":"$persona.id"},"conteo":{"$sum":1}}}])

// solicitudes por momento
// db.getCollection("solicitud").aggregate([{"$group":{"_id":{"moment":"$_updated.moment"},"conteo":{"$sum":1}}}])

// mover las solicitudes de un paciente a internado y hospitalizacion
// db.getCollection("solicitud").updateMany({ "persona.id" : "5fadd23f7320f052c339ce88", "base.tipoEpisodio" : "ambulatorio", "_date" : { $gt : "2020-11-12" } },{"$set":{"base.tipoEpisodio":"hospitalizacion","base._tipoEpisodio":"Hospitalización","base.hospitalizacionDesde":"2020-11-12T18:25:19-06:00","control.situacionActual":"internado","control._situacionActual":"Internado"}})

// borrar o quitar preCierreCuenta
// db.getCollection("persona").updateOne({ "persona.clave" : "HEMR840928HDFRLC02" },{$unset:{'detalle.preCierreCuenta':1,'detalle._preCierreCuenta':1,}})

// pedientes idoneidad
// {"$and":[{"_updated.moment":{"$exists":false}},{"base.estatus":{"$in":["nuevo","instalar","continuar"]}},{"base.requiereAutorizacion":{"$exists":false}},{"base.servicio":{"$eq":"farmacia"}}]}

// aux inv en ceros (importe y cantidad)
// db.getCollection("mov").find({ $and: [ { "aux": "inv" }, { $or: [ { "cantidad": NumberInt(0) }, { "cantidad": { $exists: false } } ] }, { $or: [ { "importeFactor": 0.0 }, { "importeFactor": { $exists: false } } ] } ] })

// por Ministrar
// db.getCollection("solicitud").find({ "base.tipoSolicitud": { $in: ["medicamento","material"] }, "control.porMinistrar": { $gt: NumberInt(0) }, "_updated.moment": { $nin: ["finalizado","cancelado","rechazado"] } }, { "base.codigo": 1, "base.descripcion": 1, "control.porMinistrar": 1, "persona.id": 1, "persona.nombreCompleto": 1, "persona.clave": 1, "_created.date": 1, "base.nota": 1, "base._nota": 1, "base.tipoSolicitud": 1})

// tococirugia
// db.getCollection("solicitud").find({ "base.tipoSolicitud": "tococirugia" }, { "_date": 1, "base._nota": 1, "persona.nombreCompleto": 1, "persona.clave": 1, "persona._listaPrecios": 1})

// finalizar alimentos
// db.getCollection("solicitud").updateMany({ "base.servicio": "alimentos", "_updated.moment": "programado", "_date": { $lt: "2020-04-01" } }, {$set:{'_updated.moment':'finalizado','_updated._moment':'Finalizado'}})

// reporte SHCP
// db.getCollection("persona").find({ $or: [ { "detalle.diagnostico.base.diagnostico": /^S.*/i }, { "detalle.diagnostico.base.diagnostico": /^C.*/i }, { "detalle.diagnostico.base.diagnostico": /^O.*/i }, { "detalle.diagnostico.base.diagnostico": { $in: ["I20","I21","I22","I23","I24","I25","E112","E122","E132","E142","I6","P36","A41","G40","R57","R60","P22"] } }, { "detalle.diagnostico.base.diagnostico": /^J.*/i } ] }, { "persona.nombreCompleto": 1, "persona.clave": 1, "detalle.diagnostico.base.diagnostico": 1, "detalle.diagnostico.base.estatus": 1, "detalle.diagnostico.base.tipo": 1})
// db.getCollection("solicitud").find({"contexto.hospitalizacion.estaActivo":true,'base.estatus':{$in:['nuevo','continuar']},'_updated.moment':{$ne:'cancelado'}, "base.tipoSolicitud": { $in: ["medicamento","material","solucion","mezcla"] }, "_created.date": /^2019-10.*/i, $or: [ { "control.utilizado": { $exists: true } }, { "control.ministrado": { $exists: true } } ], "_updated.moment": { $ne: "cancelado" } }, { "base.codigo": 1, "base.descripcion": 1, "base.tipoSolicitud": 1, "base._tipoSolicitud": 1, "control.importe": 1, "control.utilizado": 1, "control.ministrado": 1, "persona.id": 1, "persona.clave": 1, "persona.nombreCompleto": 1, "_updated.moment": 1,'contexto.hospitalizacion.desde':1,"_created.date":1,'base.estatus':1,'_updated.moment':1})
// db.getCollection("articulo").find({ "base.tipoArticulo": { $in: ["material","medicamento","solucion"] } }, { "base.codigo": 1, "base.tipoArticulo": 1, "base.descripcion": 1, "base.presentacion": 1, "base.unidadCompra": 1, "base.factorCompra": 1, "base.unidadTraspaso": 1, "base.factorTraspaso": 1})
// db.getCollection("notaEgreso").find({ "base.estatus": "afectado", "_created.date": /^2019-10.*/i }, { "_created.date": 1, "persona.clave": 1, "persona.nombreCompleto": 1, "persona.id": 1, "_name": 1})

// salidas aux oct y nov 2019
// {"$and": [{"nota.type": "notaPorReservar"}, {"nota.date": {"$gt": "2019-10"}}, {"nota.date": {"$lt": "2019-12"}}, {"aux": "inv"}]}
// {"aux": 1.0, "codigo": 1.0, "descripcion": 1.0, "grupo": 1.0, "lote": 1.0, "cantidad": 1.0, "tipoUbicacion": 1.0, "cuenta": 1.0, "_cuenta": 1.0, "factor": 1.0, "importe": 1.0, "vencimiento": 1.0, "cantidadFactor": 1.0, "importeFactor": 1.0, "nota.id": 1.0, "nota.type": 1.0, "nota.name": 1.0, "nota.date": 1.0, "persona.nombreCompleto": 1.0, "persona.clave": 1.0}
// traspasos de oct y nov
// db.getCollection("notaPorReservar").find({ $and: [ { "_created.date": { $gt: "2019-10" } }, { "_created.date": { $lt: "2019-12" } }, { "base.estatus": "afectado" } ] }, { "base.ubicacionOrigen": 1, "base._ubicacionOrigen": 1, "base.ubicacionDestino": 1, "base._ubicacionDestino": 1, "_name": 1})

// sudo pm2 start package.json -i max

// ssh -i "dev-saludness.pem" ec2-user@hraei-tunel.saludness.com
// redis-cli -h hraei-redis.fj0bvo.0001.use1.cache.amazonaws.com
// del _metadata 
// keys *
// del "notaCobro/60be4452634bcec5a6f33022"

// https://search-eskhraei-pasmwz7av4lvhqrppuqiszhxdq.us-east-1.es.amazonaws.com/_cat/indices?pretty
// https://search-eskhraei-pasmwz7av4lvhqrppuqiszhxdq.us-east-1.es.amazonaws.com/demo-his.nota/_search?pretty
// borrar KPI's elastic
//curl -XDELETE 'https://search-eskhraei-pasmwz7av4lvhqrppuqiszhxdq.us-east-1.es.amazonaws.com/dpi?pretty'
//curl -XDELETE 'https://search-eskhraei-pasmwz7av4lvhqrppuqiszhxdq.us-east-1.es.amazonaws.com/demo-his.nota?pretty'
//db.getCollection("cama").update({'base.central':'tococirugia','base.estatus':{$ne:'limpia'}},{$set:{'base.estatus':'limpia','base._estatus':'Limpia'}},{multi:true})
//db.getCollection("cama").update({'base.central':'hospitalizacionCuneroTransitorio'},{$set:{'base.estatus':'limpia','base._estatus':'Limpia'}, $unset:{ingreso:1, persona:1}},{multi:true})
// usuarios con acceso a modificar pacientes
// {'base.nivelAcceso':{$in:['registro','usuarios','configuracion']},'base.rolesAcceso':{$eq:'registroPacientes'}}


// para sacar el estado de cuentas y que cuadre con el saldo por cobrar
// db.getCollection("solicitud").find({ $and: [ { "persona.clave": "VAOG011110MDFZSTA5" }, { "_updated.moment": { $exists: true } }, { "_updated.moment": { $ne: "cancelado" } }, { "control.importe": { $exists: true } } ] })
// 1X
// db.getCollection("solicitud").updateMany({ "persona.clave": "PUSV840603MOCBLR08", "_date": { $gt: "2019-08-21T10:35:50-05:00" }, "control.importe": { $gt: 1.0 } },{$set:{'control.importe':0.01,'control.cobrado':0.01,'control.porCobrar':0}})
// "AARD551117HDFLCV00","AXBS780427HNELRM08","BAMA710603MPLRRR06","CACV060121HMCSRCA9","DOSM840807HMCRLG08","GAGA181130HMCLSDA3","MAML841230MMCRRS08","MARA890923HDFYDL04","MAVS590421MMCRLL08","MEJA561023MHGLVS04","NOGJ821204HMCRRS01","OORJ961002HMCRMR04","PUSV840603MOCBLR08","RAOL730920MGRMRN08","RAPJ030525MMCFRZA9","RAVM380719MOCMLG05","RERR801231MDFYDS04","SAPR580306MDFLCT01","SASG771212HMCNND05","ZACS770409MMCRRN08"
// "AXBS780427HNELRM08","MAML841230MMCRRS08","MAVS590421MMCRLL08","MEJA561023MHGLVS04","NOGJ821204HMCRRS01","RAOL730920MGRMRN08"
// "MAML841230MMCRRS08","PUSV840603MOCBLR08","RAPJ030525MMCFRZA9"

// solicitud pacientes (Plan B)
// db.getCollection("solicitud").find({ "persona.clave": { $in: ["MARA890923HDFYDL04","FAGM791210HDFRNG08","RACK990128MMCMSR06","CALA360815HPLRPL04","CAAA950608MDFMRR02","SOLL600819MMCRPS06","SAPG550312MMCNRRXX","FOGO780821HDFLLS02","DAHA641107HMCVRR04","GOGE521025HTLNRF04","MONY680629MDFNVL08","CUPJ900115HDFRDV09","ROMC740925HMCDRR02","CAIM570114MMCSSR01","PIOD691103MMCZRL08","BAMA710603MPLRRR06","RAOL730920MGRMRN08","VESM560119HMCLNR09","MAVS590421MMCRLL08","TOJL150212HMCRRNA4","MURL501006MDFXDT09","CAVA590119MMNRLM05","VEAV920828HDFLNC04","VAOG011110MDFZSTA5","RORL150916MDFDZHA9","RAHA190412HMCMRNA8","MARA890923HDFYDL04","RACC010131MMCMRRA3","GORO140204HMCNNSA4","RN0000135","CACV060121HMCSRCA9","FUNR190819MMCNRNXX","MARR190806MMCCMNXX","SASE060511HMCNNDXX","RERR801231MDFYDS04","AARD551117HDFLCV00","FOGO780821HDFLLS02","MEOG740523HDFRLR09","RAHA190412HMCMRNA8","GACJ040504MMCRRZXX","ROSJ910620HDFDLL08","SOAO900501HMCRNM08","DOLC000816MMCMPRA3","OORJ961002HMCRMR04","DOSM840807HMCRLG08","MARE960103MOCRYS04","SAPR580306MDFLCT01","LURA670302MDFNMD02","AXBS780427HNELRM08","DOSM840807HMCRLG08","OORJ961002HMCRMR04","LUXE420520HOCNXT00","RXBA900730MMCMNL07","DOLC000816MMCMPRA3","RAPJ030525MMCFRZA9","MEJA561023MHGLVS04","MELA751009HMCLPR09","GORO140204HMCNNSA4","CACV060121HMCSRCA9","GAGA181130HMCLSDA3","IUHZ951025MDFZRR06","VEBA501027HMCRRL08","RN0000064","TOME340717MMNRLF02","MECF880327HMCJNR04","MAML841230MMCRRS08","MARR190806MMCCMNXX","MAVS590421MMCRLL08","FAAE570831MMNRTS07","BAMA710603MPLRRR06","DESCONOCIDO 76","CALA360815HPLRPL04","PUSV840603MOCBLR08","BAMA710603MPLRRR06","AACS390909MDGVSV09","SOLL600819MMCRPS06","ZACS770409MMCRRN08","RAVM380719MOCMLG05","ROMC740925HMCDRR02","CALA360815HPLRPL04","NOGJ821204HMCRRS01","COAG791102HDFNNN00","MARR190806MMCCMNXX","HEFF611123MMCRLLXX","SARJ421015MDFNDS05","SAPR580306MDFLCT01","LERV140513MMCNBLA4","DESCONOCIDO 76","CUPJ900115HDFRDV09","VEAV920828HDFLNC04"] }, "base.tipoSolicitud": { $in: ['medicamento','mezcla','solucion'] } }, { "persona.id": 1, "persona.nombreCompleto": 1, "persona.nivelSocioeconomico": 1, "persona.clave": 1, "control.porCobrar": 1, "_date": 1, "base.tipoSolicitud": 1, "base.codigo": 1, "base.descripcion": 1, "control.solicitado": 1, "control.importe": 1})
// db.getCollection("solicitud").find({ "persona.clave": { $in: ["COAG791102HDFNNN00","ROMC740925HMCDRR02","LERV140513MMCNBLA4","LAGR190816HMCRRN","VIGA091107MMCLNBA7","SASG771212HMCNND05","AACS390909MDGVSV09"] }, "base.tipoSolicitud": { $in: ['medicamento','mezcla','solucion'] } }, { "persona.id": 1, "persona.nombreCompleto": 1, "persona.nivelSocioeconomico": 1, "persona.clave": 1, "control.porCobrar": 1, "_date": 1, "base.tipoSolicitud": 1, "base.codigo": 1, "base.descripcion": 1, "control.solicitado": 1, "control.importe": 1})
// consultas especiales
//db.getCollection("solicitud").find({'base.tipoSolicitud':'consultaExterna','base.fechaHoraCita':{$gte:'2019-08-27',$lt:'2019-08-28'}},{'base.prestadorServicios':1,'base._prestadorServicios': 1,'base.fechaHoraCita':1,'persona.id':1, 'persona.nombreCompleto':1,'persona.clave':1,'base.tipoSolicitud':1,'base.consultaExterna.base._procedimientoMultiple':1})
//db.getCollection("solicitud").find({},{'base.tipoSolicitud':1,'persona.id':1,'persona.clave':1,'persona.nivelSocioeconomico':1,'base.codigo':1,'base.precio':1})
//db.getCollection("solicitud").find({'base.tipoSolicitud':'consultaExterna'},{'base.precio':1,'base.consultaExterna.base.procedimientoMultiple.base.codigo':1,'base.consultaExterna.base.procedimientoMultiple.base.descripcion':1})
//db.getCollection("solicitud").find({'base.tipoSolicitud':'consultaExterna','control.porCobrar':{$gt:0}},{'_created._user':1,'base.precio':1,'base.consultaExterna.base.procedimientoMultiple.base.codigo':1,'base.consultaExterna.base.procedimientoMultiple.base.descripcion':1,'persona.nivelSocioeconomico':1,'persona._nivelSocioeconomico':1,'base.fechaHoraCita':1})
//db.getCollection("solicitud").find({'_parent.id':{$in:['5d70ad757dda41230c91b7d4','5d70bc011e6582788bca60e7','5d70bd79d6a5f34d78073762','5d70e13a2bcf77f2e9cfd2f1','5d70e68040afdc54fb2cce61','5d70e9b920d6a872aa1db0e3','5d70ad757dda41230c91b7d4','5d70f55808319f106548e274','5d70fb2cb77b3c2a0f1cf8b2','5d71008c4fbf52e5c13e9fba','5d70fe9523ebf6b4638b97c4','5d7104c104edde4a073e2753','5d710a9d1ae1fb24f8fbee33','5d710af71134f1fa6edd8077','5d70ad757dda41230c91b7d4','5d7121fb9b92e03f44fbd6b7','5d71288abf39841736f542bd','5d7143462d12595611219e1b']},'base.surtirDe':'ubicacionEspecifica','_updated.moment':'programado'})
//db.getCollection("solicitud").update({'_parent.id':{$in:['5d70ad757dda41230c91b7d4','5d70bc011e6582788bca60e7','5d70bd79d6a5f34d78073762','5d70e13a2bcf77f2e9cfd2f1','5d70e68040afdc54fb2cce61','5d70e9b920d6a872aa1db0e3','5d70ad757dda41230c91b7d4','5d70f55808319f106548e274','5d70fb2cb77b3c2a0f1cf8b2','5d71008c4fbf52e5c13e9fba','5d70fe9523ebf6b4638b97c4','5d7104c104edde4a073e2753','5d710a9d1ae1fb24f8fbee33','5d710af71134f1fa6edd8077','5d70ad757dda41230c91b7d4','5d7121fb9b92e03f44fbd6b7','5d71288abf39841736f542bd','5d7143462d12595611219e1b']},'base.surtirDe':'ubicacionEspecifica','_updated.moment':'programado'},{$set:{'base.surtirDe':'almacen','base.ubicacionEspecifica':null, 'base._ubicacionEspecifica':null}},{multi:true})
//db.getCollection("solicitud").update({'_parent.id':{$in:['5d70f07abf25d5269713832f','5d710cca287fe5e23c891169']},'base.surtirDe':'ubicacionEspecifica','_updated.moment':'programado'},{$set:{'base.surtirDe':'almacen','base.ubicacionEspecifica':null, 'base._ubicacionEspecifica':null}},{multi:true})
// para activar un track
//db.getCollection("persona").update({_id:{$in:[ObjectId("5d5b303d8295e111c6bee393"),ObjectId("5d5b30478295e111c6beeaa1")]}},{$set:{'contexto.rehabilitacionTerapiaOcupacional':{estaActivo:true}}},{multi:true})
//db.getCollection("persona").update({_id:{$in:[ObjectId("5d58ecfd4c74606d4c8fca91"),ObjectId("5d58ed567e59f06d7ee0a2d1")]}},{$set:{'contexto.urgencias':{estaActivo:true}}},{multi:true})
// usuarios
//{ "_id": 1, "_type": 1, "prestadorServicios.clave": 1, "base.rolAcademico": 1, "base._rolAcademico": 1, "base.estatus": 1, "base.servicio": 1, "base._servicio": 1, "base.area": 1, "base._area": 1, "base.nombre": 1, "base.matricula": 1, "base.genero": 1, "prestadorServicios.genero": 1, "prestadorServicios._genero": 1, "prestadorServicios.fechaNacimiento": 1, "prestadorServicios.nacionalidad": 1, "prestadorServicios._nacionalidad": 1, "prestadorServicios.especialidad": 1, "prestadorServicios._especialidad": 1, "prestadorServicios.datosEspecialidad": 1, "prestadorServicios._datosEspecialidad": 1}

// para cambiar lo de ceye que esta atorado en recoleccion
// db.getCollection("solicitud").update({'_updated.moment':'recoleccion','persona.nombreCompleto':'Ceye'}, {$set:{'_updated.moment':'programado','_updated._moment':'Programado'}},{multi:true})

// para cancelar farmacia anteriores
// db.getCollection("solicitud").update({ "base.servicio": "farmacia", "_date": { $lte: "2019-09-27" }, "_updated.moment": { $exists: false } },{$set:{'_updated.moment':'cancelando','_updated._moment':'Cancelando'}},{multi:true})
// db.getCollection("solicitud").update({ "base.servicio": "farmacia", "_date": { $lte: "2019-09-27" }, "_updated.moment": 'programado' },{$set:{'_updated.moment':'cancelando','_updated._moment':'Cancelando'}},{multi:true})

// reportes del git
// git --no-pager log > log.txt


// solicitudes ambulatorias
// db.getCollection("solicitud").find(
//   { $and: [ { "_date": { $gt: "2020-04-01" } }, { "base.tipoSolicitud": { $in: ["medicamento","solucion","mezcla","material"] } }, { "contexto.hospitalizacion.estaActivo": false }, { $or: [ { "contexto.urgencias.estaActivo": false }, { "contexto.urgencias.estaActivo": { $exists: false } } ] }, { "base.servicioOrigen": { $ne: "hospitalizacion" } }, { "base.servicioOrigen": { $ne: "urgencias" } } ] },
//   { "base.servicioOrigen": 1, "persona.id": 1, "persona.nombreCompleto": 1, "persona.clave": 1, "persona.fechaNacimiento": 1, "base.tipoSolicitud": 1, "base.codigo": 1, "_date": 1}
// )


//db.getCollection("_user").stats({})
// para ver tamaño y de un query
// Object.bsonsize(db.test.findOne({type:"auto"}))
// https://stackoverflow.com/questions/22008822/mongo-get-size-of-single-document
// db.getCollection("nota").aggregate([{$group : {_id : { _type: "$_type"  },count: { $sum: 1 }}}],{allowDiskUse:true})
// db.getCollection("mov").aggregate(
//    [
//      {
//        $group:
//          {
//            _id: {aux: '$aux', entidad: '$entidad', tipoUbicacion: '$tipoUbicacion', cuenta: '$cuenta', codigo: '$codigo', lote: '$lote', vencimiento: '$vencimiento'},
//            cantidadFactor: { $sum: "$cantidadFactor" },
//            importeFactor: { $sum: "$importeFactor" }  
//          }
//      }
//    ]
// )

// db.getCollection("mov").aggregate(
//    [
//      {"$match":{"nota.type":{$in:["notaPorReservar","notaPorRecolectar"]}, aux:'inv',solicitud:{$exists:true},cantidad:{$ne:0},cuenta:{$in: ['farmacia','almacenCuracion','almacenGeneral','almacenTemporal','bodegaAcanto']}}},
//      {
//        $group:
//          {
//            _id: {"aux":'$aux',"cuenta":'$cuenta',cantidad:"$cantidad",factor:"$factor","solicitud":'$solicitud'},
//            conteo: { $sum: 1 },
//          }
//      },
//      {"$match":{conteo:{$gt:1}}}
//    ]
// )

// cd /usr/share
// sudo mkdir collectd
// cd collectd/
// sudo touch types.db
// sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json -s
// sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status


// emulador zebra ZPL
// http://labelary.com/viewer.html

// exportar notas
//db.getCollection("nota").find({}, { "_id": 1, "_type": 1, "_name": 1, "_parent": 1, "persona.id": 1, "_created.date": 1, "_created.user": 1, "_created._user": 1, "_created.sid": 1, "_created.folio": 1, "_created.board": 1, "_created.service": 1, "_created._service": 1, "_created.request": 1, "_created._request": 1})

// instalar redis en AWS EC2
// sudo amazon-linux-extras install redis6 -y

// otra forma
// dnf install redis
// sudo systemctl start redis
// sudo systemctl enable redis

// instalar agente CloudWatch en EC2
// wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
// sudo rpm -U ./amazon-cloudwatch-agent.rpm
// sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

// ssh -i "dev-saludness.pem" ec2-user@etl.saludness.com
// lsblk
// sudo mount /dev/nvme1n1 /data2
// sudo mount /dev/nvme2n1 /data2
// sudo mount /dev/nvme3n1 /data2

// sudo mkfs -t xfs /dev/nvme1n1

// ssh -i "dev-saludness.pem" ec2-user@hraei-tunel.saludness.com
// ssh -i "dev-t2.pem" ec2-user@hraei-t1.saludness.com
// ssh -i "dev-t2.pem" ec2-user@t2.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@prod-a
// ssh -i "dev-saludness.pem" ec2-user@prod-b
// ssh -i "dev-saludness.pem" ec2-user@prod-c
// ssh -i "dev-saludness.pem" ec2-user@interfaces
// ssh -i "dev-saludness.pem" ec2-user@d1.saludness.com
// ssh -i "dev-zury.pem" ec2-user@pruebas-bi.saludness.com
// ssh -i "dev-saul.pem" ec2-user@efirma.saludness.com

// ssh -i "dev-saludness.pem" ec2-user@sic.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@sic-if.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@sgg.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@rh.saludness.com
// ssh -i "sic-master.pem" ec2-user@sic-master.enlanube.io
// ssh -i "dev-saludness.pem" ec2-user@cc.saludness.com

// ssh -i "dev-saludness.pem" ec2-user@hraei-rh.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@en.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@rm.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@rm2.saludness.com

// ssh -i "dev-saludness.pem" ec2-user@etl.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@demo.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@cs.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@1nivel.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@hraei-tunel.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@d1.saludness.com
// ssh -i "his-docker.pem" ec2-user@docker.saludness.com
// interfaces (que no mande en paralelo)
// ssh -i "dev-saludness.pem" ec2-user@hraei-prod-interfaces.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@prueba-node.enlanube.io
// ssh -i "dev-saludness.p/em" ec2-user@node16.enlanube.io
// ssh -i "dev-saludness.pem" ec2-user@basa.enlanube.io
// ssh -i "dev-saludness.pem" ec2-user@dev1.enlanube.io
// ssh -i "dev-saludness.pem" ec2-user@dev2.enlanube.io
// ssh -i "icarus-jha2.pem" ec2-user@dev3.enlanube.io
// ssh -i "icarus-jha2.pem" ec2-user@dev4.enlanube.io
// ssh -i "dev-saludness.pem" ec2-user@abc.saludness.com
// ssh -i "salo-saludness.pem" ec2-user@pruebas-app.saludness.com
// ssh -i "salo-saludness.pem" ec2-user@pruebas_app_api.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@hraei-tunel.saludness.com
// ssh -i "sic-master.pem" ec2-user@sic-master.enlanube.io

// ssh root@10.10.17.33
// ssh root@10.10.17.34

// IF
// ssh -i "sic-if.pem" ec2-user@ec2-54-159-40-68.compute-1.amazonaws.com
// mongodump --out "respaldo" -h "sic-if.saludness.com:31544" -u "admin" -p "55c60ab0-d48a-4016-97c7-b6ca56ee6ff3" -d "demo" --authenticationDatabase "admin"
// mongorestore  -h "sic-if.saludness.com:31544" -u "admin" -p "55c60ab0-d48a-4016-97c7-b6ca56ee6ff3" --authenticationDatabase "admin" ./respaldo
// mongodump --out "respaldo" -h "sic.saludness.com:31544" -u "admin" -p "55c60ab0-d48a-4016-97c7-b6ca56ee6ff3" -d "demo" --authenticationDatabase "admin"
// mongorestore  -h "sic.saludness.com:31544" -u "admin" -p "55c60ab0-d48a-4016-97c7-b6ca56ee6ff3" --authenticationDatabase "admin" ./respaldo

// mongodump --out "respaldo" -h "sic-if.saludness.com:31544" -u "admin" -p "55c60ab0-d48a-4016-97c7-b6ca56ee6ff3" -d "demo" --authenticationDatabase "admin"
// mongorestore  -h "sic-if.saludness.com:31544" -u "admin" -p "55c60ab0-d48a-4016-97c7-b6ca56ee6ff3" --authenticationDatabase "admin" ./respaldo

// para aumentar el timeout en el systemctl start mongod
// https://unix.stackexchange.com/questions/227017/how-to-change-systemd-service-timeout-value

// Pruebas

// ssh -i "jheffes2.pem" ec2-user@hma.enlanube.io
// ssh -i "jheffes2.pem" ec2-user@moy.enlanube.io
// subnet: f9dc5f9e (al crear nuevas instancias)
//wasabiHost = 't4.saludness.com';

// produccion https://hraei.saludness.com/

//wasabiHost = '10.10.17.33'; //prod-cs

// wasabiHost = 'hraei-t1.saludness.com';
// wasabiHost = 't2.saludness.com';
// wasabiHost = 'grp.enlanube.io';
// wasabiHost = 'cs.saludness.com';
// wasabiHost = 'hep.saludness.com';
// wasabiHost = 't1-hep.saludness.com';
// wasabiHost = 't1-cs.saludness.com';

//wasabiHost = '1nivel.saludness.com';
//wasabiHost = 'sic.saludness.com';
//wasabiHost = 'sic-if.saludness.com';
//wasabiHost = 'cc.saludness.com';
//wasabiHost = 'rh.saludness.com';
//wasabiHost = 'hraei-rh.saludness.com';
//wasabiHost = 'rm.saludness.com';
//wasabiHost = 'rm2.saludness.com';
//wasabiHost = 'etl.saludness.com';
//wasabiHost = 'demo.saludness.com';
//wasabiHost = 'abc.saludness.com';

// ssh -i "jheffes2.pem" ec2-user@demo5.enlanube.io

// ssh -i "dev-saludness.pem" ec2-user@cs.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@hep.saludness.com
// ssh -i "dev-saludness.pem" ec2-user@hraei-tunel.saludness.com
// ssh -i "dev-t2.pem" ec2-user@hraei-t1.saludness.com
// ssh -i "dev-t2.pem" ec2-user@grp.enlanube.io
// ssh -i "dev-t2.pem" ec2-user@t2.saludness.com
// ssh -i "dev-t2.pem" ec2-user@t4.saludness.com
// ssh -i "dev-t2.pem" ec2-user@t5-nom.saludness.com
// ssh -i "dev-t2.pem" ec2-user@t1-hep.saludness.com
// ssh -i "dev-t2.pem" ec2-user@t1-cs.saludness.com
// ssh -i "dev-t2.pem" ec2-user@n1.saludness.com
// ssh -i "dev-t2.pem" ec2-user@n2.saludness.com
// ssh -i "dev-t2.pem" ec2-user@n3.saludness.com
// ssh -i "dev-t2.pem" ec2-user@telmex.saludness.com

// ssh root@hraei-prod-a 
// ssh root@hraei-prod-b
// ssh root@hraei-interfaces

// produccion HRAEI on Premise, hay que borrar redis manualmente en todos los servidores
// wasabiHost = '10.10.17.33';   

// fortiClient / fortiNet 
// SALUDNESS
// S0p0rt3VPN$hr431#23*
// jheffes@gmail.com
// password: Cware!2021

// sudo nano /etc/mongod.conf 
// sudo service mongod restart

// ssh root@cs-prod-a 
// ssh root@cs-etl 
// ssh root@cs-redis
// $@1ud.2023ness

// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@cs-prod-a
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@cs-prod-b
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@cs-interfaces
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@cs-etl
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@cs-redis
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@cs-mongo


// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@hep-prod-a
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@hep-prod-b
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@hep-interfaces
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@hep-etl
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@hep-mongo
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@hep-redis1
// ssh-copy-id -i ~/.ssh/id_ed25519.pub root@hep-redis2


var esHost = 'http://demo5.enlanube.io:3000/es'

// HRAEI
var logo = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/hraei2.png';
var imageWidth = 210;
var logoSaludNess = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/saludNess.png';
var logo2 = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/salud2.png';
var logo3 = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/hraei3b.png';
var headers = ['Hospital Regional de Alta Especialidad Ixtapaluca','Carretera Federal México Puebla Km. 34.5','Pueblo de Zoquiapan 56530, Ixtapaluca, Méx.','Teléfono: (55) 5972 9800, CLUES: MCSSA018786']
params = '&esHRAEI=true&esHIS=true&n3=true';
subProyects = 'mx,his,hraei,n3';

// CRAE (necesita wasabi-cfg.multi=true)
// var logo = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/crae.png';
// var imageWidth = 180;
// var logoSaludNess = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/saludNess.png';
// var logo2 = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/salud2.png';
// var logo3 = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/crae3b.png';
// var headers = ['Centro Regional de Alta Especialidad','Chiapas, México']
// params = '&esCRAE=true&esHIS=true&n3=true&esMulti=true&esCentral=true';
// subProyects = 'mx,his,crae,n3,multi,central';

// Telmex (necesita wasabi-cfg.multi=true)
// var logo = 'https://his-imagenes.s3.amazonaws.com/logos/telmex.png';
// var imageWidth = 70;
// var logoSaludNess = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/saludNess.png';
// var logo2 = 'https://his-imagenes.s3.amazonaws.com/logos/telmex.png';
// var logo3 = 'https://his-imagenes.s3.amazonaws.com/logos/telmex.png';
// var headers = ['Av. Parque Vía 198','Cuauhtémoc 06500','CDMX, México']
// params = '&esHIS=true&n3=true&esMulti=true&esCentral=true&esTelmex=true';
// subProyects = 'mx,his,n3,multi,central,telmex';

// ABC
// var logo = 'https://his-imagenes.s3.amazonaws.com/logos/abc.png';
// var imageWidth = 50;
// var logoSaludNess = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/saludNess.png';
// var logo2 = 'https://his-imagenes.s3.amazonaws.com/logos/abc.png';
// var logo3 = 'https://his-imagenes.s3.amazonaws.com/logos/abc.png';
// var headers = ['Centro Médico ABC','Sur 136 116, Las Américas','Álvaro Obregón, 01120 Ciudad de México, CDMX','Teléfono: 55 5230 8000']
// params ='&esHIS=true&n3=true&esPrivado=true&esABC=true';
// subProyects ='mx,his,n3,privado,abc';

// RH
// params = '&esHRAEI=true&esRH=true&esMX=true';
// proyectId = 'his';
// esIndex = 'hds';
// subProyects = 'sic,rh,mx,hraei';

// GRP (requiere RH)
// params+='&esGRP=true';  //,tieneConexionPaaas    para que pida la solicitud y cuando afecta el inventario 
// subProyects+=',mga,grp';  

// SESEQ
// logo = 'https://his-imagenes.s3.amazonaws.com/logos/seseq.png';
// logo3 = 'https://his-imagenes.s3.amazonaws.com/logos/seseq.png';
// headers = ['Secretaria de Salud Querétaro SESEQ','16 de Septiembre 51, Col. Centro','CP 76000, Querétaro, Qro.','Teléfono: (442) 251 9000']
// params = '&esHIS=true&esSESEQ=true&n1=true';
// subProyects = 'mx,his,hraei,seseq,n1';

// lang = 'en';
// useDisplay2 = true;

// RM
// var logo = 'https://his-imagenes.s3.amazonaws.com/logos/reina-madre.png';
// var imageWidth = 100;
// var logoSaludNess = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/saludNess.png';
// var logo2 = 'https://his-imagenes.s3.amazonaws.com/logos/maria-linda.png';
// var logo3 = 'https://his-imagenes.s3.amazonaws.com/logos/reina-madre.png';
// var headers = ['Reina Madre', 'Clínicas de la Mujer','Avenida Paseo Tollocan 402, Residencial Colón','50120 Toluca de Lerdo, Méx.','Teléfono: (722) 280 2002']
// params = '&esRM=true&esPrivado=true&esMX=true';
// proyectId = 'his';
// esIndex = 'hds';
// subProyects = 'his,hraei,mx,privado';


proyectId = 'his';
esIndex = 'his4';
if (wasabiHost=='hraei-t1.saludness.com'){
  logo = logoSaludNess;
  logo3 = logoSaludNess;
  headers = [];
  //params+='&esDemo=true';
  imageWidth = 50;
}
if (wasabiHost=='demo.saludness.com'/*||wasabiHost=='demo.enlanube.io'*/){
  logo = logoSaludNess;
  logo3 = logoSaludNess;
  headers = [];
  //params+='&esDemo=true';
  imageWidth = 50;
}

// HDS / SIC
// var logo = 'https://his-imagenes.s3.amazonaws.com/logos/csso.png';
// var imageWidth = 90;
// var logoSaludNess = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/saludNess.png';
// var logo2 = 'https://his-imagenes.s3.amazonaws.com/logos/salud-chile.png';
// var logo3 = 'https://his-imagenes.s3.amazonaws.com/logos/HDS2.png';
// var headers = ['Hospital del Salvador e Instituto Nacional de Geriatría','Av. Salvador 364, Providencia','Región Metropolitana','Chile']
// proyectId = 'his';
// esIndex = 'hds';
// clave = 'RUT';
// params = '&esSIC=true&tieneServicios=true';
// subProyects = 'sic,cl,servicios';


var filename = proyectId+'-metadata.xlsx';

if (filename&&filename.substr(-1)=='.'){
  filename+='xlsx'
}
// elasticsearch

var forceList = [];
var ignoreList = [];
var useMD5 = wasabiHost!='demo.enlanube.io';

// para que no indexe si esta en demo;
if (wasabiHost=='demo.enlanube.io'){
  esIndex = null; 
}

var getFileExt = function(filename){
  return filename && filename.split('.').pop();
}

var renameFileExt = function(fileName, newExt){
  if (fileName && newExt){
    return fileName.substr(0, fileName.lastIndexOf('.')) + '.'+newExt;
  }
}

var getFileName = function(filename){
  return filename && filename.replace(/^.*[\\\/]/, '');
}

// var getConfig = function(filename){
//   var out = {};
//   var buf = fs.readFileSync(filename);
//   var wb = XLSX.read(buf, {type:'buffer'});
//   var sheets = wb.SheetNames;    
//   _.each(sheets, function(sheet){
//     out[sheet] = Utils.trimKeys(XLSX.utils.sheet_to_json(wb.Sheets[sheet], {raw: true, defval:null}))
//   })
//   var old = '';
//   var newFile = replaceExt(filename, '.cfg');
//   if (fs.existsSync(newFile)){
//     old = fs.readFileSync(newFile, 'utf8');
//   }
//   var data = JSON.stringify(out);
//   if (MD5(old)!==MD5(data)){
//     fs.writeFileSync(newFile, data);
//     console.log("upload config...", newFile);
//     return data;
//   }
// }


var makeOne = function(path, filename, options, callback){
  options = options || {};
  if (path.substr(0,5)==='auto/'){
    path = 'auto';
  } else if (path.substr(0,6)==='merge/'){
    path = 'merge';
  }
  var name = getFileName(filename);
  if (name.indexOf('.')>0 && name.substr(0,2)!=='~$'){
    var ext = getFileExt(filename);
    var data;
    if (ext==='hbs'||ext==='auto'){
      if (fs.existsSync(filename)){
        data = fs.readFileSync(filename);
      }      
    } else
    // if (path==='config'){
    //   if (ext==='xlsx'){
    //     data = getConfig(filename);  
    //     if (data){
    //       filename = replaceExt(filename, '.cfg');
    //       forceList.push(filename);
    //     }
    //   }      
    // } else
    // if (path==='tpl'){
    //   data = fs.readFileSync(filename);
    // } else
    if (path&&ext==='bpmn'){
      data = fs.readFileSync(filename);
    } else
    if (path&&(ext==='xls'||ext==='xlsx')){
      // data = decisionTable.xls_to_csv(filename)[0];
      // filename = renameFileExt(filename, 'dmn');
    }
    if (data){
      if (path==='auto'||path==='merge'/*||path==='config'*/){
        name = getFileName(filename);
        if (ignoreList.indexOf(name.split('.')[0])<0){
          name = path+'/'+name;  
        } else name = '';
      } else {
        name = getFileName(filename);
        if (ext==='hbs'){
          ignoreList.push(name.split('.')[0]);
        }
        // si es un hbs simpre hay que forzarlo
      }
      if (name){
        var url = '/hbs/make/demo?filename='+name+params+'&path='+path+'&host='+wasabiHost+'&force='+(forceList.indexOf(name)>=0);
        if (makeToken){
          url+='&makeToken='+makeToken;
        }
        if (options.bulk){
          callback(null, {url, data});
        } else {
          let host = wasabiHost=='demo.enlanube.io'?'localhost':wasabiHost;
          var req = https.request({ 
            host: wasabiHost, 
            port: 443,
            path: url,
            method: 'POST',
            timeout: 360000,
          }, function(res){
            if (path==='auto' && res.statusCode==200){
              var hbsName = 'merge/'+name.slice(5).split('.')[0]+'.hbs';
              forceList.push(hbsName);
              // console.log(forceList)
            }
            if (res.statusCode!=201){
              console.log('make...', res.statusCode, filename)  
            }        
            callback(res.statusCode);
          }).on('error', function(err){
            err && console.error('request', err);
          });
          req.write(data);
          req.end();          
        }
      } else callback();
    } else callback();
  } else callback();
}

var doRestart = function(callback){
  var req = https.request({ 
    host: wasabiHost, 
    port: 443,
    path: '/hbs/restart?makeToken='+makeToken,
    method: 'GET',
    timeout: 360000,
  }, function(err){
    callback(err);
  });
  req.end();
}

var doEnd = function(callback){
  var req = https.request({ 
    host: wasabiHost, 
    port: 443,
    path: '/hbs/end?makeToken='+makeToken,
    method: 'GET',
  }, function(err){
    callback(err);
  });
  req.end();
}

// var makePath = function(path, callback){
//   var restart;
//   var bulk = false;
//   var items = [];
//   fs.readdir('./'+path, function(err, files){
//     // creo que no tiene que ir en serie en este punto
//     // async.eachSeries(files, function(file, callback) {

//     var fn = (wasabiHost==='demo.enlanube.io')?'eachSeries':'each';
//     //fn = 'eachSeries';
//     //console.log(fn, path+'...')
//     async[fn](files, function(file, callback) {
//       if (path){
//         file = path+'/'+file;
//       }
//       fs.stat(file, function(err, stat) {
//         if (stat && stat.isDirectory()){ //&& path.substr(0,3)==='hbs'){
//           makePath(file, function(err, res) {
//             callback();
//           })
//         } else {
//           // console.log(file)
//           makeOne(path, file, {bulk}, function(statusCode, item){
//             if (statusCode==202){
//               restart = true;
//             } else 
//             if (bulk&&item){
//               items.push(item)
//             }
//             callback();
//           })          
//         }
//       })
//     }, function(err){
//       if (bulk){
//         console.log('items..', path, items.length);  
//       }      
//       callback(restart);
//     })
//   })
// }

var makePath = function(path, options, callback){
  var restart;
  var bulk = false;
  var items = [];
  recursive(path, function (err, files) {
    console.log(path+'...',files&&files.length)
    var chunks = _.chunk(files, 100);
    // creo que no tiene que ir en serie en este punto
    // async.eachSeries(files, function(file, callback) {
    async.each(chunks, function(chunk, callback){
      //console.log('chunk...', chunk&&chunk.length)
      var fn = (wasabiHost==='demo.enlanube.io')?'eachSeries':'each';
      async[fn](chunk, function(file, callback) {
        //console.log(file)
        options.bulk = bulk;
        makeOne(path, file, options, function(statusCode, item){
          if (statusCode==202){
            restart = true;
          } else 
          if (bulk&&item){
            items.push(item)
          }
          callback();
        })          
      }, function(err){
        if (bulk){
          console.log('items..', path, items.length);  
        }      
        callback(restart);
      })      
    }, function(err){
      callback(err);
    })
  })
}


var genAuto = function(proyectId, callback){
  // callback();
  if (proyectId){
    var paso1 = moment();
    var buf = fs.readFileSync(filename);
    console.log('start...', moment().diff(paso1)/1000+'s')
    var wb = XLSX.read(buf, {type:'buffer'});
    console.log('read...', moment().diff(paso1)/1000+'s')
    codeSystem.generate(wasabiHost, wb, proyectId, filename, subProyects, esHost+'/'+esIndex, {useMD5, notIndex:!esIndex, useDisplay2}, function(err, codeSystem){
      console.log('codeSystem...', moment().diff(paso1)/1000+'s')
      docSystem.generate(wasabiHost, wb, proyectId, filename, subProyects, logo3, headers, codeSystem, {imageWidth, logoSaludNess, useMD5, clave, useDisplay2}, function(err){
        console.log('hbs generated...', moment().diff(paso1)/1000+'s')
        //console.log(proyectId+'.es generated...')
        callback(null, codeSystem);
      })
    })
  } else callback();
}

console.log('host', wasabiHost)
  var start = moment();
// if (filename){
//   makeOne('auto', 'auto/auto_'+filename, null, function(){
//     makeOne('', filename, null, function(){
//       // restart();
//     })
//   })
// } else {
    // process.exit();

// makeSql.make('sql', proyectId, 'install/'+proyectId+'-01-base.sql', function(){
//   makeCfg.make('rules', proyectId, 'install/'+proyectId+'-02-rules.sql', function(){
//     makeCfg.make('config', proyectId, 'install/'+proyectId+'-03-cfg.sql', function(){  
      genAuto(proyectId, function(err, codeSystem){
        makePath('hbs', {lang}, function(){
          console.log('make hbs...', moment().diff(start)/1000+'s')
          makePath('auto', {lang}, function(){      
            console.log('make auto...', moment().diff(start)/1000+'s')
            makePath('bpmn', {lang}, function(){
              //makePath('tpl', {lang}, function(){
              // makePath('dmn', function(restart){
                makePath('merge', {lang}, function(){
                  doEnd(function(err){
                    console.log('end...', moment().diff(start)/1000+'s')
                    return process.exit();
                  });
                  // if (restart){
                  //   console.log('restart in 1/2 second...')
                  //   setTimeout(function(){doRestart();}, 150);
                  // }
                });
              // });
              //})
            });
          });
        });
      });
//     });
//   })  
// })


