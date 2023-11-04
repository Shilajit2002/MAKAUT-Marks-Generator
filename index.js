// Import dotenv
require('dotenv').config({ path: './.env' });

// Import Express
const express = require('express');
// Import Express File Upload
const fileUpload = require("express-fileupload");
// Import Pdf Parse
const pdfParse = require("pdf-parse");

// Import Year Array
const year = require("./year");

// Create App
const app = express();

// Get the Port
const port = process.env.PORT || 5000;

// Backend URL
const bUrl = process.env.BACKEND_URL;

// Use File Upload
app.use(fileUpload());

// Use HTML file
app.use("/", express.static("./public"));

// Extract Text API
app.post("/extract-text", async (req, res) => {
    try {
        // If data is not present
        if (!req.files || !req.files.pdfFile) {
            return res.status(404).send("File not found");
        }

        // Get Text Data
        const textData = await pdfParse(req.files.pdfFile.data);

        // Convert to Text
        let data = textData.text;

        /* All Variables */
        let code = "";
        let papername = "";
        let grade = "";
        let points = 0;
        let type = "Theory";

        /* All Variables */
        let theoryMarks = 0;
        let theoryMarksObtained = 0;
        let pracMarks = 0;
        let pracMarksObtained = 0;
        let totalTheorySub = 0;
        let totalPracSub = 0;

        let val = [];
        let flag = false;

        // Get Total SGPA Text
        let sgpa = data.substring(data.indexOf("SGPA"), data.indexOf("\n", data.indexOf("SGPA")));

        // Sem Variable
        let sem = "";

        // Get Total Result Text
        let result = data.substring(data.indexOf("RESULT"), data.indexOf("\n", data.indexOf("RESULT")));

        // Find Semester using year file
        for (const y of year) {
            if (sgpa.includes(y)) {
                sem = "Sem " + y[0];
                break;
            }
        }

        // Find the SGPA
        sgpa = sgpa.split(" ")[sgpa.split(" ").length - 2];

        // Find the Result Pass or Backlog
        result = result.split(" ")[result.split(" ").length - 3];

        // Start Index for Cropping Data
        let startIndex = data.lastIndexOf("PointsCredit") + "PointsCredit ".length + "Credit  Points ".length;//480
        // End Index for Cropping Data
        let endIndex = data.indexOf("Total");

        // Extract relevant data
        data = data.substring(startIndex, endIndex);

        data = data.split("\n").join(" ");

        for (let i = 0; i < data.length; i++) {

            if (data[i] && data[i + 1] && data[i] === data[i].toUpperCase() && data[i + 1] === data[i + 1].toLowerCase() && isNaN(data[i]) && isNaN(data[i + 1]) && data[i] !== "-" && data[i + 1] !== "-") {
                flag = true;

                for (let j = i; j < data.length; j++) {
                    papername += data[j];

                    if ((!isNaN(data[j + 2]) && data[j + 2] !== " " && data[j + 2] !== "" && data[j + 1] !== " " && data[j + 1] !== "")) {
                        grade = data[j + 1];
                        i = j + 2;
                        break;
                    }
                    else if (data.slice(j + 1, j + 7).split(" ").join("") === "Q#") {
                        grade = "Q#";
                        i = j + 7;
                        break;
                    }
                }
            }

            if (!flag) {
                code += data[i];
            }

            else {
                let indexOfNewline = data.indexOf(" ", i);
                let x = indexOfNewline !== -1 ? data.substring(i, indexOfNewline) : data.substring(i);

                if (x.length === 5) {
                    points = parseInt(data[i]);
                    i = data.indexOf(" ", i);
                }
                if (x.length === 6) {
                    points = parseInt(data[i]);
                    i = data.indexOf(" ", i);
                }
                if (x.length === 7) {
                    points = parseInt(data[i] + data[i + 1]);
                    i = data.indexOf(" ", i);
                }

                flag = false;

                if (code[code.length - 1] === " " && code.includes("IT ")) {
                    code = code.slice(0, code.length - 3);

                    papername = "IT " + papername;
                }
                val.push({
                    code,
                    papername,
                    grade,
                    points,
                    type
                })

                code = "";
                papername = "";
                grade = "";
                points = 0;
                type = "Theory";

            }
        }

        for (let i = 0; i < val.length; i++) {
            let s = val[i].papername.split(" ")[0];

            for (let j = i + 1; j < val.length; j++) {
                let f = val[j].papername.split(" ")[0];

                if (s === f) {
                    val[j].type = "Practical";
                }
                else if (s === "Workshop/Manufacturing" || s === "Engineering" || s === "Language" || s === "IT") {
                    val[i].type = "Practical";
                }
            }

            if (val[i].grade === "Q#" || val[i].code.includes("PROJ")) {
                val[i].type = "Optional";
            }

            if (i + 1 === val.length) {
                if (s === "Workshop/Manufacturing" || s === "Engineering" || s === "Language" || s === "IT") {
                    val[i].type = "Practical";
                }
            }

            if (val[i].type === "Theory") {
                theoryMarks += 1;
                totalTheorySub += 1;
                theoryMarksObtained += val[i].points;
            } else if (val[i].type === "Practical") {
                pracMarks += 1;
                totalPracSub += 1;
                pracMarksObtained += val[i].points;
            }
        }

        theoryMarksObtained = ((((theoryMarksObtained / totalTheorySub) - 0.75) * 10) * totalTheorySub).toFixed(2);
        pracMarksObtained = ((((pracMarksObtained / totalPracSub) - 0.75) * 10) * totalPracSub).toFixed(2);

        theoryMarks = `100 x ${theoryMarks} = ${100 * theoryMarks}`;
        pracMarks = `100 x ${pracMarks} = ${100 * pracMarks}`;

        val.push({
            theoryMarks,
            theoryMarksObtained,
            pracMarks,
            pracMarksObtained,
            totalTheorySub,
            totalPracSub,
            sem,
            sgpa,
            result
        });

        // Send the extracted data as a response
        res.status(200).json(val);
    } catch (error) {
        res.status(500).send("Error parsing PDF: " + error.message);
    }
});

app.all("*", (req, res) => {
    res.status(404).send("`~` Page Not Found `~`");
})

app.listen(port, () => {
    console.log(`Server Running at Port ${port}`);
    console.log(`Server Running at ${bUrl}`);
})