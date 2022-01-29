const express = require("express");
const router = express.Router();
const db = require("../db/config"); // เรียกใช้งานเชื่อมกับ MySQL

router
  .route("/users?")
  .get((req, res, next) => {
    let sql = " SELECT * FROM usercalendar ";
    db.query(sql, (error, results, fields) => {

      if (error)
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
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
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      hashpassword: req.body.hashpassword,
      role_id: req.body.role_id,
    };
    let sql = "INSERT INTO usercalendar SET ?";
    db.query(sql, user, (error, results, fields) => {
      if (error)
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
        });
      user = [{ id: results.user_id, ...user }];
      // let id = results.insertId
      // console.log(id)
      const result = {
        status: 200,
        data: user,
      };
      return res.json(result);
    });
  });

module.exports = router;
