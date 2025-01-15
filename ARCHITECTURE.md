# Surgery Clinic System Architecture

## Database Layer

### Database Connection (src/config/database.ts)
The database connection is managed through a singleton pattern:
```typescript
class Database {
  private static instance: Database;
  private prisma: PrismaClient;
  private isConnected: boolean = false;
}
```

Key features:
- Single database instance across the application
- Connection state management
- Transaction support
- Health check functionality

### Transaction Handling
Transactions are handled using Prisma's transaction API:
```typescript
public async transaction<T>(
  fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T>
```

Usage example:
```typescript
await db.transaction(async (prisma) => {
  const patient = await prisma.paziente.create({...});
  const record = await prisma.cartella_clinica.create({...});
  return { patient, record };
});
```

## Service Layer

Each service interacts with the database through the Database singleton:

### Patient Service
```typescript
class PatientService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = db.getClient();
  }

  async createPatient() {
    return db.transaction(async (prisma) => {
      // Create persona first
      const persona = await prisma.persona.create({...});
      // Then create paziente
      return prisma.paziente.create({...});
    });
  }
}
```

### Doctor Service
```typescript
class DoctorService {
  async addAvailability() {
    // Check for existing availability
    const existing = await this.prisma.calendario_disponibilita.findFirst({...});
    if (existing) throw new ConflictError();
    
    // Create new availability
    return this.prisma.calendario_disponibilita.create({...});
  }
}
```

### Surgery Service
```typescript
class SurgeryService {
  async createSurgery() {
    return db.transaction(async (prisma) => {
      // Create surgery
      const surgery = await prisma.intervento.create({...});
      // Assign doctors
      await prisma.medici_intervento.createMany({...});
      return surgery;
    });
  }
}
```

## API Layer

The API layer connects HTTP endpoints to services through Express routes:

### Route Organization
Each domain has its own router file:
```
src/routes/
├── patient.ts    # Patient-related endpoints
├── doctor.ts     # Doctor management
├── surgery.ts    # Surgery scheduling
├── nursing.ts    # Nurse assignments
└── postOp.ts     # Post-operative care
```

### Request Flow
1. HTTP Request → Express Router
2. Middleware Processing (validation, auth)
3. Route Handler → Service Method
4. Service → Database Transaction
5. Response Formatting → HTTP Response

Example:
```typescript
// Route definition
router.post('/', 
  validateRequest(createPatientSchema),
  asyncHandler(async (req, res) => {
    const patient = await patientService.createPatient(req.body);
    res.status(201).json(patient);
  })
);

// Service call
const patient = await db.transaction(async (prisma) => {
  // Database operations
});
```

### Validation Layer
Request validation happens before reaching services:
```typescript
const createPatientSchema = {
  CF: [required('CF'), isString('CF')],
  nome: [required('nome'), isString('nome')],
  email: [required('email'), isEmail('email')]
};
```

## Database Schema

### Core Tables
1. `persona`: Base table for all people
   - Contains common fields: CF, nome, cognome, email, telefono
   - Referenced by paziente and personale

2. `paziente`: Patient-specific information
   - Extends persona with medical details
   - Links to cartella_clinica and polizza_assicurativa

3. `personale`: Staff information
   - Extends persona with employment details
   - Referenced by medico and infermiere

### Medical Records
1. `cartella_clinica`: Patient medical records
   - Links to paziente
   - Contains diagnosi and date information
   - Referenced by esame_pre_operatorio and visita_controllo

2. `intervento`: Surgery records
   - Links to paziente, sala_operatoria, and tipo_intervento
   - Tracks surgery status and timing
   - Referenced by cura_post_operativa and farmaci_intervento

### Staff Management
1. `medico`: Doctor information
   - Links to personale
   - Contains specialization and registration details
   - Referenced by calendario_disponibilita and medici_intervento

2. `infermiere`: Nurse information
   - Links to personale
   - Contains department assignment
   - Referenced by turni_infermiere

### Resource Management
1. `sala_operatoria`: Operating rooms
   - Contains room details and type
   - Referenced by intervento and attrezzatura

2. `attrezzatura`: Equipment tracking
   - Links to sala_operatoria
   - Tracks maintenance schedules

## Data Flow Examples

### Patient Registration
1. Create persona record
2. Create paziente record
3. Create cartella_clinica record
4. Optionally create polizza_assicurativa

### Surgery Scheduling
1. Check doctor availability
2. Check operating room availability
3. Create intervento record
4. Create medici_intervento records
5. Schedule post-operative care

### Post-operative Care
1. Create cura_post_operativa record
2. Record vital parameters
3. Track medications through farmaci_intervento
4. Schedule follow-up visits

## Error Handling

The database layer includes comprehensive error handling:
```typescript
try {
  await operation();
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    // Handle Prisma-specific errors
  } else if (error instanceof ConflictError) {
    // Handle business logic conflicts
  } else {
    // Handle unexpected errors
  }
}
```

## Transaction Patterns

### Simple Transaction
```typescript
await db.transaction(async (prisma) => {
  const result = await prisma.table.create({...});
  return result;
});
```

### Complex Transaction
```typescript
await db.transaction(async (prisma) => {
  const a = await prisma.tableA.create({...});
  const b = await prisma.tableB.create({...});
  await prisma.tableC.createMany({...});
  return { a, b };
});
```

### Nested Operations
```typescript
await db.transaction(async (prisma) => {
  const main = await prisma.main.create({...});
  const details = await Promise.all(
    items.map(item => prisma.detail.create({...}))
  );
  return { main, details };
});
```

## Performance Considerations

1. Connection Pooling
   - Single PrismaClient instance
   - Managed through Database singleton

2. Transaction Boundaries
   - Keep transactions as short as possible
   - Group related operations

3. Query Optimization
   - Use appropriate includes
   - Avoid N+1 queries through proper relation loading

4. Error Recovery
   - Automatic rollback on transaction failure
   - Connection recovery on network issues

## Security Considerations

1. Input Validation
   - Request validation middleware
   - Type checking
   - Data sanitization

2. Transaction Isolation
   - Proper transaction boundaries
   - Consistent error handling
   - Rollback on failure

3. Error Handling
   - Safe error messages
   - Logging without sensitive data
   - Proper error propagation