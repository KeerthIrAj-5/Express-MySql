const { faker } = require('@faker-js/faker');
const mysql=require('mysql2');
const express=require("express");
const app=express();
const path=require("path");
const methodOverride = require('method-override')
const { v4: uuidv4 } = require('uuid'); 

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

let getRandomUser=()=> {
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
    ]
  };
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'db',
    password:'SqlKeerthi1*'
  });
  //to add dummy data, run this only once(the commented code)
//   let q="insert into user(id,username,email,password) values ?";
//  let us=[];
// for(let i=1;i<=100;i++){
//     us.push(getRandomUser());
// }

//   try{
//     connection.query(q,[us],(err,results)=>{
//         if(err) throw err;
//         console.log(results);
//       });
//   }
// catch(err){
//     console.log(err);
// }
//connection.end();

app.listen('3000',()=>{
    console.log("Listening on port 3000");
});
app.get("/",(req,res)=>{
    let q="select count(*) from user";
    try{
            connection.query(q,(err,results)=>{
                if(err) throw err;
                let count=results[0]["count(*)"];
                res.render("home.ejs",{count});
              });
          }
        catch(err){
            res.send("Some error occured");
        }
});

app.get("/users",(req,res)=>{
    let q="select * from user";
    try{
        connection.query(q,(err,results)=>{
            if(err) throw err;
            res.render("users.ejs",{results});
          });
      }
    catch(err){
        res.send("Some error occured in db");
    }
});

app.get("/users/:id/edit",(req,res)=>{
    let {id}=req.params;
    let q=`select * from user where id="${id}"`;
    try{
        connection.query(q,(err,results)=>{
            if(err)throw err;
            let user=results[0];
            res.render("edit.ejs",{user});
          });
      }
    catch(err){
        res.send("Some error occured in db");
    }
    
});
app.patch(("/users/:id"),(req,res)=>{
    let {id}=req.params;
    let q=`select * from user where id="${id}"`;
    try{
        connection.query(q,(err,results)=>{
            if(err)throw err;
            let user=results[0];
            let pass=req.body.password;
            let username=req.body.username;
            if(pass==user.password){
                let q=`update user set user.username="${username}" where id="${user.id}"`;
                try{
                    connection.query(q,(err,results)=>{
                        if(err)throw err;
                        res.redirect("/users");
                      });
                  }
                catch(err){
                    res.send("Some error occured in db");
                }
            }
            else{
                res.send("Password is wrong");
            }
          });
      }
    catch(err){
        res.send("Some error occured in db");
    }
});

app.post("/users",(req,res)=>{
    let id=uuidv4();
    let user=req.body;
    let u=[];
    u.push(id);
    u.push(user.username);
    u.push(user.email);
    u.push(user.password);
    console.log(u);
    let q="insert into user (id,username,email,password) values (?,?,?,?)";
    try{
        connection.query(q,u,(err,results)=>{
            if (err)throw err;
            res.redirect("/users");
        });
    }
    catch(err){
            res.send("Problem with DB");
    }


});
app.get("/users/new",(req,res)=>{
    res.render("new.ejs");
});

app.delete(("/users/:id"),(req,res)=>{
    let {id}=req.params;
    let pass=req.body.password;
    let q=`Select * from user where id="${id}"`;
    try{
        connection.query(q,(err,results)=>{
            if(err) throw err;
            let up=results[0]['password'];
            if(pass==up){
                let q=`delete from user where id="${id}"`;
                try{
                    connection.query(q,(err,results)=>{
                        if(err) throw err;
                        res.redirect("/users");
                    });
                }
                catch(err){
                    res.send("Something is wrong");
                }
                
            }
            else{
                res.send("Wrong password");
            }
        });
    }
    catch(err){
        res.send("Error in DB");
    }
});
app.get(("/users/:id"),(req,res)=>{
    let {id}=req.params;
    let q=`select * from user where id="${id}"`;
    try{
        connection.query(q,(err,results)=>{
            if(err)throw err;
            let user=results[0];
            res.render("delete.ejs",{user});
          });
      }
    catch(err){
        res.send("Some error occured in db");
    }
});
