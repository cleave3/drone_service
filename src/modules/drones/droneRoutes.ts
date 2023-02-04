import { Router } from "express";
import validator from "../../middleware/validator";
import DroneController from "./droneController";
import { registerDrone, loadDrone, updateDroneState } from "./droneValidationSchema";


const router = Router();

router.post("/", validator(registerDrone), DroneController.register);
router.patch("/load/:serialNumber", validator(loadDrone), DroneController.loadDrone);
router.patch("/state/:serialNumber", validator(updateDroneState), DroneController.updateDroneState);
router.get("/", DroneController.getDrones);
router.get("/available", DroneController.getAvailableDrones);
router.get("/:serialNumber", DroneController.getDroneBySerialNumber);
router.get("/battery/:serialNumber", DroneController.checkDroneBatteryLevel);

export const droneRoutes = router;