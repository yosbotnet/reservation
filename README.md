# Surgery Clinic Management System

A comprehensive management system for surgery clinics, handling patient bookings, surgery scheduling, and post-operative care.

## Features

- Patient management and medical records
- Doctor scheduling and availability
- Surgery scheduling and tracking
- Post-operative care management
- Nursing staff coordination
- Equipment tracking
- Statistical reporting

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/surgery_clinic"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
JWT_SECRET=your-secret-key
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Build and start the server:
```bash
npm run build
npm start
```

## API Endpoints

### Patient Management

```
POST /api/patients
- Create new patient
- Body: { CF, nome, cognome, email, telefono?, gruppo_sanguigno?, allergie?, patologie_croniche? }

GET /api/patients
- List all patients

GET /api/patients/:cf
- Get patient details

PATCH /api/patients/:cf
- Update patient information
- Body: { nome?, cognome?, email?, telefono?, gruppo_sanguigno?, allergie?, patologie_croniche? }
```

### Doctor Management

```
POST /api/doctors
- Register new doctor
- Body: { CF, nome, cognome, email, telefono?, num_albo, specializzazione, data_assunzione, qualifica, livello_accesso }

GET /api/doctors
- List all doctors

GET /api/doctors/:cf
- Get doctor details

PATCH /api/doctors/:cf
- Update doctor information

POST /api/doctors/:cf/availability
- Add doctor availability
- Body: { data, ora_inizio, ora_fine }

GET /api/doctors/:cf/availability
- Get doctor's availability schedule
```

### Surgery Management

```
POST /api/surgeries
- Schedule new surgery
- Body: { CF_paziente, codice_tipo, numero_sala, data_ora, durata_prevista, medici }

GET /api/surgeries
- List all surgeries
- Query: startDate?, endDate?

GET /api/surgeries/:id
- Get surgery details

PATCH /api/surgeries/:id
- Update surgery status
- Body: { stato, data_ora?, numero_sala?, durata_prevista? }

POST /api/surgeries/:id/drugs
- Record administered drugs
- Body: { drugs: [{ codice_farmaco, quantita }] }

GET /api/surgeries/statistics
- Get surgery statistics
```

### Nursing Management

```
POST /api/nursing
- Register new nurse
- Body: { CF, nome, cognome, email, telefono?, reparto, data_assunzione, qualifica, livello_accesso }

GET /api/nursing/:cf
- Get nurse details

POST /api/nursing/shifts
- Create new shift
- Body: { data, ora_inizio, ora_fine, tipo_turno }

POST /api/nursing/shifts/:shiftId/assign
- Assign nurse to shift
- Body: { CF_infermiere }

GET /api/nursing/:cf/workload
- Get nurse's workload statistics
```

### Post-operative Care

```
POST /api/post-op
- Create care record
- Body: { id_intervento, CF_medico, note, parametri_vitali, medicazioni?, terapia?, complicanze? }

GET /api/post-op/intervention/:interventionId
- Get post-op records for surgery

PATCH /api/post-op/:id
- Update care record
- Body: { note?, parametri_vitali?, medicazioni?, terapia?, complicanze? }

GET /api/post-op/statistics/:interventionId
- Get post-op care statistics
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error

Error responses follow the format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Type Definitions

Key TypeScript interfaces are available in the `src/types` directory:
- `patient.ts`: Patient-related types
- `doctor.ts`: Doctor-related types
- `surgery.ts`: Surgery-related types
- `nursing.ts`: Nursing-related types
- `postOp.ts`: Post-operative care types

## Project Structure

```
src/
├── config/          # Configuration management
├── types/           # TypeScript interfaces
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Shared utilities
├── app.ts          # Express application setup
├── server.ts       # Server entry point
└── index.ts        # Public exports
```

## Development

1. Run in development mode:
```bash
npm run dev
```

2. Run tests:
```bash
npm test
```

3. Lint code:
```bash
npm run lint
```

4. Generate Prisma client:
```bash
npx prisma generate
```

## License

MIT