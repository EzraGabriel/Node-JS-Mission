const express = require("express");
const router = express.Router();

const kelasController = require("../controllers/kelasController");

router.get("/", kelasController.getAllKelas);
router.get("/:id", kelasController.getKelasById);
router.post("/", kelasController.createKelas);
router.put("/:id", kelasController.updateKelas);
router.delete("/:id", kelasController.deleteKelas);

module.exports = router;
