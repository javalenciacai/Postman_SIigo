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