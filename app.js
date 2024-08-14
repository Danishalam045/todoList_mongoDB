const express = require('express')
const bodyparser = require('body-parser');
const exp = require('constants');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + "/date.js");

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.static("files"));

app.set('view engine', 'ejs');


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

    const itemsSchema = new mongoose.Schema({
        name: String
    });

    const Item = mongoose.model('Item', itemsSchema);

    const item1 = new Item({
        name: 'Welcome to your todolist'
    });

    const item2 = new Item({
        name: 'Hit the + button to aff a new item'
    });

    const item3 = new Item({
        name: '<--Hit this to delete an item.>'
    });

    const defaultItems = [item1, item2, item3];

    const listSchema = {
        name: String,
        items: [itemsSchema]
    };

    const List = mongoose.model("List", listSchema);



    app.get("/", function (req, res) {
        let day = date.getdate();

        Item.find({}).then(async (docs) => {
            if (docs.length === 0) {
                await Item.insertMany(defaultItems).then(() => {
                    console.log("default items has been inserted.");
                    res.redirect('/');
                });
            } else {
                res.render('list', { listTitle: "Today", newListItems: docs });
            }

        }).catch((err) => {
            console.log(err);
        })

    });

    app.get("/:customListName", function (req, res) {
        const customListName = _.capitalize(req.params.customListName);

        List.findOne({ name: customListName }).then((foundList) => {
            if (foundList) {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            } else {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
        }).catch((err) => {
            console.log(err);
        });

    });

    app.post("/", function (req, res) {
        const itemName = req.body.newItem;
        const listName = req.body.list;

        const item = new Item({
            name: itemName
        });

        if (listName === "Today") {
            item.save();
            res.redirect("/");
        }
        else {
            List.findOne({ name: listName }).then((foundList) => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
        }

    })

    app.post("/delete", function (req, res) {
        const checkedItemId = req.body.checkbox;
        const listName = req.body.listName;

        if (listName === "Today") {
            Item.findByIdAndDelete(checkedItemId).then(() => {
                console.log("document is deleted")
                res.redirect("/");
            })
                .catch((err) => {
                    console.log(err);
                })

        }
        else{
            List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then((docs)=>{
                res.redirect("/"+listName);
            })
        }
        // Item.findByIdAndDelete(checkedItemId).then(() => {
        //     console.log("document is deleted")
        //     res.redirect("/");
        // })
        //     .catch((err) => {
        //         console.log(err);
        //     })

    });

}


app.listen(3000, () => {
    console.log("Server is working on port 3000");
})