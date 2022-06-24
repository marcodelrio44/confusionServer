const express= require ('express');
const cors= require('cors');

const whitelist= = ['http://localhost:3000','https://localhost:3443'];

var corsOptionsDelegate = (req,callback) => {
    var corsOptions={};
    corsOptions.origin=whitelist.indexOf(req.header('Origin')) !==-1;
    callback(null,corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);