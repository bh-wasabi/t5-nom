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

var esHost = 'http://demo5.enlanube.io:3000/es'

// HRAEI
var imageWidth = 60;
var logoSaludNess = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/saludNess.png';
var logo3 = 'https://his-imagenes.s3-accelerate.amazonaws.com/logos/saludNess.png';
subProyects = 'mx,his,hraei,n3,multi';
var headers = ['Hospital Regional de Alta Especialidad Ixtapaluca','Carretera Federal México Puebla Km. 34.5','Pueblo de Zoquiapan 56530, Ixtapaluca, Méx.','Teléfono: (55) 5972 9800, CLUES: MCSSA018786']
params = '&esHRAEI=true&esHIS=true&n3=true&esMulti=true';

// MCSMP014640
// var headers = ['SERVICIOS ESPECIALIZADOS EN NEFROLOGÍA TOLUCA, S.C.','San Juan 201','Plazas de San Buenaventura, C.P. 50110, Toluca, México','Teléfono: (722) 917 4809, CLUES: MCSMP014640']
// params = '&esHRAEI=true&esHIS=true&n3=true&MCSMP014640=true&esMulti=true';

// MCSSA018354
// var headers = ['MATERNIDAD ATLACOMULCO','Av. Mario Colin Sanchez S/N','Col. La Mora. C.P. 50450, Atlacomulco, México','Teléfono: (712) 195 5563, CLUES: MCSSA018354']
// params = '&esHRAEI=true&esHIS=true&n3=true&MCSSA018354=true&esMulti=true';

// CLSSA000815
// var headers = ['HOSPITAL INTEGRAL PARRAS DE LA FUENTE','16 de Septiembre','Fraccionamiento Estrella, C.P. 27980, Parras de la Fuente, Coahuila','Teléfono: (842) 422 0151, CLUES: CLSSA000815']
// params = '&esHRAEI=true&esHIS=true&n3=true&CLSSA000815=true&esMulti=true';

// DFSSA004072
// var headers = ['INSTITUTO NACIONAL DE PSIQUIATRÍA RAMÓN DE LA FUENTE MUÑÍZ','Calz. México-Xochimilco 101','Col. Huipulco, C.P. 14370, Tlalpan, Ciudad de México, CDMX','Teléfono: (55) 4160 5000, CLUES: DFSSA004072']
// params = '&esHRAEI=true&esHIS=true&n3=true&DFSSA004072=true&esMulti=true';

// DFSSA005146
// var headers = ['SERVICIO AMIGABLE ITINERANTE EDUSEX', 'CLUES: DFSSA005146']
// params = '&esHRAEI=true&esHIS=true&n3=true&DFSSA005146=true&esMulti=true';

proyectId = 't5-nom';
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


