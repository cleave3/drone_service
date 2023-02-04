import cron from "node-cron";
import Jobs from "./modules/jobs";
import app from "./server";

const PORT = process.env.PORT || 8000;

// Run background task every 10 minutes
cron.schedule("*/10 * * * *", () => {
    Jobs.backgroundTask();
});

app.listen(PORT, () => console.log(`App is running on ${PORT}`));
