var express = require('express');
var app = express();
var dotenv=require('dotenv');
var mongo=require('mongodb');
var MongoClient=mongo.MongoClient;
dotenv.config();
var mongoUrl=process.env.MongoUrl
var cors=require('cors')
var bodyparser=require('body-parser')
var port = process.env.PORT || 8126;

//save the database connection
var db;
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.use(cors());

app.get('/',(req,res)=>{
    res.send("Hii from express")
})

app.get('/itemDetails',(req,res)=>{
    db.collection('itemDetails').find().toArray((err,result)=>{
        if(err) throw err
        res.send(result)
    })
})

app.get('/product/:itemid',(req,res)=>{
    var id=parseInt(req.params.itemid)
    var sort={cost:1}
    var query={"itemList_id":id}

    if(req.query.sortkey){
        var sortkey=req.query.sortkey
        if(sortkey>1 || sortkey<-1 || sortkey==0){
            sortkey=1
        }
        sort={cost:Number(sortkey)}
    }
    if(req.query.lcost && req.query.hcost){
        let lcost=Number(req.query.lcost);
        let hcost=Number(req.query.hcost);
    }
    if(req.query.discount && req.query.lcost && req.query.hcost){
        let lcost=Number(req.query.lcost);
        let hcost=Number(req.query.hcost);
        query={$and:[{cost:{$gt:lcost,$lt:hcost}}],"discounts.discount_id":Number(req.query.discount),"itemList_id":id}

    }
    else if(req.query.discount){
        query={"itemList_id":id,"discounts.discount_id":Number(req.query.discount)}
    }else if(req.query.lcost && req.query.hcost){
        let lcost=Number(req.query.lcost);
        let hcost=Number(req.query.hcost);
        query={$and:[{cost:{$gt:lcost,$lt:hcost}}],"itemList_id":id}
    }
    db.collection('productdetails').find(query).sort(sort).toArray((err,result)=>{
        if(err) throw err
        res.send(result)
    })
})

app.get('/products/:id',(req,res)=>{
    var id=parseInt(req.params.id)
    db.collection('productdetails').find({"itemDetails_id":id}).toArray((err,result)=>{
        if(err) throw err
        res.send(result)
    })
})

app.get('/similaritems/:restid',(req,res)=>{
    var restid=Number(req.params.restid)
    db.collection('Similaritems').find({"itemDetails_id":restid}).toArray((err,result)=>{
        if(err) throw err
        res.send(result)
    })
})

app.post('/menuItem',(req,res)=>{
    console.log(req.body);
    db.collection('Similaritems').find({product_id:{$in:req.body}}).toArray((err,result)=>{
        if(err) throw err
        res.send(result)
    })
})

app.put('/updateStatus/:id',(req,res)=>{
    var id=Number(req.params.id)
    var status=req.body.status?req.body.status:"pending"
    db.collection('orders').updateOne(
        {id:id},
        {
            $set:{
                "date":req.body.date,
                "bank_status":req.body.bank_status,
                "bank":req.body.bank,
                "status":status
            }
        }
    ,(err,result)=>{
        if(err) throw err
        res.send("order updated")
    })
})

app.get('/orderlist',(req,res)=>{
    db.collection('orders').find().toArray((err,result)=>{
        if(err) throw err
        res.send(result)
    })
})



app.post('/placeOrder',(req,res)=>{
    console.log(req.body);
    db.collection('orders').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.send("order placed")
    })
    
})

app.delete('/deleteorders',(req,res)=>{
    db.collection('orders').remove({},(err,result)=>{
        if(err) throw err
        res.send(result)
    })
})


MongoClient.connect(mongoUrl,(err,client)=>{
    if(err) console.log("Error while connecting")
    db=client.db('Flipkart')
    app.listen(port,()=>{
        console.log(`listening on port ${port}`)
    })
})
