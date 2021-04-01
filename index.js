#!/usr/bin/env node

const chalk = require("chalk");
const boxen = require("boxen");
const yargs = require("yargs");

const fs = require('fs');
const path = require('path');
const { types } = require("util");

const options = yargs
 .usage("Usage: -m <model> -f <fields>")
 .option("m", { alias: "model", describe: "Data model name", type: "string", demandOption: true })
 .option("f", { alias: "fields", describe: "Data model feild set. Eg: name, age(number), - isHuman(boolean)|true, ...", type: "string", demandOption: true })
 .argv;

const greeting = chalk.white.bold("Welcome to REST api generator for node-express-boilerplate!");
const boxenOptions = {
    padding: 1,
    margin: 0,
    borderStyle: "round",
    borderColor: "red",
    backgroundColor: "#555555"
};
const msgBox = boxen( greeting, boxenOptions );

console.log(msgBox);

const model = options.model;
const Model = model.charAt(0).toUpperCase() + model.substr(1);

const fields = options.fields;
let fieldSet = {};
let validationTypes = {};
let testFakers = {};


console.log(chalk.yellow("Remember to run ") + chalk.red.bold("yarn lint:fix") + chalk.yellow(" to fix unwanted commas and spaces"));


// Creating data model fields
fields.split(",").forEach((field) => {
    let _type = "String";
    let required = "true";
    let trim = "true";
    let _default = false;

    field = field.trim();
    if (field.charAt(0) == "-"){
        required = false;
        field = field.substr(1).trim(); // removing "-"
    }

    const hasDefault = field.indexOf("|");
    if (hasDefault > -1){
        _default = "'" + field.substr(hasDefault+1) + "'";
        field = field.substr(0, hasDefault).trim();   // removing default value
    }

    const hasDataType = field.indexOf("(");
    if (hasDataType > -1){
        const hasDataTypeEnd = field.indexOf(")");
        _type = field.substr(hasDataType+1, hasDataTypeEnd-(hasDataType+1));
        field = field.substr(0, hasDataType).trim();  // removing data type
    }

    fieldSet[field] = {
        type : _type,
        required : required,
        trim : trim,
    };

    let _xtype = _type.toLowerCase();
    if (_xtype == "double"){
        _xtype = 'number'
    }
    validationTypes[field] = `Joi.${_xtype}()`

    switch (_type.toLowerCase()) {
        case "number":
        case "double":
            testFakers[field] = "faker.random.number()"
            break;

        case "string":
        default:
            testFakers[field] = "faker.random.word()"
            break;
    }

    if (_default !== false){
        fieldSet[field].default = _default;
    }

});

/* Create the data model */
createFromTemplate("model", function (body) {
    return body.replace(/{{FIELDS}}/g, objToString(fieldSet).toString());
});

/* Create the controller */
createFromTemplate("controller");

/* Create the route */
createFromTemplate("route");

/* Create the service */
createFromTemplate("service");

/* Create the validations */
createFromTemplate("validation", function (body) {
    return body.replace(/{{TYPES}}/g, objToString(validationTypes).toString());
});


/* Create tests */
createFromTemplate("fixture", function (body) {
    return body.replace(/{{DATA}}/g, objToString(testFakers).toString());
});
createFromTemplate("integration", function (body) {
    return body.replace(/{{DATA}}/g, objToString(testFakers).toString());
});
createFromTemplate("unit", function (body) {
    return body.replace(/{{DATA}}/g, objToString(testFakers).toString());
});

/**
 * 
 * @param {String} type - Template type
 * @param {Function} replacer - Replace extra body text
 */
function createFromTemplate(type, replacer){
    let from = `/template/${type}s/temp.${type}.jst`
    let to = `src/${type}s/${model}.${type}.js`;
    let index = `src/${type}s/index.js`;

    switch (type){
        case 'route':
            to = `src/${type}s/v1/${model}.${type}.js`;
            index = `src/${type}s/v1/index.js`;
            break;
        case 'fixture':
            from = `/template/tests/${type}s/temp.${type}.jst`
            to = `tests/${type}s/${model}.${type}.js`;
            index = false;
            break;
        case 'integration':
            from = `/template/tests/${type}/temp.test.jst`
            to = `tests/${type}/${model}.test.js`;
            index = false;
            break;
        case 'unit':
            from = `/template/tests/${type}/models/temp.model.test.jst`
            to = `tests/${type}/models/${model}.model.test.js`;
            index = false;
            break;
    }

    console.log(`Generating - ${model} ${type} `);

    from = path.dirname(fs.realpathSync(__filename)) + from;

    fs.readFile(from, 'utf8', (err, data) => {
        if (err) {
          console.error(err)
          return
        }
    
        let body = data.replace(/{{temp}}/g, model);
        body = body.replace(/{{Temp}}/g, Model);

        if (replacer !== undefined) body = replacer(body);

        // Create path if not exist
        if (!fs.existsSync(path.dirname(to))) fs.mkdirSync(path.dirname(to), {recursive: true});

        // Write js file
        fs.writeFile(to, body, err => {
            if (err) {
                console.error(err);
                return
            }
            //file written successfully
            console.log(chalk.green(`Generated - ${to}`));
        });

        // Update index file
        if (index !== false){
            fs.readFile(index, (err, data) => {
                if (err) {
                    console.log(chalk.yellow(index + ' does not exist or cannot read at the moment. Skip updating this file'));
                    return;
                }

                if (type !== 'route'){
                    let str = `module.exports.${model}${type.charAt(0).toUpperCase() + type.substr(1) } = require('./${model}.${type}');`;
                    if (data.indexOf(str) == -1){
                        fs.appendFile(index, str + "\n", err => {
                            if (err) {
                                console.error(err);
                                return
                            }
                            //file written successfully
                        });
                    }
                } else {
                    console.log(`
                        *** Please add the following code in to array in routes/v1/index.js file.

                        const ${model}Route = require('./${model}.route');

                        ...

                        defaultRoutes = [
                            ...
                            {
                                path: '/${model}',
                                route: ${model}Route,
                            }
                        ]

                    `);
                    /* js.defaultRoutes.push(eval(``)); */
                }
            });
        }
    
    });
}


function objToString (obj, level = 0) {
    var tabs = '\t';
    for (let i = 0; i < level; i++) {
        tabs += '\t';
    }
    var str = '{\n';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            if (typeof obj[p] === 'object'){
                obj[p] = objToString(obj[p], level+1);
            }
            str += tabs + '\t' + p + ': ' + obj[p] + ',\n';
        }
    }
    return str + tabs + "}";
}