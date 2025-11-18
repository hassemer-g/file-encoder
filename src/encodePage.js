import {
    encodeBase91,
} from "./base91.js";

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const resultMessage = document.getElementById("resultMessageEnc");
const copyButton = document.getElementById("copyButton");

let FILE_STRING = null;

fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) processFileUpload(file);
});

["dragenter", "dragover"].forEach(evt =>
    dropZone.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("dragover");
    })
);

["dragleave", "drop"].forEach(evt =>
    dropZone.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("dragover");
    })
);

dropZone.addEventListener("drop", e => {
    const file = e.dataTransfer.files[0];
    if (file) processFileUpload(file);
});

function readFileAsUint8Array(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

async function processFileUpload(file) {
    let fileBytes;
    try {

        fileBytes = await readFileAsUint8Array(file);
        resultMessage.textContent = `File loaded successfully: ${file.name} (${fileBytes.length.toLocaleString()} bytes)`;
        resultMessage.style.color = "green";

    } catch (err) {
        resultMessage.textContent = "Error reading file: " + err.message;
        resultMessage.style.color = "red";
        fileBytes = undefined;

    } finally {

        fileInput.value = "";
    }

    if (fileBytes && fileBytes instanceof Uint8Array && fileBytes.length) {
        FILE_STRING = `"F"${encodeBase91(fileBytes)}"`;
        copyButton.disabled = false;
        copyButton.style.backgroundColor = "darkorange";
    } else {
        copyButton.disabled = true;
        copyButton.style.backgroundColor = "";
    }
}

copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(FILE_STRING)
    .then(() => {
        copyButton.textContent = "Copied!";
        setTimeout(() => copyButton.textContent = "Copy the Encoded File String", 5000);
    });
});
