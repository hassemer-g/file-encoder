import {
    decodeBase91,
} from "./base91.js";
import {
    customBase91CharSet,
} from "./charsets.js";
import { valStringCharSet } from "./val.js";

const encodedString = document.getElementById("encodedString");
const retrieveButton = document.getElementById("retrieveButton");
const resultMessage = document.getElementById("resultMessageDec");
const downloadButton = document.getElementById("downloadButton");

let FILE_BYTES = null;

function valInput(input) {
    return typeof input === "string"
        && input.startsWith(`"F"`)
        && input.endsWith(`"`)
        && valStringCharSet(input.slice(3, -1), customBase91CharSet);
}

function valButton() {

    if (
        valInput(encodedString.value.trim())
    ) {
        retrieveButton.disabled = false;
        retrieveButton.style.backgroundColor = "green";
    } else {
        retrieveButton.disabled = true;
        retrieveButton.style.backgroundColor = "";
    }
}

encodedString.addEventListener("input", valButton);

retrieveButton.addEventListener("click", async () => {

    const encoded = encodedString.value.trim();

    try {
        FILE_BYTES = decodeBase91(encoded.slice(3, -1));
        if (FILE_BYTES && FILE_BYTES instanceof Uint8Array && FILE_BYTES.length) {
            resultMessage.textContent = `File successfully decoded! File byte length: ${FILE_BYTES.length}`;
            resultMessage.style.color = "green";
            downloadButton.disabled = false;
            downloadButton.style.backgroundColor = "darkorange";
        } else {
            FILE_BYTES = null;
            resultMessage.textContent = `Failed to decode file!`;
            resultMessage.style.color = "red";
            downloadButton.disabled = true;
            downloadButton.style.backgroundColor = "";
            return;
        }

    } catch (err) {
        FILE_BYTES = null;
        resultMessage.textContent = `Failed to decode file! Error: ${err.message}`;
        resultMessage.style.color = "red";
        downloadButton.disabled = true;
        downloadButton.style.backgroundColor = "";
        return;
    }
});

async function saveToFile(fileBytes, suggestedName = "download") {

    const blob = new Blob([fileBytes], { type: "application/octet-stream" });

    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName,
                types: [
                    {
                        description: "All Files",
                        accept: { "*/*": [".*"] },
                    }
                ],
            });

            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();

        } catch (err) {

            if (err.name !== "AbortError") {
                throw err;
            }
        }

    } else {

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = suggestedName;
        a.style.display = "none";

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            a.remove();
            URL.revokeObjectURL(url);
        }, 0);
    }
}

downloadButton.addEventListener("click", async () => {

    try {

        await saveToFile(FILE_BYTES, "retrieved_file");
        console.log("File successfully saved.");

    } catch (err) {
        console.error(`Error in save flow: ${err && err.message ? err.message : err}`);
        alert(`Failed to save file! Error: ${err && err.message ? err.message : err}`);
    }
});
