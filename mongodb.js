// CRUD 

// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;

const {MongoClient, ObjectId} = require('mongodb')
const connectionURL = 'mongodb://127.0.0.1:27017';
const dbName = 'task-manager';

MongoClient.connect(connectionURL, { useNewUrlParser: true}, (error, client) => {
    if (error) {
      return console.log('Unable to connect to Mongo')
    }

   const db = client.db(dbName)

   //fetch single docu
    // db.collection('users').findOne({_id: new ObjectId("6123612a6ce73baa201974d7")}, (error, data) => {
    //     if(error){
    //         return console.log('Unable to find')
    //     }

    //     console.log(data)
    // })

    //fetch is completed is true
    // db.collection('users').find({completed: true}).toArray((error, data) => {
    //     if(error) {
    //         return console.error(error)
    //     }
    //     console.log(data)
    // })

    // delete single document
    // db.collection('users').deleteOne({_id: new ObjectId("61235b7223b8b6b726b29482")}, (error, result) => {
    //     if(error) {
    //         return console.log('Unable to delete')
    //     }

    //     console.log('Deleted Successfully!')
    // })  



    //delete multiple documents from users collection
    // db.collection('users').deleteMany({completed: true}, (error, result) => {
    //     if(error) {
    //         return console.log('Unable to delete')
    //     }

    //     console.log('Deleted Successfully!', result)
    // })

    // update single docu using promises
 const update = db.collection('users').findOneAndUpdate({_id: new ObjectId("6123612a6ce73baa201974d6")}, {$set:{description:'Hello'}})
   

    update.then((data) => {
        console.log(data)
    }).then(err => console.log(err))


});

