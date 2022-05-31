const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _ = require("lodash");
// const date=require(__dirname+ "/date.js");


 const app=express();
 // let items=["Buy food","cook food","eat food"];
 // let workItems=[];

 app.use(bodyParser.urlencoded({extended:true}));
 app.use(express.static("public"));
 app.set("view engine","ejs");
 mongoose.connect("mongodb+srv://mudit_gupta:iamthegreatest123@cluster0.wzxr7.mongodb.net/todolistDB",{useNewUrlParser:true});

 const itemsSchema={
   name: String
 };
 const Item = mongoose.model("Item",itemsSchema);

 const item1=new Item({
   name:"Welcome to your todolist."
 });
 const item2=new Item({
   name:"Hit the + button to add a new item."
 });
 const item3=new Item({
   name:"<--Hit this to delete an item."
 });

 const defaultItems=[item1,item2,item3];

 const listSchema={
   name:String,
   items:[itemsSchema]

 };
 const List=mongoose.model("List",listSchema);

   app.get("/",function(req,resp){

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("success");
        }
      });
      resp.redirect("/");

    }else{
      resp.render("list",{listTitle:"Today",newListItems:foundItems});


    }
  })
   // let day=date.getDate();

   // var currentDay=today.getDay()
   // var day="";
   //
   // switch (currentDay) {
   //  case 0:
   //    day="Sunday"
   //    break;
   //  case 1:
   //     day="Monday"
   //     break;
   //  case 2:
   //    day="Tuesday"
   //    break;
   //  case 3:
   //    day="Wednesday"
   //    break;
   //
   //  case 4:
   //    day="Thursday"
   //    break;
   //  case 5:
   //    day="Friday"
   //    break;
   //  case 6:
   //      day="Saturday"
   //      break;
   //   default:
   //   console.log('Error: current day is'+ currentDay)
   //



 });
 app.get("/:customListName",function(req,resp){
   const customListName=_.capitalize(req.params.customListName);
   List.findOne({name:customListName},function(err,foundlist){
     if(!err){
       if(!foundlist){
         //create a new list

         const list=new List({
           name: customListName,
           items:defaultItems
         });

         list.save();
         resp.redirect("/"+customListName);

       }  else{
         //show an existing list

         resp.render("list",{listTitle:foundlist.name ,newListItems:foundlist.items});

       }
     }
 });
});


 app.post("/", function(req,resp){
    const itemName =req.body.newitem;
    const listName=req.body.list;
    const item= new Item({
      name:itemName
    });
    if(listName==="Today"){
      item.save();
      resp.redirect("/")
    }else{
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        resp.redirect("/"+listName);
      });
    }

 });
 app.post("/delete",function(req,resp){
   const checkedItemiD= req.body.checkbox;
   const listName=req.body.listName;

   if(listName==="Today"){
     Item.findByIdAndRemove(checkedItemiD,function(err){
       if (!err){
         console.log("deleted")
         resp.redirect("/");
       }
     });
   }else
   List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemiD}}},function(err,foundList){
     if(!err){
       resp.redirect("/"+ listName);
     }
   });



 })

 // app.get("/work",function(req,resp){
 //   resp.render("list",{listTitle:"Work List", newListItems:workItems})
 // });



 let port = process.env.PORT;
 if (port == null || port == "") {
   port = 3000;
 }

 app.listen(port,function(){
   console.log("Server har started");
 });
