// utils/auditLogger.js
export const logAuditEvent = async (db, event) => {
  try {
    const auditEvent = {
      ...event,
      timestamp: new Date(),
      userAgent: event.userAgent || 'Unknown',
      ipAddress: event.ipAddress || 'Unknown'
    };
    
    await db.collection('audit_logs').insertOne(auditEvent);
    console.log('📝 Audit event logged:', event.action);
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};

// Audit event types
export const AuditActions = {
  PAYMENT_CREATED: 'PAYMENT_CREATED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  TRANSACTION_UPDATED: 'TRANSACTION_UPDATED',
  USER_ACCESSED: 'USER_ACCESSED',
  ADMIN_ACTION: 'ADMIN_ACTION'
};