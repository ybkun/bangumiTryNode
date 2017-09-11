module.exports = rangeList;

function rangeList(start, end, step){
    if(!(step-0)){
        step=1;
    }
    if(!(end-0)){
        end=start;
        start=0;
    }
    if(!(end-start)){
        throw Error("Invalid arguments in rangeList, start and end should be number")
    }
    var ret = [];
    if(step>0){
        for(var i=start; i<end; i+=step){
            ret.push(i);
        }
    }
    else{
        for(var i=start; i>end; i+=step){
            ret.push(i);
        }
    }
    return ret;
}