const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const _=require("lodash");

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-guneet:Abcd1234@cluster0.2hz87.mongodb.net/?retryWrites=true&w=majority');
//'mongodb+srv://admin-guneet:Abcd1234@cluster0.2hz87.mongodb.net/todolistDB'
const itemsSchema= {
  name: String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item ({
  name:"Welcome to your todolist"
});

const item2=new Item ({
  name:"Hit the + button to add a new item."
});

const item3=new Item ({
  name:"<-- Hit this to delete an item."
});

const listSchema= {
  name: String,
  items: [itemsSchema]
};
const List= mongoose.model("List",listSchema);

const defaultItems=[item1,item2,item3];

app.get("/",function(req,res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0) {
      Item.insertMany(defaultItems,function(err) {
        if(err) {
          console.log(err);
        }
        else console.log("Successfully saved items to the database");
      });
      res.redirect('/');
    }
    else {
      res.render('list', {listTitle:"Today",newListItems:foundItems});
    }
  });
});
app.post("/",function(req,res) {
  const listName=req.body.list;
  const item=new Item({
    name:req.body.newItem
  });
  if(req.body.list==="Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List .findOne({name: listName}, function(err, foundList) {
foundList.items.push(item);
foundList.save();
res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res) {
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if (listName==="Today") {
    Item.findByIdAndRemove(checkedItemId,function(err) {
        if(!err) res.redirect("/");
    });
  }
  else {
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList) {
      if(!err) {
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/work",function (req,res) {
  res.render("list", {listTitle:"Work List",newListItems:workItems});
});
// app.post("/work",function (req,res) {
//   res.redirect("/");
// });

app.get("/:customListName",function(req,res) {
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err, foundList) {
    if(!err) {
      if(!foundList) {
        const list= new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  });
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function() {
  console.log("Server running on port 3000");
});
