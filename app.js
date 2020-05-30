//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-vaidik:Testing123@cluster0-orlxe.mongodb.net/todoListDB",{useNewUrlParser:true,useUnifiedTopology: true,useFindAndModify: false});

const itemsSchema = {
  name:String,
};

const Item= mongoose.model("Item", itemsSchema);

const vegetables = new Item({
  name:"default item1",
});

const fruits = new Item({
  name:"default item 2"
});

const flour = new Item({
  name:"default item 3"
});

const defaultItems = [vegetables,fruits,flour];


const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(err){
      console.log(err);
      
    }else{
      if(foundItems.length===0){
         Item.insertMany(defaultItems,function(err){
          if(err){
          console.log(err);
          }else{
          console.log("Success!!");
          }
        });
        res.redirect("/");
      } else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});

      }  

    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });

  if(listName==='Today'){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName); 
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(err){
        console.log(err);
        
      }else{
        console.log("success!!");
        res.redirect("/");
      }
    });
  
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


  
});

app.get("/:customListName",function(req,res){  
  const customListName= _.capitalize(req.params.customListName);
  


  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a list
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);

      }else{
        //show existing lists
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});        
      }
    }
  });

});



app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});
