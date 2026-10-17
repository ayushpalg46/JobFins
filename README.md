# JobFins - Full Stack Recruitment & Job Portal

A comprehensive, two-sided Job Portal web application built with **Java (Spring Boot 3)**, **MySQL**, and **React.js**.

---

## 📋 8 Project Milestones Implementation

| # | Requirement | Implementation Details |
| :---: | :--- | :--- |
| **1** | **Dev Environment Setup** | Java 17+, Spring Boot 3 (Maven Wrapper), Node.js, and Vite. |
| **2** | **Static Web Page** | HTML5, CSS3, and Bootstrap 5 responsive static site in `static-page/` featuring top horizontal navbar and official `logo.svg`. |
| **3** | **Dynamic React Frontend** | React.js components (`JobCard`, `RecruiterDashboard`, `SeekerDashboard`, `HeroSearch`). |
| **4** | **Spring Boot REST Service** | REST Controllers (`/api/jobs`, `/api/applications`, `/api/dashboard/stats`, `/api/salary-guide`, `/api/companies`). |
| **5** | **MySQL Database Integration** | Hibernate / Spring Data JPA entities (`User`, `Job`, `Application`) and `JpaRepository`. |
| **6** | **JWT Authentication** | HMAC-SHA256 tokens (`JwtUtils`, `JwtAuthenticationFilter`, `SecurityConfig`, `BCryptPasswordEncoder`). |
| **7** | **React-Backend Connection** | Axios client passing `Authorization: Bearer <token>` header on all requests. |
| **8** | **Docker & GitHub Deployment** | `Dockerfile` for backend & frontend, `docker-compose.yml`, and `.gitignore`. |

---

## 🚀 Running the Project Locally

### 1. Spring Boot Backend
```bash
cd backend
./mvnw clean spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### 2. React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 3. Static Web Page Demo (Milestone 2)
Simply open `static-page/index.html` in any web browser.

### 4. Running with Docker Compose (Milestone 8)
```bash
docker compose up --build
```

---

---

## 🌐 Deploying to Render (Blueprint Deployment)

JobFins includes a production-ready `render.yaml` blueprint:

1. Connect your GitHub repository to **[Render](https://render.com/)**.
2. Create a **Blueprint Instance** referencing `render.yaml`.
3. Set your production MySQL / PostgreSQL credentials in the environment variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<host>:<port>/<dbname>?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC&useUnicode=true&characterEncoding=UTF-8`
   - `SPRING_DATASOURCE_USERNAME`: `<username>`
   - `SPRING_DATASOURCE_PASSWORD`: `<password>`
4. Render will automatically build the Spring Boot Docker backend and the Vite static frontend.

---

## 🔬 Core REST API Endpoints

- **Live Job Listings**: `GET /api/jobs`
- **Dashboard Metrics**: `GET /api/dashboard/stats`
- **Salary Guide**: `GET /api/salary-guide`
- **Company Directory**: `GET /api/companies`
- **Authentication**: `POST /api/auth/login` and `POST /api/auth/register`
