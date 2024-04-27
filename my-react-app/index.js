const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://sakthiadhavank21eie:Mf7M8XXmUIGaPk67@cluster0.q8cnnkn.mongodb.net/Organizers", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferCommands: false, // Disable buffering of commands
  connectTimeoutMS: 30000, // Increase connection timeout (default is 30000 ms)
  socketTimeoutMS: 45000 // Increase socket timeout (default is 45000 ms)
}).then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
const Organizers = mongoose.model('owners', {
  email: {
    type: String,
  },
  password: {
    type: String,
  }
});

const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  } else {
    try {
      const data = jwt.verify(token, 'secret_ecom');
      req.user = data.user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
  }
};

const Mode = mongoose.model('mode',{
  mode : {
    type:"String"
  }

}
)
app.get('/getMode',async(req,res)=>{
  try {
  
    const getted_mode = await Mode.findOne();
    res.json({mode:getted_mode.mode})
  }
  catch (error) {
    // Handle errors
    console.error('Error while changing status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})


app.post('/changeMode',async(req,res)=>{
  try{
  const getted_mode= await Mode.findOne({});
  getted_mode.mode=getted_mode.mode=req.body.mode;
  await getted_mode.save()
  res.json({ success:true,message: 'Status changed successfully', newMode: getted_mode.mode });
 
} catch (error) {
  // Handle errors
  console.error('Error while changing status:', error);
  res.status(500).json({ error: 'Internal server error' });
}
})



app.post('/login', async (req, res) => {
  try {
    const user = await Organizers.findOne({ email: req.body.username,pass:req.body.password });
    
    if (!user) {
      res.json({ success: false, admin: false, errors: "User not found" });
      return;
    }
    else{
        const token = jwt.sign({ user }, 'secret_heater');
      res.json({ success: true, admin: true, token });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ errors: "Internal server error" });
  }
});

const CurrentStatus = mongoose.model('currentStatus',{
  currentStatus: {
    type: String,
    required: true,
  }
});




app.post('/changestate', async (req, res) => {
  try {
  
    const status = await CurrentStatus.findOne();

    // Toggle the status
    status.currentStatus = status.currentStatus === 'OFF' ? 'ON' : 'OFF';
    await status.save();

    // Save the updated status back to the database

    // Respond with the updated status
    res.json({ success:true,message: 'Status changed successfully', newStatus: status.currentStatus });
    updateTimings(status.currentStatus);
  } catch (error) {
    // Handle errors
    console.error('Error while changing status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/getStatus',async(req,res)=>{
  try {
  
    const status = await CurrentStatus.findOne();
    res.json({status:status.currentStatus})
  }
  catch (error) {
    // Handle errors
    console.error('Error while changing status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

const Temperature = mongoose.model('temperture',{
  temp:{
    type:String,
    required:true,
  }
})

app.post('/updateTemperature',async(req,res)=>{
  try{
    const temperatureId=await Temperature.findOne();
    temperatureId.temp=req.body.temp;
    await temperatureId.save()
    res.json({success:true})
  }
  catch{
    console.log("error updating temperature")
    res.json({success:false})
  }
})


app.get('/getTemp',async(req,res)=>{
  try{
    const temperatureId=await Temperature.findOne();
    res.json({success:true,temp:temperatureId.temp})
  }
  catch{
    console.log("error getting temperature")
    res.json({success:false})
  }

})

const Timmings= mongoose.model('timmings',{
  status:{
    type:String,
    required:true
  },
  time:{
    type:Date,
    default:Date.now
  }
})


const updateTimings = async (newStatus) => {
  try {
    console.log(newStatus);
    // Insert the new status into the Timmings collection
    await Timmings.create({ status: newStatus });
    console.log('New status inserted into Timmings collection');
  } catch (error) {
    console.error('Error inserting new status into Timmings collection:', error);
  }
};

app.post('/getTimmings', async (req, res) => {
  try {
    // Check if startDate and endDate are provided and valid date strings
    if (!req.body.startDate || !req.body.endDate) {
      return res.status(400).json({ success: false, error: 'Both startDate and endDate are required.' });
    }

    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    // Check if startDate and endDate are valid dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid date format. Please provide valid dates.' });
    }

    // Query for timings within the specified date range
    const timeresp = await Timmings.find({
      time: { $gte: startDate, $lte: endDate }
    });

    res.json({ success: true, resp: timeresp });
  } catch (error) {
    console.error('Error retrieving timings:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});




app.listen(port, (e) => {
  if (!e) {
    console.log("Server running on: " + port);
  } else {
    console.log("Error: " + e);
  }
});
