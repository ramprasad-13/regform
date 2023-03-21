const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { stringify } = require('querystring');
const PORT=3000;
//while deploying in cloud use the below syntax for port variable
// const PORT=process.env || 3000;
const app=express();

const uri="mongodb://ram:ram@ac-cktkkgh-shard-00-00.2lhqsge.mongodb.net:27017,ac-cktkkgh-shard-00-01.2lhqsge.mongodb.net:27017,ac-cktkkgh-shard-00-02.2lhqsge.mongodb.net:27017/?ssl=true&replicaSet=atlas-mplax0-shard-0&authSource=admin&retryWrites=true&w=majority";
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//mongo db connection
mongoose.connect(uri)
const db=mongoose.connection;
db.on("error",()=>{console.error.bind()});
db.once("open",()=>{console.log("DB connection established")});


//schema
const std_schema =mongoose.Schema({
    email:String,
    std_name:String,
    age:Number,
    roll_num:String,
    ph_num:Number,
    address:String
})


//model
const students=mongoose.model("student",std_schema)

//routes

app.get("/student/:roll_num",async(req,res)=>{
    let {roll_num}=req.params
    let std_found=await students.findOne({roll_num:roll_num})
    if(std_found){
        res.status(203).send(std_found)
    }
    else{
        res.send("Invalid roll number")
    }
})


app.get("/students",async(req,res)=>{
    try{
        let students_data = await students.find()
        res.send(students_data);
    }
    catch(error){
        res.status(500).send(error)
    }
})

app.post("/addstudent",async(req,res)=>{
    let current_student=new students(
        {
            email:req.body.email,
            std_name:req.body.std_name,
            age:req.body.age,
            roll_num:req.body.roll_num,
            ph_num:req.body.ph_num,
            address:req.body.address
        })
    
    try{
        await current_student.save()
        res.redirect("/students")
    }
    catch(error){
        res.status(500).send(error)
    }
})

app.get("/",(req,res)=>{
    res.redirect("index.html")
})


app.delete("/delete/:roll_num",async(req,res)=>{
try{
    let{roll_num}=req.params
    let find_student=await students.findOne({roll_num:roll_num})
    if(find_student)
    { 
        await students.deleteOne({roll_num:roll_num})
        res.status(203).send("deleted sucessfully")
    }
    else{
        res.send("Student not found!")
    }
   
}
catch(error){
    res.status(500).send(error)
}
})

app.patch("/update/:id",async(req,res)=>{
    try{
        let{id}=req.params
        let student_found=await students.findOne({roll_num:id})
        if(student_found)
        {
            if(req.body.email){student_found.email=req.body.email}
            if(req.body.std_name){student_found.std_name=req.body.std_name}
            if(req.body.age){student_found.age=req.body.age}
            if(req.body.roll_num){student_found.roll_num=req.body.roll_num}
            if(req.body.ph_num){student_found.ph_num=req.body.ph_num}
            if(req.body.address){student_found.address=req.body.address}
            await student_found.save()
            res.status(203).send("student update sucessfull")
        }
        else{
            res.send("Student not found!")
        }
       
    }
    catch(error){
        res.status(500).send(error)
    }

})



app.listen(PORT,()=>{
    console.log(`app started listening http://localhost:${PORT}`);
})