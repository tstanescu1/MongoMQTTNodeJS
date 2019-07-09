const mqtt=require('mqtt');
const mongodb=require('mongodb');
const mongodbClient=mongodb.MongoClient;
const mongodbURI='mongodb://admin:admin@server.com:27017/admin';
const deviceRoot="/status/#"; //mqtt subscribe
let collection,client;

const options = {
    username: "admin",
    password: "admin",
};


mongodbClient.connect(mongodbURI,{ useNewUrlParser: true },setupCollection);
function setupCollection(err,database) {
    if(err) throw err;
    
    client = mqtt.connect('mqtt://1love.dev', options);
    client.subscribe(deviceRoot);
    collection = database.db().collection('Device');
    console.log('Connected, and Subscribed to MQTT');
    client.on('message', insertEvent);
};

function insertEvent(topic,message) {
    
    let key = topic.toString().replace(deviceRoot,'');
    console.log(topic + ":" + message)
    
    //collection.insertOne({[topic]:message.toString()})
	collection.updateMany(
		{ _id:key }, 
		{ $push: {  topic: { message:message.toString(),  date:new Date() } } }, 
	 	{ upsert:true },
	 	function(err,docs) {
			if(err) {
				console.log("Insert fail");	// Improve error handling		
			}
		}
	);
}
