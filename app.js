const express = require('express')
const shortid = require('shortid');
const bcrypt =require('bcrypt');
const url=require('url');
const mongoose = require('mongoose');

//mongoose connection
const connectionString = 'mongodb+srv://subhamDB:S21b8a13@cluster0.avz0ce7.mongodb.net/lms';
// Connect to the database
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    // Perform database operations here
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });
//Model Creation//
//User Model
const userSchema=new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    }
});
const UserModel=new mongoose.model("user",userSchema);
//Order Model
const orderSchema=new mongoose.Schema({
	userId:{
		type:String,
		required:true
	},
    name:{
        type:String,
		required:true
    },
    email:{
        type:String,
		required:true
    },
	state:{type:String,required:true},
	city:{type:String,required:true},
	pincode:{type:String,required:true},
	address:{type:String,required:true},
	shirt:{type:String},
	pant:{type:String},
	jean:{type:String},
	short:{type:String},
	tshirt:{type:String},
	sweatshirt:{type:String},
	bedsheet:{type:String},
	pillowcover:{type:String},
	towle:{type:String},
	totalamount:{type:Number},
	orderdate:{
		type:Date,
		default: Date.now
	},
	status:{
		type:String,
		required:true
	}
});
const OrderModel=new mongoose.model("order",orderSchema);
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.set('view engine','ejs')
app.use('/images',express.static('views/images'))


app.get('/home/:id',async function(req,res){
	const username=await UserModel.find({_id:req.params.id})
	res.render('home',{id : req.params.id ,name : username[0].name.split(" ")[0]})
})

app.get('/admin',function(req,res){
	res.render('adminlogin')
})

app.post('/admin/loginsubmit',async function(req,res){
 const email=req.body.aemail,password=req.body.apassword;
 if(email==="admin10@gmail.com"&&password==="101201"){
	const orderdata=await OrderModel.find({status:{ $in: ['Processing','Prepared','Out for Deliver'] }});
	res.render('admin',{data:orderdata})
 }else{
	res.send("admin email or doesn't match");
 }
})

app.get('/',function(req,res){
	res.render('login')
})

app.get('/signup',function(req,res){
	res.render('signup')
})

app.get('/about/:id',function(req,res){
   res.render('about',{id:req.params.id})
})

app.get('/order/:id',function(req,res){
	res.render('order',{id:req.params.id})
 })

app.post('/loginsubmit',async function(req,res){
	const email=req.body.lemail,password=req.body.lpassword;
	const userdata=await UserModel.find({email:email});
	// console.log(userdata[0].id)
	if(userdata.length==1){
        if(await bcrypt.compare(password,userdata[0].password)){
			res.redirect('home/'+userdata[0].id)
        }else{
            res.send("password doesn't match.")
        }
    }else{
		res.render('signup')
	}
})

app.post('/signupsubmit',async (req,res)=>{
		const User=new UserModel({
			name:req.body.uname,
			email:req.body.uemail,
			password: bcrypt.hashSync(req.body.upassword,10)
		})
		User.save().then(()=>{
			res.render('login')	  
		}).catch((err)=>{
			console.log(err);
		})

})

app.post('/ordersubmit/:id',async (req,res)=>{
	try{
	var ip={
		name:req.body.oname,
		email:req.body.oemail,
		state: req.body.ostate,
		city: req.body.ocity,
		pincode: req.body.opincode,
		address: req.body.oaddress,
		shirt:0||req.body.oshirt,
		pant:0||req.body.opant,
		jean:0||req.body.ojean,
		short:0||req.body.oshort,
		tshirt:0||req.body.otshirt,
		sweatshirt:0||req.body.osweatshirt,
		bedsheet:0||req.body.obedsheet,
		pillowcover:0||req.body.opillow,
		towel:0||req.body.otowel
	}
		var wp = {
			shirts : 10,
			pants : 15,
			jeans : 25,
			shorts : 10,
			towels : 15,
			mundu : 25,
			bsheets : 7,
			pillowc : 5,
			tshirts: 10
		}
		var TotalAmount= await (wp.shirts*ip.shirt+ wp.pants*ip.pant+ wp.jeans*ip.jean+ wp.shorts*ip.short+ 
		wp.towels*ip.towel+ wp.mundu*ip.sweatshirt+ wp.bsheets*ip.bedsheet+ wp.pillowc*ip.pillowcover+wp.tshirts*ip.tshirt)
		console.log(TotalAmount);
	const Order=await new OrderModel({
		userId:req.params.id,
		name:ip.name,
		email:ip.email,
		state: ip.state,
		city: ip.city,
		pincode: ip.pincode,
		address: ip.address,
		shirt:0||ip.shirt,
		pant:0||ip.pant,
		jean:0||ip.jean,
		short:0||ip.shirt,
		tshirt:0||ip.tshirt,
		sweatshirt:0||ip.sweatshirt,
		bedsheet:0||ip.bedsheet,
		pillowcover:0||ip.pillowcover,
		towle:0||ip.towel,
		totalamount:TotalAmount,
		status:"Processing"
	});
	await Order.save()
	.then(()=>{
		console.log("order successful")
		res.redirect('/home/'+req.params.id)	  
	}).catch((err)=>{
		console.log(err);
	})
}catch(err){
	console.log(err)
}

})

app.get('/orderstatus/:id/track',async function(req,res){
	const userid=req.params.id;
	const data=await OrderModel.find({userId:userid});
	if(data.length>0){
		// console.log(data);
		res.render('orderstatus',{data:data , id:req.params.id});
	}else{
		res.send("no order found!")
	}
})


app.get('/orderstatus/:id/',async function(req,res){
	const userid=req.params.id;
	if(userid){
		res.redirect('/orderstatus/'+userid+'/track');
	}else{
		res.send("something went!");
	}
})


app.get('/update/order/:oid',async (req,res)=>{
	try{
	const orderdata=await OrderModel.find({status:{ $in:['Processing','Prepared','Out for Deliver'] }});
	res.render('updateOrder',{oid:req.params.oid});
	}catch(err){
		console.log(err);
	}
})
app.post('/admin/updateorder',async (req,res)=>{
	try{
		const oid=req.body.uid,ustatus=req.body.ustatus;
		await OrderModel.updateOne({_id:oid},{ $set:{status:ustatus}});
		const orderdata=await OrderModel.find({status:{ $in:['Processing','Prepared','Out for Deliver'] }});
		res.render('admin',{data:orderdata});
	}catch(err){
		console.log(err);
	}
})
app.listen(8000, function(){
	console.log("server running on port 8000.\n Link for user login: http://localhost:8000/ \n Link for admin login : http://localhost:8000/admin \n (email:admin10@gmail.com,password:101201)")
})