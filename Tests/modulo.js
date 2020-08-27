postman.setEnvironmentVariable("utils", () => {
    //todo la codificacion se encasula aqui


    //Obtiene el json de respuesta de la ejecución
    if (responseBody != "") {
        responseData = JSON.parse(responseBody);
    }
    //Obtiene el json de respuesta del archivo
    if (pm.variables.get("jsonTest") != "") {
        csvResponseBody = JSON.parse(pm.variables.get("jsonTest"));
    }
    //Obtiene el array con las propiedades que se verificarán
    propertyList = (pm.variables.get("propertyList")).split(",");

    pathlevel = pm.variables.get("pathlevel");
    pathLevelIndexByProperties = pm.variables.get("pathLevelIndexByProperties");

    index = pm.variables.get("index");
    //contador
    try {
        var csvRespondeLength = Object.keys(getValueJSON(pathlevel, csvResponseBody)).length;

    } catch (e) { console.log("Contador csvRespondeLength Null") }

    /******************************
            Funciones
     *****************************/

    function getValueJSON(nameKey, objRef) {

        var arrKeys = nameKey.split('.');
        var objValue = { ...objRef };
        var propName = '';
        var propArrIndex = 0;

        for (i = 0; i < arrKeys.length; i++) {

            propName = arrKeys[i];

            if (propName.indexOf('[') > -1) {

                propArrIndex = propName.match(/\[([^)]+)\]/)[1];
                propName = propName.substring(0, propName.indexOf('['));
                objValue = objValue[propName][propArrIndex];

            }

            else {

                objValue = objValue[propName];

            }

        }

        return objValue;

    }

    //Verifica qué función se debe ejecutar para verificar la información 
    function selectFunctByIndex() {
        switch (index) {
            case 'byProperties':
                return validateByProperties();

            case 'byIndex':
                return validateByIndex();

            case 'indexByProperties':
                return validateIndexByProperties();

            case 'indexByPropertiesByIndex':
                return validateIndexByPropertiesByIndex();

            default:
                pm.collectionVariables.set("reporte", false);
                return "Opcion no definida verifique los datos"
        }
    }

    //Función para verificar la data en los niveles que No son arrays
    function validateByProperties() {
        console.log("validateByProperties")
        var point = ''
        for (propierty in propertyList) {
            //variables para recorrer la respuesta del request y la respuesta del csv
            if (pathlevel != '') { point = "." }
            responBody = getValueJSON(pathlevel + point + propertyList[propierty], responseData);
            responCsvBody = getValueJSON(pathlevel + point + propertyList[propierty], csvResponseBody);

            if (responBody == undefined) { pm.collectionVariables.set("reporte", false); return "***ERROR***La informacion no fue encontrada por favor verifique***ERROR***" }

            if (responBody != responCsvBody) {
                report = ("el valor no coincide: " + propertyList[propierty] + " Valor response: " + responBody + " valor csv: " + responCsvBody);
                pm.collectionVariables.set("reporte", false);
                return report;
            }
            else {
                pm.collectionVariables.set("reporte", true);
            }
        }
        return ("es correcta");
    }

    function validateByIndex() {
        console.log("validateByIndex")
        var point = ''
        var i = 0;

        do {
            for (propierty in propertyList) {
                if (pathlevel != '') { point = "." }
                //variables para recorrer la respuesta del request y la respuesta del csv
                responBody = getValueJSON(pathlevel + "[" + i + "]" + point + propertyList[propierty], responseData);
                responCsvBody = getValueJSON(pathlevel + "[" + i + "]" + point + propertyList[propierty], csvResponseBody);

                if (responBody == undefined) { pm.collectionVariables.set("reporte", false); return "***ERROR***La informacion no fue encontrada por favor verifique***ERROR***" }

                if (responBody != responCsvBody) {
                    //esta opcion esta modificada para nomina se le agrego la impresion del empleado
                    report = ("el valor no coincide: " + propertyList[propierty] + " Valor response: " + responBody + " valor csv: " + responCsvBody + " El empleado con el error es :" + getValueJSON(pathlevel + "[" + i + "].fullName", csvResponseBody));
                    pm.collectionVariables.set("reporte", false);
                    return report;
                }
                else {
                    pm.collectionVariables.set("reporte", true);
                }
            }
            i++;
        } while (i < csvRespondeLength)
        return ("es correcta");
    }

    function validateIndexByProperties() {
        console.log("validateIndexByProperties")

        var i = 0;

        do {
            for (propierty in propertyList) {

                //variables para recorrer la respuesta del request y la respuesta del csv
                responBody = getValueJSON(pathlevel + "[" + i + "]." + pathLevelIndexByProperties + "." + propertyList[propierty], responseData);
                responCsvBody = getValueJSON(pathlevel + "[" + i + "]." + pathLevelIndexByProperties + "." + propertyList[propierty], csvResponseBody);

                if (responBody == undefined) { pm.collectionVariables.set("reporte", false); return "***ERROR***La informacion no fue encontrada por favor verifique***ERROR***" }

                if (responBody != responCsvBody) {
                    report = ("el valor no coincide: " + propertyList[propierty] + " Valor response: " + responBody + " valor csv: " + responCsvBody);
                    pm.collectionVariables.set("reporte", false);
                    return report;
                }
                else {
                    pm.collectionVariables.set("reporte", true);
                }
            }
            i++;
        } while (i < csvRespondeLength)
        return ("es correcta");
    }

    function validateIndexByPropertiesByIndex() {
        console.log("validateIndexByPropertiesByIndex")

        var i = 0;

        do {
            try {
                var csvRespondeLengthTwo = Object.keys(getValueJSON(pathlevel + "[" + i + "]." + pathLevelIndexByProperties, csvResponseBody)).length;
            } catch (e) {
                console.log("Contador csvRespondeLengthTwo Null");
                pm.collectionVariables.set("reporte", false);
                return "***ERROR***La informacion no fue encontrada por favor verifique***ERROR***"
            }

            for (var j = 0; j < csvRespondeLengthTwo; j++) {

                for (propierty in propertyList) {
                    //variables para recorrer la respuesta del request y la respuesta del csv
                    responBody = getValueJSON(pathlevel + "[" + i + "]." + pathLevelIndexByProperties + "[" + j + "]." + propertyList[propierty], responseData);
                    responCsvBody = getValueJSON(pathlevel + "[" + i + "]." + pathLevelIndexByProperties + "[" + j + "]." + propertyList[propierty], csvResponseBody);

                    if (responBody == undefined) { pm.collectionVariables.set("reporte", false); return "***ERROR***La informacion no fue encontrada por favor verifique***ERROR***" };

                    if (responBody != responCsvBody) {
                        report = ("el valor no coincide: " + propertyList[propierty] + " Valor response: " + responBody + " valor csv: " + responCsvBody + " El empleado con el error es :" + getValueJSON(pathlevel + "[" + i + "].fullName", csvResponseBody));
                        pm.collectionVariables.set("reporte", false);
                        return report;
                    }
                    else {
                        pm.collectionVariables.set("reporte", true);
                    }
                }

            }
            i++;
        } while (i < csvRespondeLength)
        return ("es correcta");
    }



    return {
        selectFunctByIndex
    };

});



