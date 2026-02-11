# 🐾 DiagnoVet - Cloud-Native Medical PDF Pipeline

A high-performance REST API built with Node.js and Google Cloud Platform (GCP) to automate the extraction, processing, and storage of veterinary ultrasound reports.

## Live API Endpoint
**Base URL:** `https://vet-api-765024702651.us-central1.run.app`



---

##  Tech Stack

* **Runtime:** Node.js (Express.js)
* **Compute:** Google Cloud Run (Dockerized)
* **AI/OCR:** Google Document AI (V1)
* **Storage:** Google Cloud Storage (GCS)
* **Database:** Google Cloud Firestore
* **Security:** Google Secret Manager & IAM roles

---

##  Key Features & GCP Pillars

###  1. Authentication & Security
* **API Key Protection:** All endpoints are protected via an `x-api-key` header, managed through **Google Secret Manager**.
* **IAM Roles:** Followed the "Principle of Least Privilege." The Cloud Run service account only has specific permissions for Storage, Firestore, and Document AI.

###  2. Scalability
* **Serverless Execution:** Cloud Run scales horizontally to handle concurrent PDF processing and scales to zero when not in use.

### 3. Image Asset Management
* **Extraction:** Uses `pdfjs-dist` to navigate the PDF object tree and `Sharp` for high-performance image processing.
* **Privacy:** Generates **V4 Signed URLs** for assets, ensuring that medical images are not publicly exposed but accessible for authorized users.

---

##  API Documentation

### 1. Upload Report
Extracts data and images from a PDF.
* **URL:** `/api/reports/upload`
* **Method:** `POST`
* **Headers:** `x-api-key: your_key`
* **Body (form-data):** `report: [PDF_FILE]`

### 2. Get Report
Retrieves structured data by ID.
* **URL:** `/api/reports/:id`
* **Method:** `GET`
* **Headers:** `x-api-key: your_key`

