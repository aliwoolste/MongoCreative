const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(3003).sockets;

//how to connect to Mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
  if(err){
      throw err;
  }
 
   console.log('MONGO DB CONNECTED!!');
 
  //connect to Socket.io
  client.on('connection', function(socket){
    let chat = db.collection('chats');
    
    sendStatus = function(s){
        socket.emit('status',s);
    }
    
        //get chats from mongo collection
    chat.find().sort({_id:1}).toArray(function(err, res){
      if(err) {
        throw err;
      }
      //if not, emit messages to index file
      socket.emit('output', res);
    });

    socket.on('input', function(data){
      let name = data.name;
      let message = data.message;

      if(name == '' || message == '')
      {
        sendStatus("Please enter a name AND a message")
      }
      else{
        chat.insert({name: name, message: message}, function(){
          client.emit('output',[data]);

          sendStatus({
            message: "Message sent",
            clear:true
          });
        });
      }
    });

    //clear messages
     socket.on('clear', function(data){
       chat.remove({}, function() {
         socket.emit('cleared');
       });
     });

   });
 
 });
  
    
