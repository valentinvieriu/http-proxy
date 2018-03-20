
define('ds2-need-analyzer-algorithm-extended', [], function(){

    var instance = null;

    /* sort cars within a modelrange by their score */
    function sortModelRanges(modelRanges) {
        var keys = Object.keys(modelRanges);
        for (var i = 0; i < keys.length; ++i) {
            if (modelRanges[keys[i]].length) {
                modelRanges[keys[i]].sort(compare).reverse;
            }
        }
    }

    /*
     generate a result set
     */
    function reduceModelRanges(sampleSize, modelRanges) {

        var results = [];
        var keys = Object.keys(modelRanges);

        sortModelRanges(modelRanges);

        for (var i = 0; i < keys.length; ++i) {
            if (modelRanges[keys[i]].length) {
                results.push(modelRanges[keys[i]][0]);
            }
        }
        results = results.sort(compare);

        for (i = 0; i < results.length; i++) { //TODO remove logs
            log(results[i].marketingModelRange + " - distance: " + (results[i].distance), 'car vector: ', results[i].vector);
        }
        return results.slice(0, sampleSize);
    }

    /*
     comparator function used to sort cars according to their distance to the user
     */
    function compare(x, y) { //ascending order
        return (x.distance > y.distance) ? 1 : (x.distance < y.distance) ? -1 : 0;
    }


    /*
     euclidean vector distance
     */
    function distance(carv, userv) {

        var result = 0;
        var keys = Object.keys(userv);

        for (var i = 0; i < keys.length; ++i) {
            if (keys[i] !== 'wildcardQ1') {
                //BMWST-6903: fixing the issue, when the aem editor did not add a wildcard - so far it was handled as undefined and broke the calculation, not it is handled as not clicked by user
                if (userv[keys[i]] === undefined) {
                    userv[keys[i]] = 0;
                }
                result += Math.pow(carv[keys[i]] - userv[keys[i]], 2.0);

                //alternate approach, would differ more from excel result but to be considered to ignore what excel user put into car vector for specific wildcard - in case aem editor should have the power to ignore a wildcard entirely for calculation
                //if (userv[keys[i]] === undefined) { result += Math.pow(carv[keys[i]] - userv[keys[i]], 2.0); }
            }
        }
        return Math.sqrt(result);
    }

    /*
     term to exclude cars that are not suited for extreme conditions.
     applies in the case, the user selects the Q1 wildcard
     */
    function extra(cv, uv) {
        if (uv.wildcardQ1 === 1 && cv.wildcardQ1 === 0) {
            return 50;
        }
        return 0;
    }

    /*
     term to exclude cars with less seats than what the user requests.
     applies only in the case, the user selects 7 seats
     */
    function extra2(cv, uv) {
        if (uv.numberOfSeats === 2 && cv.numberOfSeats !== 2) {
            return 50;
        }
        return 0;
    }

    function setupModelRangeBuckets(cars) {
        var mrset = {};
        for (var i = 0; i < cars.length; ++i) {
            if (!mrset[cars[i].modelRange]) {
                mrset[cars[i].modelRange] = [];
            }
        }
        return mrset;
    }

    function NAAlgoritm(){
        this.modelRanges = null;
    }

    NAAlgoritm.prototype.calculate = function(cars, userVector, params){
        this.modelRanges = setupModelRangeBuckets(cars);

        var dist;
        for (var i = 0; i < cars.length; i++) {
            dist = distance(cars[i].vector, userVector);
            cars[i].distance = dist + extra(cars[i].vector, userVector) + extra2(cars[i].vector, userVector) + (dist * 0.0000001); //extra terms to exclude certain groups
            this.modelRanges[cars[i].modelRange].push(cars[i]);
        }

        return reduceModelRanges(params.resultSlidesCount, this.modelRanges); // sort modelRanges and pull the best scoring cars
    };

    NAAlgoritm.getInstance = function(){
        if(instance === null){
            instance = new NAAlgoritm();
        }
        return instance;
    };

    return NAAlgoritm.getInstance();
});