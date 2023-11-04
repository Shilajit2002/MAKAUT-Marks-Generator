// Button Upload ID
const btnUpload = document.getElementById("btnUpload");
// Input File ID
const inpFile = document.getElementById("inpFile");

// Files Upload Box
const fileUpload = document.getElementsByClassName("files-upload")[0];

// Details Box ID
const details = document.getElementById("details");

// Paper Name ID
const paperName = document.getElementById("paper-name");
// Paper Code ID
const paperCode = document.getElementById("paper-code");
// Total Theory Full Marks ID
const theoryFullMarks = document.getElementById("theory-full");
// Total Theory Obtained Marks ID
const theoryObtainedMarks = document.getElementById("theory-obt");
// Total Practical Full Marks ID
const practicalFullmarks = document.getElementById("prac-full");
// Total Practical Obtained Marks ID
const practicalObtainedMarks = document.getElementById("prac-obt");
// Paper Code with Grade Points ID
const paperCodeGradePoint = document.getElementById("paper-code-grade-points");

// SGPA ID
const sgpas = document.getElementById("sgpas");
// CGPA ID
const cgpas = document.getElementById("cgpa");

// CGPA Variable
let cgpa = 0;

// Show Data Func
const showData = (extractedTxt, f) => {

    // Extract All the Details from Extracted Text
    const { sem, sgpa, theoryMarks, theoryMarksObtained, pracMarks, pracMarksObtained, totalTheorySub, totalPracSub } = extractedTxt.pop();

    // Take Paper Names for Perticular Semester
    const paperNames = extractedTxt.map(item => item.papername).join(", ");

    // Take Paper Codes for Perticular Semester
    const paperCodes = extractedTxt.map(item => item.code).join(", ");

    // Take Paper Codes with Grade Points for Perticular Semester
    const paperCodeGradePoints = extractedTxt.map(item => item.code + " - " + item.points + " (" + item.grade + ") ").join(", ");

    // Append Paper Names
    const node = document.createElement("li");
    node.textContent = `• ${sem} : ${paperNames}.`;
    paperName.appendChild(node);

    // Append Paper Code
    const codeNode = document.createElement("li");
    codeNode.textContent = `• ${sem} : ${paperCodes}.`;
    paperCode.appendChild(codeNode);

    // Append Theory Full Marks
    const theoryFullNode = document.createElement("li");
    theoryFullNode.textContent = `• ${sem} : ${theoryMarks}`;
    theoryFullMarks.appendChild(theoryFullNode);

    // Append Theory Obtained Marks
    const theoryObtNode = document.createElement("li");
    theoryObtNode.textContent = `• ${sem} : ${theoryMarksObtained}`;
    theoryObtainedMarks.appendChild(theoryObtNode);

    // Append Practical Full Marks
    const pracFullNode = document.createElement("li");
    pracFullNode.textContent = `• ${sem} : ${pracMarks}`;
    practicalFullmarks.appendChild(pracFullNode);

    // Append Practical Obtained Marks
    const pracObtNode = document.createElement("li");
    pracObtNode.textContent = `• ${sem} : ${pracMarksObtained}`;
    practicalObtainedMarks.appendChild(pracObtNode);

    // Append Paper Code With Grade Points
    const pCGPNode = document.createElement("li");
    pCGPNode.textContent = `• ${sem} : ${paperCodeGradePoints}.`;
    paperCodeGradePoint.appendChild(pCGPNode);

    // Append SGPA
    const sgpaNode = document.createElement("li");
    sgpaNode.textContent = `• ${sem} : ${sgpa}`;
    sgpas.appendChild(sgpaNode);

    cgpa += parseFloat(sgpa);

    if (f === inpFile.files.length - 1) {
        cgpa /= (f + 1);

        // Append CGPA
        const cgpaNode = document.createElement("li");
        cgpaNode.textContent = `${cgpa.toFixed(2)}`;
        cgpas.appendChild(cgpaNode);
    }

    // Result Data as Table Format
    const tableRows = `
    <h6>${sem}</h6>
    <table class="table ${f % 2 === 0 ? "table-light" : "table-dark"} table-striped table-hover table-bordered">
        <thead>
            <tr>
                <th>Paper Code</th>
                <th>Paper Name</th>
                <th>Grade</th>
                <th>Points</th>
                <th>Type</th>
            </tr>
        </thead>
        <tbody>
            ${extractedTxt.map(item => `
                <tr>
                    <td>${item.code}</td>
                    <td>${item.papername}</td>
                    <td>${item.grade}</td>
                    <td>${item.points}</td>
                    <td>${item.type}</td>
                </tr>
            `).join("")}
        </tbody>
    </table>
    `;

    // Append Table
    const tabNode = document.createElement("div");
    tabNode.innerHTML = tableRows;
    details.appendChild(tabNode);
};

// Upload Click Event Listener
btnUpload.addEventListener("click", () => {
    if (inpFile.files.length > 0) {
        // Get all the pdf files
        const pdfFiles = Array.from(inpFile.files).filter(file => file.type.includes("pdf"));

        // If Pdf Files Present
        if (pdfFiles.length > 0) {
            pdfFiles.forEach((file, index) => {
                const formData = new FormData();
                formData.append("pdfFile", file);

                // Send File to Server for Extracting Text from PDF
                fetch("/extract-text", {
                    method: "post",
                    body: formData,
                })
                    .then((res) => {
                        if (!res.ok) {
                            throw new Error(`HTTP error! status: ${res.status}`);
                        }
                        return res.json();
                    })
                    .then((extractedTxt) => {
                        // Show Data Func
                        showData(extractedTxt, index);
                    })
                    .catch((error) => {
                        // Handle Error
                        console.error('Error:', error);
                    });
            });
        } else {
            // Handle Case: No PDF files selected
            console.log("No PDF files selected.");
        }
    } else {
        // Handle Case: No files selected
        console.log("No files selected.");
    }
});

// File Change Event Listener
inpFile.addEventListener("change", () => {
    // Filter PDF files
    const pdfFiles = Array.from(inpFile.files).filter(file => file.type.includes("pdf"));

    // If Pdf Files Present
    if (pdfFiles.length > 0) {
        // Input Files Loop (for PDF files only)
        pdfFiles.forEach(file => {
            let x = `<img src="./assets/pdfImg.png" alt="" />
        <br>
        ${file.name}`;

            // Append PDF Files
            const downNode = document.createElement("div");
            downNode.className = "down";
            downNode.innerHTML = x;
            fileUpload.appendChild(downNode);
        });
    } else {
        // Handle Case: No PDF files selected
        console.log("No PDF files selected.");
    }
});