const {Router}=require('express');
const {usuarioauth}=require("../controllers/auth.controllers")
const router=Router()

router.post("/login",usuarioauth.login)
router.get("/verify",usuarioauth.verificarauth)

module.exports=router
