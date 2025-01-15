# Database Architecture Guide

## Core Concepts

### Database Singleton
```typescript
// src/config/database.ts
class Database {
  private static instance: Database;
  private prisma: PrismaClient;
}
```
The database connection is managed through a singleton pattern to ensure:
- Single connection pool
- Consistent transaction handling
- Centralized error management

### Transaction Management
```typescript
// Usage in services
await db.transaction(async (prisma) => {
  // All operations here are atomic
  const a = await prisma.tableA.create({...});
  const b = await prisma.tableB.create({...});
  return { a, b };
});
```

## Data Flow Patterns

### 1. Patient Registration Flow
```typescript
// Service layer
async createPatient(data: CreatePatientRequest) {
  return db.transaction(async (prisma) => {
    // 1. Create base person record
    const persona = await prisma.persona.create({
      data: {
        CF: data.CF,
        nome: data.nome,
        cognome: data.cognome,
        email: data.email
      }
    });

    // 2. Create patient record
    const patient = await prisma.paziente.create({
      data: {
        CF: data.CF,
        gruppo_sanguigno: data.gruppo_sanguigno,
        allergie: data.allergie
      }
    });

    // 3. Create medical record
    const record = await prisma.cartella_clinica.create({
      data: {
        CF_paziente: data.CF,
        data_apertura: new Date()
      }
    });

    return { patient, record };
  });
}
```

### 2. Surgery Scheduling Flow
```typescript
async scheduleSurgery(data: CreateSurgeryRequest) {
  return db.transaction(async (prisma) => {
    // 1. Verify room availability
    const roomCheck = await prisma.intervento.findFirst({
      where: {
        numero_sala: data.numero_sala,
        data_ora: {
          gte: data.data_ora,
          lt: // end time calculation
        }
      }
    });

    if (roomCheck) throw new ConflictError();

    // 2. Create surgery record
    const surgery = await prisma.intervento.create({
      data: {
        CF_paziente: data.CF_paziente,
        numero_sala: data.numero_sala,
        data_ora: data.data_ora
      }
    });

    // 3. Assign medical staff
    await prisma.medici_intervento.createMany({
      data: data.medici.map(m => ({
        id_intervento: surgery.id,
        CF_medico: m.CF_medico
      }))
    });

    return surgery;
  });
}
```

## Key Database Operations

### Read Operations
```typescript
// Single record with relations
const patient = await prisma.paziente.findUnique({
  where: { CF },
  include: {
    persona: true,
    cartella_clinica: true
  }
});

// Filtered list with pagination
const surgeries = await prisma.intervento.findMany({
  where: {
    data_ora: {
      gte: startDate,
      lte: endDate
    }
  },
  include: {
    paziente: {
      include: {
        persona: true
      }
    }
  },
  skip: page * limit,
  take: limit
});
```

### Write Operations
```typescript
// Create with relations
await prisma.cura_post_operativa.create({
  data: {
    id_intervento: interventionId,
    CF_medico: doctorId,
    parametri_vitali: JSON.stringify(vitalSigns),
    intervento: {
      connect: { id: interventionId }
    },
    medico: {
      connect: { CF: doctorId }
    }
  }
});

// Update with conditions
await prisma.intervento.update({
  where: { id },
  data: {
    stato: 'completed',
    data_fine: new Date()
  }
});
```

## Error Handling

### Transaction Errors
```typescript
try {
  await db.transaction(async (prisma) => {
    // operations
  });
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    // Handle Prisma-specific errors
    switch (error.code) {
      case 'P2002': // Unique constraint
        throw new ConflictError();
      case 'P2025': // Not found
        throw new NotFoundError();
    }
  }
  throw error;
}
```

### Validation Errors
```typescript
// Before database operations
if (!isValidCF(CF)) {
  throw new ValidationError('Invalid CF format');
}

if (endDate < startDate) {
  throw new ValidationError('Invalid date range');
}
```

## Performance Tips

1. Use Transactions Wisely
   - Group related operations
   - Keep transactions short
   - Handle rollbacks properly

2. Optimize Queries
   - Include only needed relations
   - Use appropriate indexes
   - Implement pagination

3. Connection Management
   - Reuse the database singleton
   - Handle connection errors
   - Implement proper shutdown