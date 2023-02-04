import { Router, Request, Response, NextFunction } from "express";
import { droneRoutes } from "../modules/drones/droneRoutes";
import { badRequest, successResponse } from "../utils";

const router = Router()

router.get("/", (_: Request, res: Response) => successResponse(res, 200));
router.use("/drones", droneRoutes)

router.use((_: Request, __: Response, next: NextFunction) => next({ code: 404, message: "Route Not found" }));
router.use((err: any, _: Request, res: Response, next: NextFunction) => {
    badRequest(res, 404, err.message)
    next()
});

export default router;