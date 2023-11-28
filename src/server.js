require("dotenv/config")
 require("express-async-errors");
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const migrationsRun = require("./database/sqlite/migrations")
const AppError = require("./utils/AppError");
const uploadConfig = require("./configs/upload");

migrationsRun();

const app = express();
app.use(cors())
app.use(express.json());
app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER));
app.use(routes);

app.use((error, req, res, next) => {
    if(error instanceof AppError){
        return res.status(error.statusCode).json({
            error:"error",
            message:error.message
        })
    }

    console.log(error)
    
    return res.status(500).json({
       error:"error",
       message: "Internal server error"
    })
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))