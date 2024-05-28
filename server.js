const mongoose = require('mongoose');
const app = require('./app')

// database connection
const dbURI = 'mongodb+srv://edumwas911:Bazokizo98@smoothie.xff912n.mongodb.net/Smoothies';
mongoose.connect(dbURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex:true
 })
 .then(() =>{ console.log('DB connected')})

 const port = 3000
 const server = app.listen(port, ()=>{
  console.log(`app is running on port ${port}`)
 })