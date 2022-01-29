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

router.route('users/:user_id')
  .all((req, res, next) => { 
      // ตรวจสอบว่า id user ที่ส่งเข้ามาเพื่อดูข้อมูล / แก้ไข / ลบ มีอยู่ในฐานข้อมูลหรือไม่
      let sql = ' SELECT * FROM usercalendar WHERE user_id = ? '
      db.query(sql, [req.params.user_id], (error, results, fields)=>{
          // เกิด error ในคำสั่ง sql
          if(error) return res.status(500).json({
              "status": 500,
              "message": "Internal Server Error" // error.sqlMessage
          })
          // กรณีไม่พบข้อมูล 
          if(results.length ===0) return res.status(400).json({
              "status": 400,
              "message": "Not found user"
          }) 
          res.user = results // ถ้ามี id นั้นอยู่ในฐานข้อมูล ส่งข้อมูลผู้ใช้นั้นไปทำงานต่อ
          next()
      })        
  })
  .get((req, res, next) => { 
    // ถ้าเป็นการแสดงข้อมูลของ ผู้ใช้ id ใด ก็นำค่าที่ถูกส่งมาไปแสดง
    const result = {
        "status": 200,
        "data": res.user,
        "message": "get all users"
    }
    return res.json(result)
})
.put((req, res, next) => {   
  // ถ้าเป็นการแก้ไขข้อมูล ก็เตรียมรูปแบบข้อมูลที่รับมาสำหรับแก้ไข
  let user = {
    username: req.body.username, 
    email: req.body.email
  }
  // ทำการอัพเดท โดยอิง id ที่พบ
  let sql = ' UPDATE usercalendar SET ? WHERE user_id = ? '
  db.query(sql, [user, req.params.user_id], (error, results, fields)=>{
      // เกิด error ในคำสั่ง sql
      if(error) return res.status(500).json({
          "status": 500,
          "message": "Internal Server Error" // error.sqlMessage
      })
      // ถ้ามีการแก้ไขค่าใหม่ 
      if(results.affectedRows > 0) {
          // เอาค่าฟิลด์ทีได้ทำการอัพเดท ไปอัพเดทกับข้อมูลทั้งหมด
          user = Object.assign(res.user[0], user)
      }else{ // มีการอัพเดท แต่เป็นค่าเดิม
          user = res.user
      }
      // ส่งรายการข้อมูลที่อัพเทกลับไป
      const result = {
          "status": 200,
          "data": user
      }
      return res.json(result)        
  })
})
  .delete((req, res, next) => { 
    // ทำการลบช้อมูลของ id ข้อมูลที่ต้องการ จากฐานข้อมูล แล้วแสดงข้อมูลที่เพิ่งลบ
            // ถ้าเป็นการลบข้อมูล จาก id ใดๆ 
    let sql = ' DELETE FROM usercalendar WHERE user_id = ? '
    db.query(sql, [req.params.user_id],(error, results, fields)=>{
        if(error) return res.status(500).json({
            "status": 500,
            "message": "Internal Server Error" // error.sqlMessage
        })
        // ใช้ค่าข้อมูลถ้าค้นเจอ ก่อนลบ ส่งออกไป เป็นการบอกว่า รายการนี้คือรายการที่ถูกลบไปแล้ว
        const result = {
            "status": 200,
            "data": res.user
        }
    return res.json({})
      })
      
  })
module.exports = router
