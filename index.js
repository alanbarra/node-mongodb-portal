const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

const Posts = require("./models/Posts");

mongoose
  .connect(
    "mongodb+srv://root:3RVYRlWZjXEtq8Gv@cluster0.5r61v.mongodb.net/dankicode?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(function () {
    console.log("conectado com sucesso no MongoDB !");
  })
  .catch(function (err) {
    console.log("Mongoose Erro: " + err.message);
  });

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/pages"));

//------------------------------------------------------------------- ROTAS
app.get("/", (req, res) => {
  if (req.query.busca == null) {
    Posts.find({})
      .sort({ _id: -1 })
      .exec(function (err, posts) {
        res.render("home", { posts: posts });
      });
  } else {
    Posts.find(
      { titulo: { $regex: req.query.busca, $options: "i" } },
      function (err, posts) {
        res.render("busca", { posts: posts, contagem: posts.length });
      }
    );
  }
});

app.get("/:slug", (req, res) => {
  Posts.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { views: 1 } },
    { new: true },
    function (err, resposta) {
      if (resposta != null) {
        res.render("single", { noticia: resposta });
      } else {
        res.render("notfound", {});
      }
    }
  );
});
//---------------------------------------------------------------------------

app.listen(3000, () => {
  console.log("listening...");
});
