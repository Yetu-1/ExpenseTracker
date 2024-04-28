import bodyParser from "body-parser";
import express from "express"

const app = new express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(port, ()=> {
    console.log(`Server running on port ${port}`);
});