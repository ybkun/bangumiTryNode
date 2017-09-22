var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var db = mongoose.createConnection('mongodb://localhost/bangumiMag');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("anime.js connect to mongodb: bangumiMag");
});

const SEASONS = ['fuyu','haru','natsu','aki'];

var counterSchema = new Schema({
    id: String,
    seq: {
        type: Number,
        default: 0,
    }
});

var counter = db.model("animeCounter", counterSchema,"animeCounter");

var animeSchema = new Schema({
    animeID:{
        type: String,
        required: true,
        unique: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    year:{
        type: Number,
        required: true
    },
    season:{
        type: String,
        required: true,
        enum: ['fuyu','haru','natsu','aki']
    },
    vision:{ // img url
        type: String
    },
    labels: [String]
});



var animeModel = db.model('animeInfo',animeSchema);

module.exports = {
    getOne: (animeID,callback)=>{
        animeModel.findOne({animeID:animeID}, {_id:0}, callback);
    },
    getMany: (animeIDs,callback)=>{
        var orList=[];
        for(var index in animeIDs){
            orList.push( {animeID:animeIDs[index]} );
        }
        animeModel.find({$or:orList},callback);
    },
    search: (conditions,callback)=>{
        animeModel.find(conditions, {_id:0}, {sort:{animeID:1}}, (err,res)=>{
            if(err){throw err} // !!!!
            callback(res); // get all
        });
    },
    new: (title,year,season,description,vision,labels, callback)=>{
        // console.log("call new")
        if(labels && !(labels instanceof Array)){
            return callback(Error('illegle labels'));
        }
        animeModel.findOne(
            {title:title},
            (err,data)=>{
                if(err){
                    throw err; // !!!!!
                }
                if(!(data===null)){
                    console.warn("anime title duplicate: ",title);
                }
            }
        );
        counter.findOneAndUpdate({id:"aID"},{$inc: { seq: 1} }, (err,doc,res)=>{
            if(err){
                throw err; // !!!!
            }
            // console.log("counter: ",err,doc,res);
            // doc.animeID=res.seq;
            animeModel.create(
                [{
                    animeID: doc.seq,
                    title: title,
                    year: year,
                    season: season,
                    description: description,
                    vision: vision,
                    labels: labels
                }],
                callback
            )
        });
    },
    delete: (animeID, callback)=>{
        animeModel.findOneAndRemove({animeID:animeID}, (err, res)=>{
            if(err){
                throw err;
            }
            console.log("Delete anime, ID:",animeID);
            console.log(res);
            if(callback){
                callback(err,res);
            }
        })
    },
    setTitle: (animeID, newTitle, callback)=>{
        animeModel.findOneAndUpdate({animeID:animeID},{$set:{title:newTitle}}, callback);
    },
    setYearAndSeason: (animeID, year, season, callback)=>{
        // year=-1 -> not change
        // season not in [fuyu,haru,natsu,aki] -> not change
        var update={$set:{}};
        if(year>0 && year-0){
            update.$set.year=year;
        }
        for(var index in SEASONS){
            if(season === SEASONS[index]){
                update.$set.season=season;
            }
        }
        if(!(update.$set.year || update.$set.season)){
            var emsg = "Error in setYearAndSeason: need at least one of valid year or season"
            console.error(emsg);
            console.log(year,season,update);
            return callback(emsg);
        }
        animeModel.findOneAndUpdate({animeID:animeID}, update, callback);
    },
    setDescription: (animeID, description, callback)=>{
        animeModel.findOneAndUpdate({animeID:animeID},{$set:{description:description}}, callback);
    },
    setVision: (animeID, url, callback)=>{
        animeModel.findOneAndUpdate({animeID:animeID},{$set:{vision:url}}, callback);
    },
    addLabels: (animeID, labels, callback)=>{
        if(!(labels instanceof Array)){
            return callback("Error in addLabels: labels is not an Array/[]");
        }
        var update={}
        animeModel.findOneAndUpdate({animeID:animeID},{$addToSet:{labels:{$each:labels}}}, callback);
    },
    setLabels:(animeID, labels, callback)=>{
        if(!(labels instanceof Array)){
            return callback("Error in setLabels: labels is not an Array/[]");
        }
        animeModel.findOneAndUpdate({animeID:animeID},{$set:{labels:labels}}, callback);
    }
}