const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const pdfViewer = document.getElementById('pdfViewer');
const questionField = document.getElementById('questionField');
const askButton = document.getElementById('askButton');
const answer = document.getElementById('answer');
const summaryElement = document.getElementById('summary');
const loadingIndicator = document.getElementById('loading');
const paginationControls = document.getElementById('paginationControls');
const zoomControls = document.getElementById('zoomControls');
const loginButton = document.getElementById('loginButton');
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');

let pdfDoc = null;
let extractedText = '';
let currentPage = 1;
let totalPages = 0;
let scale = 1.0;

loginButton.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'user' && password === 'password') {
        loginScreen.style.display = 'none';
        appScreen.style.display = 'flex';
    } else {
        alert('Invalid credentials');
    }
});

uploadButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file || file.type !== 'application/pdf') {
        alert('Please upload a valid PDF file.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
            pdfDoc = pdf;
            totalPages = pdf.numPages;
            console.log('PDF loaded');
            loadPage(currentPage);
        }).catch(function(error) {
            alert('Error loading PDF: ' + error.message);
        });
    };
    fileReader.readAsArrayBuffer(file);
});

function loadPage(pageNum) {
    loadingIndicator.style.display = 'block';
    pdfDoc.getPage(pageNum).then(page => {
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        pdfViewer.innerHTML = '';
        pdfViewer.appendChild(canvas);

        page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
            return page.getTextContent();
        }).then(textContent => {
            extractedText = textContent.items.map(item => item.str).join(' ');
            loadingIndicator.style.display = 'none';
            updatePaginationControls();
            updateZoomControls();
        });
    });
}

function updatePaginationControls() {
    paginationControls.innerHTML = '';
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.className = 'pageButton';
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadPage(currentPage);
            }
        });
        paginationControls.appendChild(prevButton);
    }
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.className = 'pageButton';
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadPage(currentPage);
            }
        });
        paginationControls.appendChild(nextButton);
    }
}

function updateZoomControls() {
    zoomControls.innerHTML = '';
    const zoomInButton = document.createElement('button');
    zoomInButton.textContent = 'Zoom In';
    zoomInButton.className = 'zoomButton';
    zoomInButton.addEventListener('click', () => {
        scale += 0.1;
        loadPage(currentPage);
    });
    zoomControls.appendChild(zoomInButton);

    const zoomOutButton = document.createElement('button');
    zoomOutButton.textContent = 'Zoom Out';
    zoomOutButton.className = 'zoomButton';
    zoomOutButton.addEventListener('click', () => {
        if (scale > 0.2) {
            scale -= 0.1;
            loadPage(currentPage);
        }
    });
    zoomControls.appendChild(zoomOutButton);
}

updateZoomControls();

askButton.addEventListener('click', () => {
    const question = questionField.value.toLowerCase();
    const words = extractedText.toLowerCase().split(/\s+/);
    const wordIndex = words.indexOf(question);

    if (wordIndex !== -1) {
        answer.textContent = 'Found the word in the document!';
    } else {
        answer.textContent = 'Word not found in the document.';
    }
});

function createSummary(text) {
    return 'This is a summary of the document...';
}

document.getElementById('showSummary').addEventListener('click', () => {
    const summaryText = createSummary(extractedText);
    summaryElement.textContent = summaryText;
});

document.getElementById('submitFeedback').addEventListener('click', () => {
    const feedback = document.getElementById('feedbackText').value;
    if (feedback) {
        console.log('Feedback submitted:', feedback);
        alert('Thank you for your feedback!');
        document.getElementById('feedbackText').value = '';
    } else {
        alert('Please provide some feedback before submitting.');
    }
});
