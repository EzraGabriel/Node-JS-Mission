const express = require("express");
const router = express.Router();

const kelasController = require("../controllers/kelasController");
const verifyToken = require("../middleware/verifyToken");

router.get("/", kelasController.getAllKelas);
router.get("/:id", kelasController.getKelasById);
router.post("/", verifyToken, kelasController.createKelas);
router.put("/:id", verifyToken, kelasController.updateKelas);
router.delete("/:id", verifyToken, kelasController.deleteKelas);

module.exports = router;
