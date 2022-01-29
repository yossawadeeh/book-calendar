const express = require("express");
const router = express.Router();
const db = require("../db/config"); // เรียกใช้งานเชื่อมกับ MySQL

router.route("/users?")
  .get((req, res, next) => {
    let sql = " SELECT * FROM usercalendar ";
    db.query(sql, (error, results, fields) => {

      if (error)
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error", //error.sqlMessage
        });

      const result = {
        status: 200,
        data: results,
      };
      return res.json(result);
    });
  })

  .post((req, res, next) => {
    let user = {
      user_id: req.body.userId,
      name: req.body.displayName,
      username: req.body.username,
      email: req.body.email,
      role_id: req.body.role_id,
    };
    let sql = "INSERT INTO usercalendar SET ?";
    db.query(sql, user, (error, results, fields) => {
      if (error)
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error", //error.sqlMessage
        });
      user = [{ id: results.user_id, ...user }];
      const result = {
        status: 200,
        message: "User was registered",
        data: user,
      };
      return res.json(result);
    });
  });

  router.route('/user/:user_id')
    .all((req, res, next) => { 
        let sql = ' SELECT * FROM usercalendar WHERE user_id = ? '
        db.query(sql, [req.params.user_id], (error, results, fields)=>{
            // เกิด error ในคำสั่ง sql
            if(error) return res.status(500).json({
                "status": 500,
                "message": "Internal Server Error"
            })
            // กรณีไม่พบข้อมูล 
            if(results.length === 0) return res.status(400).json({
                "status": 400,
                "message": "Not found user with the given ID"
            }) 
            res.user = results
            next()  
        })        
    })
    .get((req, res, next) => { 
        const result = {
            "status": 200,
            "data": res.user
        }
        return res.json(result)
    })


module.exports = router
